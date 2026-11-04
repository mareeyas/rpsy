'use strict';
/* RPsy app logic: quests, 3D battle quizzes, flashcards, progress. Data lives in data.js, 3D in chars3d.js. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RGC=false; /* guidance-counselor path is built later; RPsy only for now */
const KEY='rpsy3',RANKS=['Novice Observer','Apprentice Listener','Junior Clinician','Case Analyst','Seasoned Practitioner','Master Mentor','Grand Sage'];
const NOTE={r:'PRC psychologist exam (August 2023 program): Advance Theories of Personality 20%, Psychological Counseling and Psychotherapy 25%, Advance Psychological Assessment 30%, Advance Abnormal Psychology 25%. Check the current table of specifications with the PRC Board of Psychology.',g:'Subjects named in RA 9258 Sec. 15 and Board Resolution 02 s.2008: Foundations of Guidance; Counseling Theories, Tools and Techniques; Psychological Testing; Organization and Administration of Guidance Services; Group Process and Program Development. Confirm current weights with the PRC Board for Guidance and Counseling.'};
const FOES=['Confirmation Bias Blob','Halo Effect Imp','Groupthink Gremlin','Anchoring Slime','Straw-man Sprite','Bystander Beast','Placebo Phantom','Cramming Cyclops','Overconfidence Ogre','Procrastination Pixie'];
const TIPS=['Say the term aloud before you flip a card.','Spaced practice beats cramming. Come back tomorrow!','Your mistakes are your best teachers. Check the Mistakes tab.','Mix subjects in a Boss Exam to build stamina for the real exam.','Explain a concept in your own words. If you can teach it, you know it.'];
const BADGES=[['first','First Blood','Answer your first question correctly','🎯'],['c5','On Fire','Reach a 5-answer combo','🔥'],['c10','Unstoppable','Reach a 10-answer combo','⚡'],['perf','Flawless','Finish a run of 5+ with no misses','💎'],['s3','Habit','3-day streak','📅'],['s7','Dedicated','7-day streak','🏅'],['q50','Scholar','Answer 50 questions','📚'],['q150','Veteran','Answer 150 questions','🎓'],['f20','Card Shark','Review 20 flashcards','🃏'],['boss','Boss Slayer','Score 75%+ on a Boss Exam of 10+','👑'],['daily','Daily Doer','Complete a Daily Challenge','☀️'],['m80','Master','80%+ mastery in a subject','★'],['spd','Speedster','12+ correct in a Speed Round','🚀'],['hero','Collector','Unlock 5 psychologists','🧑‍🏫'],['pvp','Duelist','Win a live battle against other players','🤺'],['ch1','Chapter One','Finish the first chapter of the journey','📖'],['story','Citadel Conqueror','Finish the whole journey to licensure','🏰']];

/* ---------- state ---------- */
const init=()=>({v:3,xp:0,streak:0,last:'',p:'r',hero:'',done:{},fa:{},err:[],cards:{},hist:[],sess:null,les:{},day:{d:'',q:0,f:0,g:0,c:0},badges:{},daily:'',tot:{a:0,c:0,f:0,best:0},story:{},set:{snd:1,theme:'auto',fz:1,mo:0}});
let S=load();
function load(){const o=init();try{const r=localStorage.getItem(KEY);if(r)Object.assign(o,JSON.parse(r));else{const old=localStorage.getItem('pa');if(old){const x=JSON.parse(old);['xp','streak','last','p','done','fa','err','cards','hist','les'].forEach(k=>{if(x[k]!==undefined)o[k]=x[k]})}}}catch(e){}
  const d=init();o.set=Object.assign(d.set,o.set);o.tot=Object.assign(d.tot,o.tot);o.day=Object.assign(d.day,o.day);if(!o.badges)o.badges={};if(!o.story)o.story={};if(!RGC)o.p='r';return o}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(window.OL)OL.queue()};
const pad=n=>String(n).padStart(2,'0'),ld=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())},td=()=>ld(Date.now());
const lvl=()=>Math.floor(Math.sqrt(S.xp/40))+1,pc=(a,b)=>b?Math.round(100*a/b):0,rank=()=>RANKS[Math.min(lvl()-1,RANKS.length-1)];
const subs=()=>D.filter(s=>s.p.includes(S.p)),core=()=>subs().filter(s=>!s.sup),sub=id=>D.find(x=>x.id===id);
const mast=s=>{let a=0,c=0;s.q.forEach((q,i)=>{const v=S.fa[s.id+'.'+i];if(v!==undefined){a++;c+=v}});if(a>=2)return pc(c,a);const d=S.done[s.id];return !a&&d&&d.a>=2?pc(d.c,d.a):null};
const unlocked=s=>{if(s.sup)return true;const c=core(),i=c.indexOf(s);if(!i)return true;const m=mast(c[i-1]);return m!==null&&m>=60};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const seeded=(a,seed)=>{let h=0;for(const c of seed)h=(h*31+c.charCodeAt(0))>>>0;const r=()=>(h=(h*1664525+1013904223)>>>0)/4294967296;a=a.slice();for(let i=a.length-1;i>0;i--){const j=r()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const hero=()=>R3.byId[S.hero]||R3.ROSTER[0];
const unlockedHeroes=()=>R3.ROSTER.filter(r=>r.lv<=lvl());
const totalQ=()=>subs().reduce((a,s)=>a+s.q.length,0);

/* ---------- fx: sound, confetti, toasts ---------- */
let AC=null;
function tone(seq,type='sine',vol=.07){if(!S.set.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;seq.forEach(([f,d,o],i)=>{const os=AC.createOscillator(),g=AC.createGain();os.type=type;os.frequency.value=f;g.gain.setValueAtTime(0,t+o);g.gain.linearRampToValueAtTime(vol,t+o+.01);g.gain.exponentialRampToValueAtTime(.0001,t+o+d);os.connect(g).connect(AC.destination);os.start(t+o);os.stop(t+o+d+.02)})}catch(e){}}
const SND={ok:()=>tone([[660,.12,0],[880,.18,.09]],'triangle'),no:()=>tone([[220,.22,0],[160,.3,.12]],'sawtooth',.05),up:()=>tone([[523,.12,0],[659,.12,.1],[784,.12,.2],[1046,.3,.3]],'triangle'),tap:()=>tone([[520,.05,0]],'sine',.04),win:()=>tone([[523,.1,0],[659,.1,.1],[784,.1,.2],[659,.1,.3],[1046,.4,.4]],'triangle')};
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const RM=()=>S.set.mo||matchMedia('(prefers-reduced-motion:reduce)').matches;
let parts=[],raf=0;
function confetti(n=70,x,y){if(RM())return;const c=$('#fx'),g=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#ffc83d','#7c5cff','#2fe3c8','#ff5fa2','#ffffff','#5ab0ff'];x=x??innerWidth/2;y=y??innerHeight*.4;
  for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*11,vy:-Math.random()*11-3,r:Math.random()*6,w:5+Math.random()*6,h:3+Math.random()*5,c:cols[i%cols.length],l:1});
  if(!raf)(function f(){g.clearRect(0,0,c.width,c.height);parts=parts.filter(p=>p.l>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.vx*=.99;p.r+=.2;p.l-=.011;g.save();g.globalAlpha=Math.max(p.l,0);g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore()});raf=parts.length?requestAnimationFrame(f):(g.clearRect(0,0,c.width,c.height),0)})()}
function toast(m,ic){const e=document.createElement('div');e.className='toast';e.innerHTML=(ic?'<b>'+ic+'</b> ':'')+esc(m);$('#toasts').append(e);setTimeout(()=>e.remove(),2600)}
function floatText(t,el,cls){const r=(el||document.body).getBoundingClientRect(),e=document.createElement('div');e.className='flt '+(cls||'');e.textContent=t;e.style.left=(r.left+r.width/2)+'px';e.style.top=(r.top+r.height/3+scrollY)+'px';document.body.append(e);setTimeout(()=>e.remove(),1100)}

/* ---------- core game logic ---------- */
function touch(){const t=td();if(S.last!==t){const y=ld(Date.now()-864e5);S.streak=S.last===y?S.streak+1:1;S.last=t}if(S.day.d!==t)S.day={d:t,q:0,f:0,g:0,c:0}}
function gain(n,el){const o=lvl();S.xp+=n;touch();if(el)floatText('+'+n+' XP',el);if(lvl()>o){SND.up();confetti(120);const nh=R3.ROSTER.filter(r=>r.lv===lvl());toast('Level up! '+rank(),'🎉');if(nh.length)setTimeout(()=>toast(nh.map(h=>h.n).join(', ')+' joined your team!','🔓'),900)}}
function award(id){if(S.badges[id])return;S.badges[id]=td();const b=BADGES.find(x=>x[0]===id);toast(b[1]+': '+b[2],b[3]);SND.up();confetti(50)}
function checkBadges(ctx){ctx=ctx||{};if(S.tot.c>=1)award('first');if(S.tot.best>=5)award('c5');if(S.tot.best>=10)award('c10');if(S.streak>=3)award('s3');if(S.streak>=7)award('s7');if(S.tot.a>=50)award('q50');if(S.tot.a>=150)award('q150');if(S.tot.f>=20)award('f20');if(subs().some(s=>(mast(s)||0)>=80))award('m80');if(unlockedHeroes().length>=5)award('hero');
  if(ctx.perf)award('perf');if(ctx.boss)award('boss');if(ctx.daily)award('daily');if(ctx.spd)award('spd')}
function dueCards(){const L=[];subs().forEach(s=>s.c.forEach((c,i)=>{const k=s.id+'.'+i,d=S.cards[k];if(!d||d.due<=td())L.push({k,c,s,seen:d?d.seen||0:0})}));return L.sort((a,b)=>a.seen-b.seen)}
function readiness(){const L=core(),m=L.map(mast).filter(x=>x!==null),offN=(D.off&&D.off[S.p]||[]).length;const cov=m.length/(L.length+offN),avg=m.length?m.reduce((a,b)=>a+b,0)/m.length:0;const mk=S.hist.filter(h=>h.p==S.p&&h.n>=10&&h.m=='mock').slice(-3);return{v:Math.round(avg*cov),cons:mk.length>=3&&mk.every(h=>h.s>=75),mk:mk.length}}

/* ---------- 3D stage handling ---------- */
let ST=null;
function killStage(){if(ST){try{ST.dispose()}catch(e){}ST=null}}
function mount(el,o){killStage();if(!el)return null;el.classList.remove('nogl','hasfoe');try{ST=R3.stage(el,o)}catch(e){console.warn('3D stage failed',e);ST=null}if(!ST){el.classList.add('nogl');if(o&&o.enemy)el.classList.add('hasfoe')}else el.addEventListener('gllost',()=>{ST=null;el.classList.add('nogl');if(o&&o.enemy)el.classList.add('hasfoe')},{once:true});return ST}
/* portraits render one per tick so screens never freeze while 3D heads are built */
const PQ=[],PIMG={};let pqRun=false;
function portrait(id,px,cls){px=px||180;const key=id+'@'+px;if(!R3.supported())return `<span class="${cls||'pt'} em">🧑‍🏫</span>`;
  if(PIMG[key]===undefined&&!PQ.some(x=>x.key===key)){PQ.push({id,px,key});if(!pqRun){pqRun=true;setTimeout(pumpPortraits,20)}}
  return `<img class="${cls||'pt'}" data-pk="${key}" src="${PIMG[key]||'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}" alt="" draggable="false">`}
function pumpPortraits(){const t=PQ.shift();if(!t){pqRun=false;return}let u='';try{u=R3.portrait(t.id,t.px)}catch(e){}PIMG[t.key]=u;if(u)document.querySelectorAll(`img[data-pk="${t.key}"]`).forEach(i=>{i.src=u});setTimeout(pumpPortraits,12)}

/* ---------- navigation / chrome ---------- */
let V='home',A=null,TM=0;
const VIEWS={};
function go(v,a){closePop();killStage();if(v!=='cards'&&window.CARDCTX){window.CARDCTX=null;FREE=null}clearInterval(TM);V=v;A=a;render();scrollTo(0,0)}
function render(){touch();applySet();chrome();save();document.body.classList.toggle('inq',V==='quiz'||V==='battle'||V==='lobby'||V==='scene');VIEWS[V]()}
function applySet(){const h=document.documentElement;if(S.set.theme==='auto')h.removeAttribute('data-theme');else h.setAttribute('data-theme',S.set.theme);h.style.setProperty('--fz',S.set.fz);h.classList.toggle('rm',!!S.set.mo)}
function chrome(){const L=lvl(),b=40*(L-1)**2,n=40*L*L;
  $('#hd').innerHTML=`<button class="logo" data-v="home" aria-label="Home"><span>Ψ</span><b>RPsy</b></button><div class="chips"><span class="chip" title="Streak">🔥 ${S.streak}</span><span class="chip lvc" title="${rank()}">Lv ${L}<i style="--p:${pc(S.xp-b,n-b)}%"></i></span><button class="ib" data-v="find" aria-label="Search">🔍</button></div>`;
  const T=[['home','Home','M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],['map','Journey','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16 8l-2 6-6 2 2-6z'],['play','Play','M8 5v14l11-7z'],['rank','Ranks','M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3'],['me','Me','M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z']];
  const cur=({sub:'map',find:'map',cards:'map',chapter:'map',scene:'map',quiz:'play',res:'play',vs:'play',lobby:'play',battle:'play',vsres:'play',hero:'me'})[V]||V;
  $('#tb').innerHTML=T.map(t=>`<button data-v="${t[0]}" class="${t[0]==='play'?'pl':''} ${cur===t[0]?'on':''}" aria-label="${t[1]}" ${cur===t[0]?'aria-current="page"':''}><svg width="24" height="24" viewBox="0 0 24 24" fill="${t[0]==='play'?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="${t[2]}"/></svg><span>${t[1]}</span></button>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b&&!b.disabled){SND.tap();go(b.dataset.v,b.dataset.a)}});
/* 3D tilt on cards */
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.tilt');if(!c||RM()||e.pointerType==='touch')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(6px)`});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.tilt');if(c&&!c.contains(e.relatedTarget))c.style.transform=''});

/* ---------- HOME ---------- */
function ring(p,col,txt,sz=92){const r=sz/2-8,c=2*Math.PI*r;return `<svg class="rg" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--bd)" stroke-width="9"/><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 ${sz/2} ${sz/2})"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="var(--ink)" font-family="Fredoka,system-ui" font-weight="700" font-size="${sz*.26}">${txt}</text></svg>`}
let tipI=0;
VIEWS.home=function(){
  if(!S.hero)return go('hero',{first:1});
  const L=lvl(),b=40*(L-1)**2,n=40*L*L,h=hero(),r=readiness(),d=S.day,due=dueCards().length;
  const all=subs().map(s=>[s,mast(s)]).filter(x=>x[1]!==null).sort((a,b)=>a[1]-b[1]);
  const next=subs().find(s=>unlocked(s)&&(mast(s)===null||mast(s)<80));
  const lastH=S.hist.filter(x=>x.p==S.p).slice(-8);
  const ms=[[d.q>=5,'Answer 5 questions',Math.min(d.q,5)+'/5'],[d.f>=3,'Review 3 flashcards',Math.min(d.f,3)+'/3'],[d.g>=1,'Finish 1 battle',Math.min(d.g,1)+'/1']],all3=ms.every(x=>x[0]);
  $('#app').innerHTML=`<section class="hero3"><div class="stage3 big" id="st"><div class="bub" id="bub">${esc(h.bio)}</div></div>
  <div class="plate"><div><b>${esc(h.n)}</b><small>${esc(h.tag)} · ${esc(h.y)}</small></div><button class="btn ghost sm" data-v="hero">Switch</button></div></section>
  <div class="xpw"><div class="xpl"><span>${rank()}</span><span>${S.xp-b}/${n-b} XP</span></div><div class="xp"><i style="width:${pc(S.xp-b,n-b)}%"></i></div></div>
  ${S.sess?`<button class="btn aqua wide" id="rs">▶ Resume your unfinished ${esc(MODES[S.sess.type].n)}</button>`:''}
  ${window.JN?JN.homeCta():'<button class="btn gold xl wide" data-v="play">⚔️ Play now</button>'}
  <div class="grid2">
   <div class="card tilt"><h3>☀️ Daily challenge</h3><p class="mu">${S.daily===td()?'Completed today. Replay for practice!':'10 fresh questions. +50 bonus XP.'}</p><button class="btn sm ${S.daily===td()?'ghost':'pri'}" id="dc">${S.daily===td()?'Replay':'Start'}</button></div>
   <div class="card tilt"><h3>🃏 Flashcards</h3><p class="mu">${due} card${due==1?'':'s'} due for spaced review.</p><button class="btn sm pri" data-v="cards">Review</button></div>
  </div>
  <div class="card"><h3>🎯 Today’s missions</h3>${ms.map(m=>`<div class="ms ${m[0]?'ok':''}"><span class="ck">${m[0]?'✓':''}</span><span>${m[1]}</span><b>${m[2]}</b></div>`).join('')}
   <button class="btn sm ${all3&&!d.c?'gold pulse':'ghost'}" id="cl" ${all3&&!d.c?'':'disabled'}>${d.c?'Reward claimed ✓':all3?'Claim +30 XP':'Complete all to claim +30 XP'}</button></div>
  ${window.OL&&!OL.user()?`<div class="card tilt row"><div><h3 style="margin:0">🏆 Join the leaderboard</h3><span class="mu">Sign in to keep progress on every device and battle friends.</span></div><button class="btn gold sm" data-v="me">Sign in</button></div>`:''}
  <div class="card ringc">${ring(r.v,'var(--aqua)',r.v+'%')}<div><h3>${S.p=='r'?'RPsy':'RGC'} readiness</h3><p class="mu">${r.cons?'Your last 3 Boss Exams (10+ questions each) all scored 75% or higher.':`Take 3 Boss Exams with 10+ questions to get a steady score (${r.mk}/3 so far). This is an estimate, not a prediction.`}</p></div></div>
  <div class="card"><h3>📈 Strongest and weakest</h3><p>${all.length?`Weakest: <b>${esc(all[0][0].n)}</b> (${all[0][1]}%)<br>Strongest: <b>${esc(all.at(-1)[0].n)}</b> (${all.at(-1)[1]}%)`:'Complete a drill to see your mastery profile.'}</p>
  ${lastH.length?`<div class="bars">${lastH.map(x=>`<i title="${x.s}%" style="--h:${Math.max(x.s,4)}%"><em>${x.s}</em></i>`).join('')}</div>`:'<p class="mu">No runs yet. Win your first battle!</p>'}</div>`;
  mount($('#st'),{mode:'hero',hero:h.id,shift:.6,accent:0x7c5cff});
  if(ST&&ST.wave)setTimeout(()=>ST&&ST.wave(),500);
  const bub=$('#bub'),say=()=>{tipI++;bub.textContent=tipI%2?TIPS[(tipI>>1)%TIPS.length]:h.bio;bub.classList.remove('pop');void bub.offsetWidth;bub.classList.add('pop');if(ST){ST.wave();}SND.tap()};
  $('#st').addEventListener('tap3d',say);
  const rs=$('#rs');if(rs)rs.onclick=()=>go('quiz');if(window.JN)JN.bindHome();
  $('#dc').onclick=startDaily;
  const cl=$('#cl');cl.onclick=()=>{if(S.day.c||!all3)return;S.day.c=1;gain(30,cl);confetti(90);SND.win();render()};
};

/* ---------- LEARN ---------- */
VIEWS.map=function(){const L=subs();
  $('#app').innerHTML=`<h1>${S.p=='r'?'RPsy':'RGC'} quest map</h1>
  ${RGC?`<div class="seg"><button class="${S.p=='r'?'on':''}" data-p="r">Psychologist (RPsy)</button><button class="${S.p=='g'?'on':''}" data-p="g">Guidance Counselor (RGC)</button></div>`:''}
  <button class="btn ghost wide" data-v="cards">🃏 Flashcards &amp; mistakes (${dueCards().length} due)</button>
  <details class="how"><summary>Exam structure and how unlocking works</summary><p class="mu">${NOTE[S.p]}</p><p class="mu">Score 60%+ over 2+ answered questions in a quest to open the next exam subject. Supporting topics are always open.</p></details>
  <div class="path">${L.map((s,i)=>{const m=mast(s),u=unlocked(s);return `<button class="pnode tilt ${u?'':'lk'} ${m>=80?'mx':''}" ${u?'':'disabled'} data-v="sub" data-a="${s.id}" style="--c:${s.col};--p:${m||0}%"><span class="coin"><i>${u?s.ic:'🔒'}</i></span><span class="nt"><b>${m>=80?'★ ':''}${esc(s.n)}</b><small>${m===null?'Not started':'Mastery '+m+'%'} · ${s.q.length} questions${s.sup?' · supporting':s.p.length>1?' · shared':''}</small><span class="pbar"><i style="width:${m||0}%"></i></span></span></button>`}).join('')}</div>`;
  $$('[data-p]').forEach(b=>b.onclick=()=>{S.p=b.dataset.p;save();SND.tap();render()});
};
VIEWS.sub=function(){const ctx=A&&typeof A==='object'?A:null,s=sub(ctx?ctx.id:A),dn=ctx?(window.JN&&JN.done(ctx.ch,ctx.k)):S.les[s.id],m=mast(s);
  $('#app').innerHTML=`<button class="btn ghost sm" ${ctx?'id="bk2"':'data-v="map"'}>← ${ctx?'Chapter':'Journey'}</button>
  <div class="banner" style="--c:${s.col}"><span class="bic">${s.ic}</span><div><h1>${esc(s.n)}</h1><span class="tag">${s.q.length} questions · ${s.c.length} cards · ${m===null?'not started':'mastery '+m+'%'}</span></div></div>
  <div class="card"><h3>Lesson</h3><p>${esc(s.l)}</p>${s.k?`<h3>Quick facts</h3>${Array.isArray(s.k)?'<ul class="kf">'+s.k.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul>':'<p class="mu">'+esc(s.k)+'</p>'}`:''}
  <button class="btn ${dn?'ghost':'pri'}" id="rd" ${dn?'disabled':''}>${dn?'Lesson completed ✓':ctx?'Briefing complete: continue (+15 XP)':'I reviewed it: recalled in my own words (+15 XP)'}</button></div>
  <h2>Tap a description to reveal the term</h2><div class="mini">${s.c.map(c=>`<button class="flip" aria-label="Flip card"><span class="fi"><span class="ff">${esc(c[1])}</span><span class="fb"><b>${esc(c[0])}</b>${c[2]?`<em class="exs">e.g. ${esc(c[2])}</em>`:''}</span></span></button>`).join('')}</div>
  <div class="row2"><button class="btn gold" id="dr">⚔️ Battle drill</button><button class="btn aqua" id="dr2">All ${s.q.length} questions</button></div>`;
  $$('.flip').forEach(b=>b.onclick=()=>{b.classList.toggle('on');SND.tap()});
  if(ctx)$('#bk2').onclick=()=>go('chapter',ctx.ch);$('#rd').onclick=()=>{S.les[s.id]=1;gain(15,$('#rd'));confetti(30);if(ctx)return JN.briefDone(ctx.ch,ctx.k);setTimeout(()=>go('sub',s.id),500)};
  $('#dr').onclick=()=>start('drill',[s],10,{boss:1});$('#dr2').onclick=()=>start('drill',[s],s.q.length,{boss:1});
};
VIEWS.find=function(){$('#app').innerHTML='<h1>Search</h1><input id="q" class="inp" placeholder="Search lessons, cards, questions" autofocus><div id="r"></div>';
  $('#q').oninput=e=>{const t=e.target.value.toLowerCase().trim();let h='';if(t.length>1)subs().forEach(s=>{if((s.n+s.l).toLowerCase().includes(t))h+=`<div class="card"><span class="tag">Lesson</span> <a href="#" data-s="${s.id}">${s.ic} ${esc(s.n)}</a></div>`;s.c.forEach(c=>{if((c[0]+c[1]).toLowerCase().includes(t))h+=`<div class="card"><span class="tag">Card</span> <b>${esc(c[0])}</b>: ${esc(c[1])}</div>`});s.q.forEach(q=>{if(q.q.toLowerCase().includes(t))h+=`<div class="card"><span class="tag">Question</span> ${esc(q.q)}<br><span class="mu">Answer: ${esc(q.o[0])}</span></div>`})});
    $('#r').innerHTML=h||(t.length>1?'<p class="mu">No matches.</p>':'');$$('[data-s]').forEach(a=>a.onclick=ev=>{ev.preventDefault();go('sub',a.dataset.s)})}};

/* ---------- PLAY ---------- */
const MODES={battle:{n:'Misconception Battle',lives:3,inst:1},daily:{n:'Daily Challenge',lives:3,inst:1},speed:{n:'Speed Round',lives:0,inst:1,time:60},drill:{n:'Drill',lives:0,inst:1},weak:{n:'Weak Spots',lives:0,inst:1},mock:{n:'Boss Exam',lives:0,inst:0},story:{n:'Story Battle',lives:3,inst:1}};
VIEWS.play=function(){const tot=totalQ(),L=subs();
  $('#app').innerHTML=`<h1>Side quests and game modes</h1><p class="mu">${tot} practice questions are ready for you.</p>
  <div class="modes">
   <button class="mode tilt m1" id="m1"><span class="mi">⚔️</span><b>Misconception Battle</b><small>8 questions and 3 hearts. Defeat the monsters.</small></button>
   <button class="mode tilt m2" id="m2"><span class="mi">🚀</span><b>Speed Round</b><small>60 seconds. Answer fast and build a combo!</small></button>
   <button class="mode tilt m3" id="m3"><span class="mi">☀️</span><b>Daily Challenge</b><small>${S.daily===td()?'Done today ✓ (replay)':'10 questions · +50 XP'}</small></button>
   <button class="mode tilt m4" id="m4"><span class="mi">👑</span><b>Boss Exam</b><small>Timed practice exam. See your answers at the end.</small></button>
   <button class="mode tilt m6" id="m6"><span class="mi">🤺</span><b>Battle Friends</b><small>Play live with 2 to 4 friends. Keep a room scoreboard.</small></button>
   <button class="mode tilt m5" id="m5"><span class="mi">🩹</span><b>Weak Spots</b><small>Retry ${S.err.length} question${S.err.length==1?'':'s'} you missed</small></button>
  </div>
  <h2>Subject drills</h2><div class="chipsrow">${L.map(s=>`<button class="sc" style="--c:${s.col}" data-v="sub" data-a="${s.id}">${s.ic} ${esc(s.n.replace('Advance ','').replace('Law & Ethics: ','Ethics: '))}</button>`).join('')}</div>
  <div class="card bossc" id="bx" hidden><h3>Boss Exam length</h3><p class="mu">You get one minute per question. Questions come from all subjects.</p><div class="chipsrow">${[10,25,50,100,tot].filter((v,i,a)=>v<=tot&&a.indexOf(v)==i).map(v=>`<button class="btn sm pri" data-n="${v}">${v===tot?'All '+v:v} questions</button>`).join('')}</div></div>`;
  $('#m1').onclick=()=>start('battle',L,8,{boss:1});$('#m2').onclick=()=>start('speed',L,300);$('#m3').onclick=startDaily;
  $('#m4').onclick=()=>{$('#bx').hidden=false;$('#bx').scrollIntoView({behavior:'smooth',block:'center'})};
  $$('[data-n]').forEach(b=>b.onclick=()=>start('mock',L,+b.dataset.n));
  $('#m6').onclick=()=>go('vs');
  $('#m5').onclick=()=>{if(!S.err.length)return toast('No saved mistakes yet. Nice!','✨');startWeak()};
};
function startDaily(){const L=subs(),t=td();let items=[];L.forEach(s=>s.q.forEach((q,i)=>items.push({s:s.id,i})));items=seeded(items,t+S.p).slice(0,10);start('daily',null,0,{boss:1,items})}
function startWeak(){const L=subs(),ids=new Set(S.err.map(e=>e.s+'.'+e.i)),items=[];L.forEach(s=>s.q.forEach((q,i)=>{if(ids.has(s.id+'.'+i))items.push({s:s.id,i})}));if(!items.length)return toast('No saved mistakes yet.','✨');start('weak',null,0,{boss:1,items:shuf(items)})}
function pickFoe(z,kind,name){const K=R3M.KINDS,k=kind||R3M.list[Math.random()*R3M.list.length|0],nm=K[k].names;z.fk=k;z.foe=name||nm[Math.random()*nm.length|0];z.hits=0}
function start(type,L,n,o){o=o||{};let items=o.items;
  if(!items){const prior=new Set(S.err.map(e=>e.s+'.'+e.i));items=[];L.forEach(s=>s.q.forEach((q,i)=>items.push({s:s.id,i,w:prior.has(s.id+'.'+i),u:S.fa[s.id+'.'+i]===undefined?0:1})));items=shuf(items);if(type==='drill')items.sort((a,b)=>(b.w|0)-(a.w|0));if(type==='story')items.sort((a,b)=>a.u-b.u);items=items.slice(0,n)}
  items=items.map(x=>({s:x.s,i:x.i,p:shuf([0,1,2,3])}));const M=MODES[type];
  const story=o.story||null,hp=story?story.need:type==='mock'?0:type==='speed'?2:3;
  S.sess={type,items,k:0,ans:[],lives:M.lives,max:M.lives,combo:0,best:0,gxp:0,pu:2,shield:0,hits:0,hp,wave:1,kills:0,story,won:0,foe:'',fk:'',end:M.time?Date.now()+M.time*1000:type=='mock'?Date.now()+items.length*60000:0,done:false};
  if(M.inst)pickFoe(S.sess,o.foe&&o.foe.kind,o.foe&&o.foe.name);
  save();go('quiz')}
function defeatFoe(z){z.kills=(z.kills||0)+1;toast(z.foe+' defeated!','🏆');SND.win();confetti(80);
  if(z.story){z.won=1;return}
  setTimeout(()=>{if(S.sess!==z||V!=='quiz')return;pickFoe(z);z.wave=(z.wave||1)+1;if(ST){ST.setEnemy(z.fk);ST.enemyShow()}hud();save()},ST?1100:200)}
VIEWS.quiz=function(){const z=S.sess;if(!z)return go('home');const M=MODES[z.type];
  $('#app').innerHTML=`<div class="fit"><div class="qtop"><button class="ib" id="qx" aria-label="Quit">✕</button><div class="seg3" id="qp"></div><div class="hud"><span id="hl"></span><span class="cmb" id="cb"></span></div></div>
  ${M.inst?`<div class="stage3 bat" id="st"><div class="foe" id="foe"><b id="fn"></b><span class="hp"><i id="hpi"></i></span></div></div>`:''}
  <div id="qa" class="qbody"></div></div>`;
  if(M.inst){mount($('#st'),{mode:'battle',hero:hero().id,enemy:{kind:z.fk},accent:0xff2a40});if(ST&&z.story&&z.won)ST.enemyDie&&ST.enemyDie()}
  $('#qx').onclick=()=>{if(confirm('Leave this run? Progress is saved so you can resume.')){clearInterval(TM);go('home')}};
  if(z.end){clearInterval(TM);TM=setInterval(()=>{const l=Math.max(0,z.end-Date.now()),e=$('#tm');if(e){e.textContent=z.type=='speed'?Math.ceil(l/1e3)+'s':Math.floor(l/6e4)+':'+pad(l/1e3%60|0);e.classList.toggle('low',l<10000)}if(!l){clearInterval(TM);finish()}},250)}
  qstep()};
function hud(){const z=S.sess;$('#qp').innerHTML=z.type=='speed'?'<b id="tm" class="tm"></b>':z.items.map((it,k)=>`<i class="${k<z.k?(z.ans[k]===0?'ok':z.type=='mock'?'dn':'no'):k==z.k?'cur':''}"></i>`).join('');
  $('#hl').innerHTML=z.max?Array.from({length:z.max},(_,i)=>`<span class="ht ${i<z.lives?'':'gone'}">❤</span>`).join('')+(z.shield?'<span class="ht">🛡</span>':''):'';
  const c=$('#cb');c.textContent=z.combo>=2?'🔥 x'+z.combo:'';c.classList.toggle('on',z.combo>=2);
  const hp=$('#hpi');if(hp)hp.style.width=z.hp?Math.max(0,100-100*z.hits/z.hp)+'%':'0%';const fn=$('#fn');if(fn)fn.textContent=z.foe+(z.story?'':' · wave '+(z.wave||1))}
function qstep(){const z=S.sess;if(!z)return;if(z.k>=z.items.length)return finish();const M=MODES[z.type],it=z.items[z.k],s=sub(it.s),q=s.q[it.i],mock=z.type=='mock',got=z.ans[z.k];hud();
  $('#qa').innerHTML=`<div class="qmeta"><span class="tag" style="--c:${s.col}">${s.ic} ${esc(s.n)}</span><span class="mu">${z.type=='speed'?'':(z.k+1)+'/'+z.items.length}</span>${mock?'<b id="tm" class="tm"></b>':''}${z.pu>0&&M.inst&&z.type!='speed'?`<button class="btn ghost sm pu" id="pu">✂️ 50/50 · ${z.pu}</button>`:''}</div>
  <h2 class="qq">${esc(q.q)}</h2><div id="ops">${it.p.map((j,idx)=>`<button class="opt" data-j="${j}"><span class="lt">${'ABCD'[idx]}</span><span>${esc(q.o[j])}</span></button>`).join('')}</div>
  <div id="ex"></div>`;
  $$('.opt').forEach(b=>b.onclick=()=>answer(+b.dataset.j));const pu=$('#pu');if(pu)pu.onclick=()=>{if(z.pu<1||z.ans[z.k]!==undefined)return;z.pu--;shuf(it.p.filter(j=>j!==0)).slice(0,2).forEach(j=>{const b=$(`.opt[data-j="${j}"]`);b.disabled=true;b.classList.add('x')});pu.remove();save();SND.tap()};
  }
function answer(j){const z=S.sess,it=z.items[z.k];if(z.ans[z.k]!==undefined)return;const s=sub(it.s),q=s.q[it.i],ok=j===0,M=MODES[z.type],mock=z.type=='mock',key=s.id+'.'+it.i;
  z.ans[z.k]=j;const d=S.done[s.id]||(S.done[s.id]={a:0,c:0});d.a++;if(ok)d.c++;S.fa[key]=ok?1:0;S.tot.a++;if(ok)S.tot.c++;touch();S.day.q++;
  const ei=S.err.findIndex(e=>e.s+'.'+e.i==key);if(ok&&ei>=0)S.err.splice(ei,1);else if(!ok&&ei<0)S.err.push({s:s.id,i:it.i});
  let pop=null;const btn=$(`.opt[data-j="${j}"]`);
  if(ok){z.combo++;z.best=Math.max(z.best,z.combo);S.tot.best=Math.max(S.tot.best,z.combo);const x=(mock?15:10)+Math.min(z.combo,6)*2;z.gxp+=x;gain(x,btn);SND.ok();buzz(15);if(z.combo===5&&!z.shield&&M.lives){z.shield=1;toast('Shield earned! Your next wrong answer will not cost a heart.','🛡')}
    const alive=z.hp&&z.hits<z.hp&&!z.won;if(alive)z.hits++;const dead=alive&&z.hits>=z.hp;
    if(dead)defeatFoe(z);
    if(ST&&M.inst){if(alive)ST.attack(()=>{if(dead){ST.enemyDie();ST.cheer()}else ST.enemyHit()});else ST.cheer()}}
  else{z.combo=0;if(M.lives){if(z.shield){z.shield=0;toast('Your shield blocked the hit!','🛡')}else z.lives--}SND.no();buzz([40,40,40]);
    if(ST&&M.inst){ST.enemyAttack()}}
  if(mock){z.k++;save();return qstep()}
  $$('.opt').forEach(b=>{const jj=+b.dataset.j;b.disabled=true;if(jj===0)b.classList.add('c');else if(jj===j)b.classList.add('w')});
  hud();save();checkBadges();
  let moved=0;const go2=()=>{if(moved)return;moved=1;if(z.won&&z.story)return finish();const dead=M.lives&&z.lives<=0;z.k++;save();if(dead)return finish();qstep()};
  if(ok){$('#ex').innerHTML=`<button class="exp ok slim" id="nx">✓ Correct!${z.combo>1?' 🔥 x'+z.combo:''} <small>tap to continue</small></button>`;$('#nx').onclick=go2;setTimeout(go2,z.type=='speed'?650:1300)}
  else{const t0=Date.now();popup({ok:false,title:'Not quite',correct:q.o[0],why:Array.isArray(q.x)?q.x[0]:q.x,yours:q.o[j],yw:Array.isArray(q.x)?q.x[j]:''},()=>{if(z.type=='speed'&&z.end)z.end+=Date.now()-t0;go2()})}}
/* popup explaining the correct answer after a miss (no scrolling needed) */
function popup(o,onClose){closePop();const m=document.createElement('div');m.className='modal';m.id='pop';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML=`<div class="sheet"><h3>${o.ok?'✓ Correct!':'✗ '+esc(o.title||'Not quite')}</h3><p class="ans">Correct answer: <b>${esc(o.correct)}</b></p><p class="why">${esc(o.why||'')}</p>${o.yours?`<p class="mu yours">Your answer (${esc(o.yours)}): ${esc(o.yw||'')}</p>`:''}<button class="btn pri wide" id="popgo">Got it</button></div>`;
  document.body.append(m);const done=()=>{if(!m.isConnected)return;m.remove();onClose&&onClose()};$('#popgo').onclick=done;m.onclick=e=>{if(e.target===m)done()};m._done=done;$('#popgo').focus({preventScroll:true})}
function closePop(){const m=$('#pop');if(m)m.remove()}
document.addEventListener('keydown',e=>{if(V!=='quiz'||!S.sess||e.target.tagName==='INPUT')return;const k=e.key;if('1234'.includes(k)&&k.length==1){const b=$$('.opt')[+k-1];if(b&&!b.disabled)b.click()}else if((k==='Enter'||k===' ')&&$('#pop')){e.preventDefault();$('#pop')._done()}else if((k==='Enter'||k===' ')&&$('#nx')){e.preventDefault();$('#nx').click()}});
function finish(){clearInterval(TM);const z=S.sess;if(!z||z.done)return;z.done=true;const M=MODES[z.type];
  const n=z.type=='speed'||z.lives<=0&&M.lives||(z.story&&z.won)?z.ans.filter(x=>x!==undefined).length:z.items.length;const ans=z.items.slice(0,Math.max(n,z.ans.length)),ok=ans.filter((it,k)=>z.ans[k]===0).length,tot=Math.max(ans.length,1),sc=pc(ok,tot);
  const dead=M.lives&&z.lives<=0&&!z.won,won=z.story?!!z.won:sc>=75;
  S.hist.push({t:td(),s:sc,n:tot,p:S.p,m:z.type});S.hist=S.hist.slice(-60);touch();S.day.g++;
  let bonus=ok>=tot*.75?25:5;const perf=!dead&&ok===tot&&tot>=5;if(perf)bonus+=25;
  let first=false;if(z.type=='daily'&&S.daily!==td()){S.daily=td();bonus+=50;first=true}
  if(!z.story)bonus+=Math.min(z.kills||0,6)*5;
  let jn=null;if(z.story&&window.JN){jn=JN.stageResult(z,sc,dead);bonus+=jn.bonus}
  gain(bonus);
  checkBadges({perf,daily:z.type=='daily',boss:z.type=='mock'&&tot>=10&&sc>=75,spd:z.type=='speed'&&ok>=12});
  const res={z,ok,tot,sc,dead,won,bonus,first,jn,stars:jn?jn.stars:sc>=85?3:sc>=60?2:sc>0?1:0};S.sess=null;save();A=res;go('res',res)}
VIEWS.res=function(){const{z,ok,tot,sc,dead,won,bonus,stars,first}=A,M=MODES[z.type],by={};
  z.items.slice(0,Math.max(tot,z.ans.length)).forEach((it,k)=>{if(z.ans[k]===undefined)return;const s=sub(it.s);by[s.n]=by[s.n]||[0,0];by[s.n][1]++;if(z.ans[k]===0)by[s.n][0]++});
  const msg=dead?'You ran out of hearts. Read the explanations below and try again.':z.type=='speed'?`Time is up! You got ${ok} right. Best combo: x${z.best}.`:sc>=75?'Great result. Keep practicing a little every day.':'Read the explanations below. Questions you missed are saved in your Mistakes tab.';
  $('#app').innerHTML=`<div class="stage3 win" id="st"></div>
  <div class="resh"><div class="stars">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}" style="--d:${i*.25}s">★</span>`).join('')}</div><h1>${dead?'Defeated':z.story?(won?z.foe+' defeated!':'The monster survived'):(z.kills?z.kills+' monster'+(z.kills>1?'s':'')+' slain':'Run complete')}</h1><div class="big" id="bg">0%</div><p class="mu">${ok}/${tot} correct · +${bonus} bonus XP${first?' (daily bonus!)':''}</p><p>${msg}</p></div>
  ${A.jn?window.JN.resButtons(A):'<div class="row2"><button class="btn gold" id="ag">↻ Play again</button><button class="btn pri" data-v="home">Home</button></div>'}
  ${S.err.length?`<button class="btn ghost wide" id="wk">🩹 Retry ${S.err.length} saved mistake${S.err.length>1?'s':''}</button>`:''}
  <p class="mu">Score by subject: ${Object.entries(by).map(([n,v])=>esc(n)+' '+v[0]+'/'+v[1]).join(' · ')||'n/a'}</p>
  <h2>Explanations</h2>${z.items.slice(0,Math.max(tot,z.ans.length)).map((it,k)=>{if(z.ans[k]===undefined)return'';const q=sub(it.s).q[it.i],g=z.ans[k];return `<details class="card rat ${g===0?'ok':'no'}"><summary><b>${g===0?'✓':'✗'}</b> ${esc(q.q)}</summary><p><b>Answer:</b> ${esc(q.o[0])}</p><p class="mu">${esc(Array.isArray(q.x)?q.x[0]:q.x)}${g!==0&&Array.isArray(q.x)?'<br>Your answer ('+esc(q.o[g])+'): '+esc(q.x[g]||''):''}</p></details>`}).join('')}`;
  const el=$('#st');mount(el,{mode:'hero',hero:hero().id,accent:0xffc83d});if(ST){setTimeout(()=>ST&&(won||sc>=60?ST.cheer():ST.wave()),400)}
  if(!dead&&sc>=60){confetti(90);SND.win()}
  let v=0;const bg=$('#bg'),t=setInterval(()=>{v+=Math.max(1,sc/25|0);if(v>=sc){v=sc;clearInterval(t)}bg.textContent=v+'%'},30);
  if(A.jn)window.JN.bindRes(A);else $('#ag').onclick=()=>{if(z.type=='daily')startDaily();else if(z.type=='weak')startWeak();else{const L=z.type=='drill'&&z.items.length&&new Set(z.items.map(i=>i.s)).size==1?[sub(z.items[0].s)]:subs();start(z.type,L,z.type=='speed'?300:z.items.length,{boss:!!z.hp})}};
  const wk=$('#wk');if(wk)wk.onclick=startWeak};

/* ---------- FLASHCARDS & MISTAKES ---------- */
let CT='rev',FREE=null;
VIEWS.cards=function(){const L=FREE||dueCards(),ctxc=!!window.CARDCTX,tabs=ctxc?'':`<div class="seg"><button class="${CT=='rev'?'on':''}" data-t="rev">Flashcards</button><button class="${CT=='err'?'on':''}" data-t="err">Mistakes (${S.err.length})</button></div>`;
  if(CT==='err')return mistakes(tabs);
  if(!L.length){$('#app').innerHTML=`<h1>Flashcards</h1>${tabs}<div class="card center"><div class="trophy">🎉</div><h3>All caught up!</h3><p class="mu">Cards come back after 1, 3, 7 and 14 days to help you remember them.</p><button class="btn pri" id="fa">Study all ${subs().reduce((a,s)=>a+s.c.length,0)} cards anyway</button></div>`;$$('[data-t]').forEach(b=>b.onclick=()=>{CT=b.dataset.t;render()});$('#fa').onclick=()=>{FREE=shuf(subs().flatMap(s=>s.c.map((c,i)=>({k:s.id+'.'+i,c,s,free:1}))));render()};return}
  const c=L[0];$('#app').innerHTML=`<h1>${ctxc?'Warm-up cards':'Flashcards'}</h1>${tabs}<p class="mu chint">${L.length} ${FREE?'in this study set':'due'} · ${c.s.ic} ${esc(c.s.n)}. Read the description, say the term aloud, then flip.</p>
  <div class="fscene"><div class="fcard" id="fc" tabindex="0" role="button" aria-label="Flip card"><div class="fside ffr" style="--c:${c.s.col}"><span class="tag">Description</span><div class="${c.c[1].length>90?'long':''}">${esc(c.c[1])}</div><small>What is this called? Tap to flip</small></div><div class="fside fbk"><span class="tag">Term</span><div class="term">${esc(c.c[0])}</div>${c.c[2]?`<p class="exs"><b>Real-life example:</b> ${esc(c.c[2])}</p>`:''}</div></div></div>
  <div class="row2" id="bt" style="visibility:hidden"><button class="btn no" id="no">✗ Missed it</button><button class="btn ok" id="yes">✓ Got it</button></div>${FREE?`<button class="btn ghost sm" id="ex">${ctxc?'Back to chapter':'End study set'}</button>`:''}`;
  $$('[data-t]').forEach(b=>b.onclick=()=>{CT=b.dataset.t;render()});const ex=$('#ex');if(ex)ex.onclick=()=>{FREE=null;if(ctxc)return JN.cardsExit();render()};
  const fc=$('#fc');let flipped=false,sx=null,dx=0;const flip=()=>{flipped=!flipped;fc.classList.toggle('flipped',flipped);$('#bt').style.visibility=flipped?'visible':'hidden';SND.tap()};
  const rate=y=>{if(!flipped)return;fc.classList.add(y?'out-r':'out-l');if(!c.free){const d=S.cards[c.k]||{b:0},b=y?Math.min(d.b+1,4):0,iv=[0,1,3,7,14][b];S.cards[c.k]={b,seen:Date.now(),due:y?ld(Date.now()+iv*864e5):td()}}else{FREE.shift()}S.day.f++;S.tot.f++;if(y){gain(5,fc);SND.ok()}else SND.no();save();checkBadges();setTimeout(()=>{if(FREE&&!FREE.length){FREE=null;if(ctxc)return JN.cardsDone()}render()},280)};
  fc.onpointerdown=e=>{sx=e.clientX;dx=0;fc.setPointerCapture(e.pointerId);fc.style.transition='none'};
  fc.onpointermove=e=>{if(sx===null)return;dx=e.clientX-sx;if(flipped&&Math.abs(dx)>8)fc.style.transform=`translateX(${dx}px) rotateZ(${dx/20}deg) rotateY(180deg)`};
  fc.onpointerup=()=>{if(sx===null)return;fc.style.transition='';const d=dx;sx=null;fc.style.transform='';if(Math.abs(d)<8)flip();else if(flipped&&Math.abs(d)>90)rate(d>0)};
  fc.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}};
  $('#yes').onclick=()=>rate(true);$('#no').onclick=()=>rate(false)};
function mistakes(tabs){$('#app').innerHTML=`<h1>Flashcards</h1>${tabs}`+(S.err.length?S.err.map((e,i)=>{const s=sub(e.s),q=s.q[e.i];return `<div class="card"><span class="tag" style="--c:${s.col}">${s.ic} ${esc(s.n)}</span><p><b>${esc(q.q)}</b></p><p>Answer: <b>${esc(q.o[0])}</b></p><p class="mu">${esc(Array.isArray(q.x)?q.x[0]:q.x)}</p></div>`}).join('')+'<button class="btn gold wide" id="re">⚔️ Retry these in battle</button>':'<div class="card center"><div class="trophy">✨</div><p>No saved mistakes. Wrong answers are collected here automatically.</p></div>');
  $$('[data-t]').forEach(b=>b.onclick=()=>{CT=b.dataset.t;render()});const r=$('#re');if(r)r.onclick=startWeak}

/* ---------- HERO PICKER ---------- */
VIEWS.hero=function(){const first=A&&A.first,sel=S.hero||R3.ROSTER[0].id;let cur=sel;
  $('#app').innerHTML=`<h1>${first?'Choose your psychologist':'Your psychologists'}</h1><p class="mu">${first?'Pick a companion to study and battle with. ':''}These are stylized 3D illustrations, not real portraits. Drag to rotate. Level up to unlock more psychologists (you are level ${lvl()}).</p>
  <div class="stage3 big" id="st"></div><div class="plate" id="pl"></div>
  <div class="roster">${R3.ROSTER.map(r=>{const u=r.lv<=lvl();return `<button class="rc tilt ${u?'':'lk'}" data-h="${r.id}" aria-label="${u?esc(r.n):'Locked until level '+r.lv}">${portrait(r.id,200)}<b>${u?esc(r.n):'Locked'}</b><small>${u?esc(r.y):'Unlocks at Lv '+r.lv}</small></button>`}).join('')}</div>`;
  const show=id=>{const r=R3.byId[id],u=r.lv<=lvl();cur=id;if(ST&&u)ST.setHero(id);$('#pl').innerHTML=u?`<div><b>${esc(r.n)}</b><small>${esc(r.tag)} · ${esc(r.y)}<br>${esc(r.bio)}</small></div><button class="btn ${id===S.hero?'ghost':'gold'} sm" id="ch">${id===S.hero?'Selected ✓':'Choose'}</button>`:`<div><b>🔒 Locked</b><small>Reach Lv ${r.lv} to unlock this psychologist.</small></div>`;$$('.rc').forEach(b=>b.classList.toggle('sel',b.dataset.h===id));const ch=$('#ch');if(ch)ch.onclick=()=>{S.hero=id;save();SND.up();confetti(40);if(first)go('home');else render()}};
  mount($('#st'),{mode:'hero',hero:sel,accent:0xffc83d});show(sel);$$('.rc').forEach(b=>b.onclick=()=>{SND.tap();show(b.dataset.h)})};

/* ---------- ME ---------- */
VIEWS.me=function(){const L=lvl(),b=40*(L-1)**2,n=40*L*L,h=hero(),r=readiness();
  const nb=Object.keys(S.badges).length;
  $('#app').innerHTML=`${window.OL?OL.card():''}<div class="card prof"><div class="avt">${portrait(h.id,160)}</div><div><h2 style="margin:0">${esc(h.n)}</h2><span class="mu">${rank()} · Lv ${L}</span><div class="xp" style="margin-top:8px"><i style="width:${pc(S.xp-b,n-b)}%"></i></div><small class="mu">${S.xp} XP · ${n-S.xp} to next level</small></div></div>
  <div class="stats"><div><b>${S.streak}</b><small>day streak</small></div><div><b>${S.tot.a}</b><small>answered</small></div><div><b>${pc(S.tot.c,S.tot.a)}%</b><small>accuracy</small></div><div><b>${S.tot.best}</b><small>best combo</small></div></div>
  <button class="btn pri wide" data-v="hero">🧑‍🏫 Change psychologist (${unlockedHeroes().length}/${R3.ROSTER.length} unlocked)</button>
  <h2>Mastery</h2><div class="card">${subs().map(s=>{const m=mast(s);return `<div class="mrow"><span>${s.ic} ${esc(s.n)}</span><span class="pbar" style="--c:${s.col}"><i style="width:${m||0}%"></i></span><b>${m===null?'–':m+'%'}</b></div>`}).join('')}</div>
  <h2>Badges (${nb}/${BADGES.length})</h2><div class="badges">${BADGES.map(x=>`<div class="bdg ${S.badges[x[0]]?'on':''}" title="${esc(x[2])}"><span>${x[3]}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join('')}</div>
  <h2>Settings</h2><div class="card set">
   <label class="sw"><span>Sound effects</span><input type="checkbox" id="s1" ${S.set.snd?'checked':''}></label>
   <label class="sw"><span>Reduce motion</span><input type="checkbox" id="s2" ${S.set.mo?'checked':''}></label>
   <label><span>Theme</span><select id="s3" class="inp"><option value="auto">Match device</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
   <label><span>Text size</span><input type="range" id="s4" min=".9" max="1.3" step=".05" value="${S.set.fz}"></label>
   <button class="btn ghost" id="s5">Reset all progress</button></div>
  <p class="mu">${S.p=='r'?'RPsy':'RGC'} readiness estimate: ${r.v}%. It becomes more reliable after 3 Boss Exams, and it is not a prediction.</p>
  <details class="how"><summary>About this app</summary><p class="mu">All questions are original practice questions written for this app. They are not actual or leaked board exam questions. Practice scores do not predict or guarantee your real PRC result. Philippine law facts and the exam structure were checked against PRC and statute sources on November 3, 2026. Clinical content follows standard textbooks and is not cited question by question. Please cross-check with your textbooks and the current PRC table of specifications before relying on any question. The characters are stylized 3D illustrations, not real portraits.</p></details>`;
  if(window.OL)OL.bind();
  $('#s3').value=S.set.theme;
  $('#s1').onchange=e=>{S.set.snd=+e.target.checked;save();SND.tap()};$('#s2').onchange=e=>{S.set.mo=+e.target.checked;save();applySet()};$('#s3').onchange=e=>{S.set.theme=e.target.value;save();applySet()};$('#s4').oninput=e=>{S.set.fz=+e.target.value;save();applySet()};
  $('#s5').onclick=()=>{if(confirm('Erase all RPsy progress on this device?')){S=init();save();go('home')}}};

/* ---------- boot ---------- */
if(S.sess&&S.sess.end&&S.sess.end<Date.now())S.sess=null;
if(S.sess&&!MODES[S.sess.type])S.sess=null;
if(S.sess&&S.sess.items&&S.sess.items.some(it=>!sub(it.s)||!sub(it.s).q[it.i]))S.sess=null;
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)save()});

