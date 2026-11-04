'use strict';
/* RPsy online: accounts that follow you across devices, leaderboard, live multiplayer battles.
   Talks to the Cloudflare Worker in /worker (same origin by default, or window.RPSY_API). Works offline as a guest. */
window.OL=(()=>{
const API=(window.RPSY_API||'').replace(/\/$/,'');
let AU=null;try{AU=JSON.parse(localStorage.getItem('rpsy_auth')||'null')}catch(e){}
let tq=0,tq0=0,st=AU?'idle':'out',lastSync=0;
const user=()=>AU&&AU.user,setAuth=a=>{AU=a;try{a?localStorage.setItem('rpsy_auth',JSON.stringify(a)):localStorage.removeItem('rpsy_auth')}catch(e){}};
const localSave=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const lvOf=xp=>Math.floor(Math.sqrt((xp||0)/40))+1;
async function api(path,o={}){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),12000);
  try{const r=await fetch(API+path,{...o,signal:ctl.signal,headers:{'content-type':'application/json',...(AU?{authorization:'Bearer '+AU.token}:{}),...(o.headers||{})}});
    let d={};try{d=await r.json()}catch(e){if(r.ok||r.status===404){const x=new Error('Online features are not available here. Open the app from its main website to sign in.');x.status=404;throw x}}
    if(!r.ok){const e=new Error(d.error||'Error '+r.status);e.status=r.status;throw e}return d}
  catch(e){if(e.name==='AbortError'){const x=new Error('Server did not respond. Check your connection.');x.status=0;throw x}throw e}finally{clearTimeout(t)}}

/* ---- merge local and cloud progress (never loses progress: takes the best of both) ---- */
function merge(L,R){const base=(R.xp||0)>(L.xp||0)?R:L,oth=base===R?L:R,o=JSON.parse(JSON.stringify(base)),d=init();
  Object.keys(d).forEach(k=>{if(o[k]===undefined)o[k]=d[k]});
  o.set=Object.assign(d.set,L.set);o.p=L.p||o.p;
  o.fa=Object.assign({},oth.fa,base.fa);
  o.done={};for(const k of new Set([...Object.keys(L.done||{}),...Object.keys(R.done||{})])){const a=(L.done||{})[k],b=(R.done||{})[k];o.done[k]=!a?b:!b?a:(a.a>=b.a?a:b)}
  const seen=new Set(),err=[];[...(base.err||[]),...(oth.err||[])].forEach(e=>{const k=e.s+'.'+e.i;if(!seen.has(k)&&o.fa[k]!==1){seen.add(k);err.push(e)}});o.err=err;
  o.cards={};for(const k of new Set([...Object.keys(L.cards||{}),...Object.keys(R.cards||{})])){const a=(L.cards||{})[k],b=(R.cards||{})[k];o.cards[k]=!a?b:!b?a:((a.seen||0)>=(b.seen||0)?a:b)}
  const hs=new Set(),hist=[];[...(oth.hist||[]),...(base.hist||[])].forEach(h=>{const k=JSON.stringify(h);if(!hs.has(k)){hs.add(k);hist.push(h)}});o.hist=hist.slice(-60);
  o.story={};for(const id of new Set([...Object.keys(L.story||{}),...Object.keys(R.story||{})])){const a=(L.story||{})[id]||{},b=(R.story||{})[id]||{};o.story[id]={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))o.story[id][k]=Math.max(a[k]||0,b[k]||0)}
  o.badges=Object.assign({},oth.badges,base.badges);o.les=Object.assign({},oth.les,base.les);
  o.tot={};for(const k of Object.keys(d.tot))o.tot[k]=Math.max((L.tot||{})[k]||0,(R.tot||{})[k]||0);
  const lat=(L.last||'')>=(R.last||'')?L:R;o.last=lat.last||'';o.streak=lat.streak||0;
  o.daily=(L.daily||'')>(R.daily||'')?L.daily:R.daily||'';o.day=((L.day||{}).d||'')>=((R.day||{}).d||'')?L.day:R.day;o.hero=base.hero||oth.hero||'';o.xp=Math.max(L.xp||0,R.xp||0);o.sess=null;return o}
async function pull(){const r=await api('/api/me');AU.user=r.user;setAuth(AU);
  if(r.progress&&r.progress.data&&typeof r.progress.data==='object'){const keep=S.sess;S=merge(S,r.progress.data);S.sess=keep;localSave()}await push()}
async function push(){if(!AU)return;clearTimeout(tq);tq=0;tq0=0;const d=JSON.parse(JSON.stringify(S));delete d.sess;st='sync';paint();
  try{await api('/api/progress',{method:'PUT',body:JSON.stringify({data:d})});st='ok';lastSync=Date.now()}
  catch(e){if(e.status===401){setAuth(null);st='out';toast('You were signed out. Sign in again to keep syncing.','☁️')}else st='err'}paint()}
function queue(){if(!AU)return;const n=Date.now();if(!tq0)tq0=n;clearTimeout(tq);tq=setTimeout(push,n-tq0>20000?0:4000)}
function paint(){const e=$('#syncst');if(e)e.textContent=({sync:'Syncing…',ok:'Synced '+(lastSync?new Date(lastSync).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''),err:'Offline. Will sync when you are back online.',idle:'Signed in',out:''})[st]||''}
async function signin(mode,name,pw){const r=await api('/api/'+mode,{method:'POST',body:JSON.stringify({username:name,password:pw})});setAuth({token:r.token,user:r.user});await pull();
  toast('Welcome, '+r.user.name+'! Progress synced.','☁️');SND.up();const pj=sessionStorage.getItem('rpsy_join');if(pj){sessionStorage.removeItem('rpsy_join');join(pj)}else go('me')}

/* ---- account card (Me tab) ---- */
function card(){if(user())return `<div class="card acct row"><div><b>☁️ ${esc(user().name)}</b><br><small id="syncst">${''}</small></div><div class="acts"><button class="btn ghost sm" id="asy">Sync</button><button class="btn ghost sm" id="aout">Sign out</button></div></div>`;
  return `<div class="card acct"><h3>☁️ Save progress &amp; compete</h3><p class="mu">Sign in to keep your progress on every device, climb the leaderboard and battle friends live.</p>
  <input class="inp" id="au" placeholder="Username" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20"><input class="inp" id="ap" type="password" placeholder="Password (6+ characters)" autocomplete="current-password" style="margin-top:8px" maxlength="100"><div class="err" id="ae" role="alert"></div>
  <div class="row2"><button class="btn pri" id="ain">Sign in</button><button class="btn ghost" id="aup">Create account</button></div></div>`}
function bind(){paint();const e=$('#ae');
  const go1=mode=>async()=>{const n=$('#au').value,p=$('#ap').value;e.textContent='';$$('#ain,#aup').forEach(b=>b.disabled=true);try{await signin(mode,n,p)}catch(x){e.textContent=x.message;$$('#ain,#aup').forEach(b=>b.disabled=false)}};
  if($('#ain')){$('#ain').onclick=go1('login');$('#aup').onclick=go1('register');$('#ap').onkeydown=ev=>{if(ev.key==='Enter')go1('login')()}}
  if($('#asy'))$('#asy').onclick=async()=>{try{await pull();toast('Synced','☁️');render()}catch(x){toast(x.message,'⚠️')}};
  if($('#aout'))$('#aout').onclick=async()=>{try{await api('/api/logout',{method:'POST'})}catch(x){}setAuth(null);st='out';leave();toast('Signed out. Your progress stays on this device.','👋');render()}}

/* ---- leaderboard ---- */
let RS='all';
const medal=n=>n==1?'🥇':n==2?'🥈':n==3?'🥉':n;
const av=h=>portrait(R3.byId[h]?h:'freud',90,'pt av');
VIEWS.rank=function(){const my=user();
  $('#app').innerHTML=`<h1>🏆 Leaderboard</h1><div class="seg"><button data-sc="all" class="${RS=='all'?'on':''}">All-time XP</button><button data-sc="week" class="${RS=='week'?'on':''}">This week</button></div>${my?'':'<div class="card row"><span class="mu">Sign in to appear on the board.</span><button class="btn gold sm" data-v="me">Sign in</button></div>'}<div id="lb"><p class="mu">Loading…</p></div><button class="btn ghost wide" id="lr">↻ Refresh</button>`;
  $$('[data-sc]').forEach(b=>b.onclick=()=>{RS=b.dataset.sc;SND.tap();render()});$('#lr').onclick=()=>render();
  api('/api/leaderboard?scope='+RS).then(r=>{if(V!=='rank')return;const me=my&&my.name;
    $('#lb').innerHTML=r.rows.length?r.rows.map(x=>`<div class="lbr ${x.name===me?'me':''} ${x.rank<4?'top':''}"><span class="rk">${medal(x.rank)}</span>${av(x.hero)}<div class="nm"><b>${esc(x.name)}</b><small>Lv ${lvOf(x.xp)} · ${x.xp} XP${x.streak?' · 🔥'+x.streak:''}${x.wins?' · 🤺'+x.wins:''}</small></div><b class="sc">${x.score}</b></div>`).join('')+(r.me&&r.me.rank>50?`<div class="lbr me"><span class="rk">#${r.me.rank}</span><div class="nm"><b>${esc(r.me.name)}</b><small>Your rank</small></div><b class="sc">${r.me.score}</b></div>`:''):'<div class="card center"><div class="trophy">🏆</div><p class="mu">No one is on the board yet. Earn XP to take the first spot!</p></div>'}
  ).catch(e=>{if(V==='rank')$('#lb').innerHTML=`<div class="card center"><p class="mu">${esc(e.message)}</p></div>`})};

/* ---- live battles (reusable rooms with a running scoreboard) ---- */
let BT=null;
const send=m=>{if(BT&&BT.ws&&BT.ws.readyState===1)BT.ws.send(JSON.stringify(m))};
const wsUrl=code=>(API||location.origin).replace(/^http/,'ws')+'/api/battle/ws?code='+code+'&token='+AU.token;
const heroOf=p=>p?(p.uid===BT.you?S.hero:p.hero)||'freud':'freud';
const link=code=>location.origin+location.pathname+'?battle='+code;
async function create(){try{await push();const r=await api('/api/battle/create',{method:'POST'});join(r.code)}catch(e){toast(e.message,'⚠️')}}
function join(code){code=String(code||'').toUpperCase().trim();if(!AU)return toast('Sign in first to battle.','🔒');if(!/^[A-Z0-9]{5}$/.test(code))return toast('Enter the 5-character room code.','⚠️');
  if(!S.hero){S.hero='freud';save()}
  leave(true);BT={code,players:[],host:0,you:0,status:'conn',qs:null,k:-1,off:0,n:8,tally:[],rounds:0,answered:new Set()};let ws;try{ws=new WebSocket(wsUrl(code))}catch(e){return toast('Could not connect.','⚠️')}
  BT.ws=ws;ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}onMsg(m)};
  ws.onclose=()=>{if(BT&&BT.ws===ws){BT.ws=null;BT.dropped=1;clearInterval(BT.tm);if(V==='lobby')lobby();else if(V==='battle')dropBanner();else if(V==='vsres')resParts()}};ws.onerror=()=>{};
  go('lobby')}
function leave(keep){if(BT){clearInterval(BT.tm);const w=BT.ws;BT.ws=null;try{w&&w.close()}catch(e){}if(!keep)BT=null}}
function onMsg(m){if(!BT)return;if(m.sn)BT.off=Date.now()-m.sn;
  if(m.t==='hello')BT.you=m.you;
  else if(m.t==='lobby'){BT.players=m.players;BT.host=m.host;BT.tally=m.tally||[];BT.rounds=m.rounds||0;if(V==='lobby')lobby();else if(V==='battle')board();else if(V==='vsres')resParts()}
  else if(m.t==='err'){toast(m.m,'⚠️');leave();go('vs')}
  else if(m.t==='err2')toast(m.m,'⚠️')
  else if(m.t==='start'){BT.qs=m.qs;BT.status='play';BT.end=null;BT.koSaid=0;BT.k=-1;BT.nx=null;if(V!=='battle')go('battle')}
  else if(m.t==='q'){BT.k=m.k;BT.dur=m.dur;BT.at=m.at+BT.off;BT.my=undefined;BT.timed=false;BT.nx=null;BT.answered=new Set();BT.fresh=Date.now()+(m.resume?0:1600);closePop();if(V!=='battle')go('battle');showQ()}
  else if(m.t==='nx'){BT.nx={at:Date.now()+m.in,last:m.last,k:m.k,len:m.in}}
  else if(m.t==='ev')onEv(m);
  else if(m.t==='end'){BT.end=m.ranking;BT.tally=m.tally||BT.tally;BT.rounds=m.rounds||BT.rounds;BT.status='done';finishBattle()}}
const tallyHtml=()=>{const t=BT.tally||[];if(!t.length)return'';const top=t[0].wins>0?t[0].wins:-1;
  return `<div class="card tally"><h3>🏅 Room scoreboard · ${BT.rounds} battle${BT.rounds==1?'':'s'} played</h3>${t.map(x=>`<div class="tr ${x.wins===top?'lead':''}">${av(x.uid===BT.you?S.hero:x.hero)}<b>${esc(x.name)}${x.wins===top?' 👑':''}</b><span>${x.wins} win${x.wins==1?'':'s'}</span><small>${x.battles} played</small></div>`).join('')}</div>`};
function startBattle(){const all=[];subs().forEach(sb=>sb.q.forEach((q,i)=>all.push([sb.id,i])));send({t:'start',qs:shuf(all).slice(0,BT.n)})}
function actions(){const host=BT.host===BT.you&&BT.you,few=BT.players.length<2;
  if(BT.dropped)return `<div class="card center"><p class="mu">Connection lost.</p><button class="btn pri" id="lrj">Rejoin room</button></div>`;
  return host?`<label class="qsel mu">Questions <select id="lq" class="inp">${[5,8,12].map(n=>`<option ${n==BT.n?'selected':''}>${n}</option>`).join('')}</select></label><button class="btn gold xl wide" id="lst" ${few?'disabled':''}>${few?'Waiting for another player…':BT.rounds?'⚔️ Play again in this room':'⚔️ Start battle'}</button>`:`<p class="mu center">Waiting for the host to start${BT.rounds?' the next battle':''}…</p>`}
function bindActions(){const rj=$('#lrj');if(rj)rj.onclick=()=>join(BT.code);if($('#lq'))$('#lq').onchange=e=>BT.n=+e.target.value;const s=$('#lst');if(s)s.onclick=startBattle}
VIEWS.vs=function(){
  $('#app').innerHTML=`<h1>🤺 Battle Friends</h1><p class="mu">Two to four players answer the same questions at the same time. Each correct answer hurts the other players, and faster answers earn more points. Stay in the same room to play again. The room keeps score of who wins the most battles.</p>
  ${AU?`<button class="btn gold xl wide" id="vc">Create a room</button><div class="card"><h3>Join with a code</h3><input class="inp codein" id="vj" maxlength="5" placeholder="ABCDE" autocapitalize="characters" autocomplete="off" spellcheck="false"><button class="btn pri wide" id="vjb">Join battle</button></div>`:`<div class="card center"><div class="trophy">🔒</div><p>Sign in to battle other players.</p><button class="btn gold" data-v="me">Sign in or create account</button></div>`}`;
  if(AU){$('#vc').onclick=create;$('#vjb').onclick=()=>join($('#vj').value);$('#vj').onkeydown=e=>{if(e.key==='Enter')join($('#vj').value)}}};
function copyLink(){const l=link(BT.code);navigator.clipboard?navigator.clipboard.writeText(l).then(()=>toast('Invite link copied','📋')).catch(()=>toast('Code: '+BT.code,'📋')):toast('Code: '+BT.code,'📋')}
function shareLink(){const l=link(BT.code);if(navigator.share)navigator.share({title:'RPsy battle',text:'Join my RPsy battle! Room '+BT.code,url:l}).catch(()=>{});else copyLink()}
function lobby(){if(!BT)return go('vs');
  if(V!=='lobby'||!$('#lp')){$('#app').innerHTML=`<div class="fit lobfit"><button class="btn ghost sm" id="lx">← Leave room</button><div class="card center rm"><small class="mu">Room code. The room stays open, so you can use it again.</small><div class="rcode" id="rcode">${esc(BT.code)}</div><div class="row2"><button class="btn ghost sm" id="lcp">📋 Copy link</button><button class="btn ghost sm" id="lsh">📤 Share</button></div></div><div class="lob" id="lp"></div><div id="lt"></div><div id="la" class="lact"></div></div>`;
    $('#lx').onclick=()=>{leave();go('vs')};$('#lcp').onclick=copyLink;$('#lsh').onclick=shareLink}
  $('#lp').innerHTML=BT.players.length?BT.players.map(p=>`<div class="lp ${p.on?'':'off'} ${p.uid===BT.you?'me':''}">${av(heroOf(p))}<b>${esc(p.name)}</b><small>${p.uid===BT.host?'👑 Host':'Ready'}${p.uid===BT.you?' · You':''}</small></div>`).join('')+Array.from({length:Math.max(0,4-BT.players.length)},()=>'<div class="lp empty"><span class="pt av em">?</span><small>Waiting…</small></div>').join(''):'<p class="mu center">Connecting…</p>';
  $('#lt').innerHTML=tallyHtml();$('#la').innerHTML=actions();bindActions()}
VIEWS.lobby=lobby;
VIEWS.battle=function(){if(!BT)return go('vs');
  $('#app').innerHTML=`<div class="fit"><div class="qtop"><button class="ib" id="vx" aria-label="Leave">✕</button><div class="vtb" id="vtb"><i></i></div><span class="chip" id="vk">Get ready</span></div><div class="stage3 bat" id="st"></div><div class="vb" id="vb"></div><div id="vdrop"></div><div class="qbody vwrap"><div id="vq" class="veil vqf"></div><div id="vcd" class="vcd"></div></div></div>`;
  mount($('#st'),{mode:'battle',hero:S.hero||'freud',accent:0xff6bd6});const opp=BT.players.find(p=>p.uid!==BT.you);if(ST&&ST.setRival)ST.setRival(heroOf(opp));
  $('#vx').onclick=()=>{if(confirm('Leave this battle?')){leave();go('home')}};board();if(BT.k>=0)showQ();if(BT.dropped)dropBanner()};
function dropBanner(){const d=$('#vdrop');if(d){d.innerHTML='<div class="exp no slim">Connection lost. <button class="btn pri sm" id="vrj">Rejoin</button></div>';$('#vrj').onclick=()=>join(BT.code)}}
function board(){const b=$('#vb');if(!b||!BT)return;b.innerHTML=BT.players.map(p=>`<div class="vp ${p.uid===BT.you?'me':''} ${p.hp<=0?'ko':''} ${p.on?'':'off'}" data-u="${p.uid}">${av(heroOf(p))}<div><b>${esc(p.name)}</b><span class="hp"><i style="width:${Math.max(0,p.hp)}%"></i></span></div><em>${p.score}</em></div>`).join('')}
function showQ(){if(V!=='battle'||!BT||BT.k<0||!BT.qs)return;const it=BT.qs[BT.k],s=it&&sub(it[0]),q=s&&s.q[it[1]];
  if(!q){send({t:'ans',k:BT.k,ok:false,ms:20000});return}
  BT.order=shuf([0,1,2,3]);const me=BT.players.find(p=>p.uid===BT.you),ko=me&&me.hp<=0;
  $('#vk').textContent=(BT.k+1)+'/'+BT.qs.length;
  $('#vq').className='veil vqf';$('#vq').innerHTML=`<div class="qmeta"><span class="tag" style="--c:${s.col}">${s.ic} ${esc(s.n)}</span></div><h2 class="qq">${esc(q.q)}</h2><div id="ops">${BT.order.map((j,i)=>`<button class="opt" data-j="${j}"><span class="lt">${'ABCD'[i]}</span><span>${esc(q.o[j])}</span></button>`).join('')}</div><div id="vex" class="vstat"></div>`;
  $$('#ops .opt').forEach(b=>b.onclick=()=>pick(+b.dataset.j));
  if(ko){$('#vex').innerHTML='<div class="exp no slim"><b>Knocked out!</b> Keep watching until the battle ends.</div>';$$('#ops .opt').forEach(b=>b.disabled=true)}
  BT.lastStat='';clearInterval(BT.tm);BT.tm=setInterval(tick,100);tick()}
function stat(){const ex=$('#vex');if(!ex||!BT)return;const now=Date.now();let h='';
  if(BT.nx){const l=Math.max(0,BT.nx.at-now),sec=Math.ceil(l/1000);h=`<div class="nxt"><b>${BT.nx.last?'🏁 Results in '+sec+'…':'⏭ Next question in '+sec+'…'}</b><span class="nb"><i style="width:${100-100*l/Math.max(BT.nx.len,1)}%"></i></span></div>`}
  else if(BT.my!==undefined||BT.timed){const w=BT.players.filter(p=>p.on&&p.hp>0&&p.uid!==BT.you&&!BT.answered.has(p.uid)).map(p=>p.name);h=w.length?`<div class="nxt wait">⏳ Waiting for ${esc(w.join(', '))}…</div>`:''}
  else if(now<BT.fresh&&BT.k>0)h=`<div class="nxt fresh">🆕 Question ${BT.k+1} is live!</div>`;
  if(h!==BT.lastStat){BT.lastStat=h;const keep=ex.querySelector('.exp');ex.innerHTML=(keep?keep.outerHTML:'')+h}
  const nb=ex.querySelector('.nb i');if(nb&&BT.nx)nb.style.width=(100-100*Math.max(0,BT.nx.at-now)/Math.max(BT.nx.len,1))+'%'}
function tick(){if(!BT||V!=='battle'){BT&&clearInterval(BT.tm);return}const now=Date.now(),rem=BT.at-now,vq=$('#vq'),cd=$('#vcd');if(!vq)return;
  if(rem>0){cd.textContent=Math.ceil(rem/1000);return}
  if(vq.classList.contains('veil')){vq.classList.remove('veil');vq.classList.add('qin');cd.textContent=''}
  const left=Math.max(0,BT.dur-(now-BT.at)),bar=$('#vtb i');if(bar){bar.style.width=100*left/BT.dur+'%';bar.classList.toggle('low',left<5000)}
  if(left<=0&&BT.my===undefined&&!BT.timed){BT.timed=true;reveal(null)}stat()}
function rec(s,i,ok){const key=s.id+'.'+i,d=S.done[s.id]||(S.done[s.id]={a:0,c:0});d.a++;if(ok)d.c++;S.fa[key]=ok?1:0;S.tot.a++;if(ok)S.tot.c++;touch();S.day.q++;const ei=S.err.findIndex(e=>e.s+'.'+e.i==key);if(ok&&ei>=0)S.err.splice(ei,1);else if(!ok&&ei<0)S.err.push({s:s.id,i});save()}
function pick(j){if(!BT||BT.my!==undefined||$('#vq').classList.contains('veil')||BT.timed)return;const me=BT.players.find(p=>p.uid===BT.you);if(me&&me.hp<=0)return;
  const it=BT.qs[BT.k],s=sub(it[0]),ok=j===0;BT.my=j;send({t:'ans',k:BT.k,ok,ms:Math.max(0,Date.now()-BT.at)});rec(s,it[1],ok);if(ok){SND.ok();buzz(15)}else{SND.no();buzz([40,40,40])}reveal(j)}
function reveal(j){if(!$('#ops'))return;const it=BT.qs[BT.k],q=sub(it[0]).q[it[1]];
  $$('#ops .opt').forEach(b=>{const jj=+b.dataset.j;b.disabled=true;if(jj===0)b.classList.add('c');else if(jj===j)b.classList.add('w')});
  if(j===0)$('#vex').innerHTML='<div class="exp ok slim">✓ Correct!</div>';
  else popup({ok:false,title:j===null?'Time’s up':'Not quite',correct:q.o[0],why:Array.isArray(q.x)?q.x[0]:q.x,yours:j===null?'':q.o[j],yw:j===null?'':(Array.isArray(q.x)?q.x[j]:'')},null);
  BT.lastStat='';stat()}
function onEv(m){if(!BT)return;const P=u=>BT.players.find(p=>p.uid===u),a=P(m.uid);if(a)a.score=m.score;m.hits.forEach(h=>{const t=P(h.uid);if(t)t.hp=h.hp});BT.answered&&BT.answered.add(m.uid);if(V!=='battle')return;board();
  const me=BT.you;if(ST&&ST.setRival){
    if(m.uid===me&&m.ok&&m.hits.length){const tg=P(m.hits[0].uid);if(ST.rivalId!==heroOf(tg))ST.setRival(heroOf(tg));ST.attack(()=>ST.rivalHit());floatText('+'+m.pts,$('#st'))}
    else if(m.ok&&m.uid!==me&&m.hits.some(h=>h.uid===me)){if(ST.rivalId!==heroOf(a))ST.setRival(heroOf(a));ST.rivalAttack(()=>{ST.hurt();SND.no();buzz(60)})}}
  const mine=P(me);if(mine&&mine.hp<=0&&!BT.koSaid){BT.koSaid=1;toast('You were knocked out!','💥')}
  const pe=document.querySelector(`.vp[data-u="${m.uid}"]`);if(pe&&m.ok){pe.classList.add('pop');setTimeout(()=>pe.classList.remove('pop'),600)}stat()}
function finishBattle(){if(!BT)return;clearInterval(BT.tm);closePop();const r=BT.end,i=r.findIndex(x=>x.uid===BT.you),me=r[i]||{correct:0},win=i===0&&r.length>1;
  const xp=15+(me.correct||0)*5+(win?30:0);BT.xp=xp;BT.win=win;BT.rank=i+1;gain(xp);touch();S.day.g++;if(win)award('pvp');checkBadges();save();go('vsres')}
function resParts(){if(!BT||V!=='vsres')return;const t=$('#rt');if(t)t.innerHTML=tallyHtml();const a=$('#ra');if(a){a.innerHTML=actions();bindActions()}}
VIEWS.vsres=function(){if(!BT||!BT.end)return go('vs');const r=BT.end;
  $('#app').innerHTML=`<div class="stage3 win" id="st"></div><div class="resh"><h1>${BT.win?'🏆 You won!':'Battle over'}</h1><p class="mu">You placed #${BT.rank} of ${r.length} · +${BT.xp} XP</p></div>
  ${r.map((x,i)=>`<div class="lbr ${x.uid===BT.you?'me':''} ${i<3?'top':''}"><span class="rk">${medal(i+1)}</span>${av(x.uid===BT.you?S.hero:x.hero)}<div class="nm"><b>${esc(x.name)}</b><small>${x.correct} correct · ${Math.max(0,x.hp)} HP left</small></div><b class="sc">${x.score}</b></div>`).join('')}
  <div id="rt"></div><div id="ra"></div>
  <div class="row2"><button class="btn ghost" id="rl">📋 Invite link</button><button class="btn ghost" id="lv">Leave room</button></div>`;
  mount($('#st'),{mode:'hero',hero:S.hero||'freud',accent:0xffc83d});if(ST)setTimeout(()=>ST&&(BT&&BT.win?ST.cheer():ST.wave()),400);if(BT.win){confetti(110);SND.win()}
  resParts();$('#rl').onclick=copyLink;$('#lv').onclick=()=>{leave();go('home')}};
/* ---- invite link landing: ask to sign in, then drop the player into the room ---- */
VIEWS.invite=function(){const code=sessionStorage.getItem('rpsy_join')||'';
  $('#app').innerHTML=`<div class="card center invite"><div class="trophy">🤺</div><h1>You’re invited to a battle!</h1><p class="mu">Room <b class="rcode sm">${esc(code)}</b></p><p>Sign in or create a free account, and you will go straight into the room.</p></div>${card()}`;bind()};

/* ---- boot ---- */
addEventListener('online',()=>{if(AU)push()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&AU&&tq)push()});
function boot(){const q=new URLSearchParams(location.search).get('battle'),code=q?q.toUpperCase():sessionStorage.getItem('rpsy_join');
  if(q)history.replaceState(null,'',location.pathname);
  if(code&&!AU){sessionStorage.setItem('rpsy_join',code);go('invite')}
  if(AU)pull().then(()=>{if(['home','me','map','rank'].includes(V))render()}).catch(e=>{if(e.status===401){setAuth(null);st='out';if(code){sessionStorage.setItem('rpsy_join',code);go('invite')}}else st='err'}).finally(()=>{if(code&&AU){sessionStorage.removeItem('rpsy_join');join(code)}})}
boot();
return{user,card,bind,queue,push,pull,merge,join,bt:()=>BT};
})();
