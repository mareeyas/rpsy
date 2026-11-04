'use strict';
/* RPsy Journey: the main story line. Eight chapters from the Data Marshes to the Licensure Citadel.
   Each chapter has a briefing, warm-up cards, trial battles and a boss. Side quests (daily, speed, weak spots,
   boss exam, battle friends) stay available in Play. */
window.CARDCTX=null;
const CH=[
{id:'res',num:'Chapter 1',name:'The Data Marshes',ic:'📈',col:'#14b8a6',subj:'res',kind:'horror',bossName:'The Spurious Correlation Horror',
 blurb:'Numbers can tell the truth or tell lies. Learn to tell them apart.',
 intro:['Welcome, traveler. I am {hero}, and I will guide you to the Licensure Citadel.','The road begins in the Data Marshes, where sloppy statistics breed monsters.','Learn how research really works and the marsh will part before you.'],
 boss:['M:Correlation is causation… isn’t it? Hehehe…','The Horror feeds on confusion. Answer true and it will wither.'],
 outro:['Well done! You read the marsh like a map: samples, errors and effect sizes.','The Growing Grounds lie ahead. Walk with me.']},
{id:'dev',num:'Chapter 2',name:'The Growing Grounds',ic:'🌱',col:'#22c55e',subj:'dev',kind:'wraith',bossName:'The Stage-Skipper Wraith',
 blurb:'Every mind grows in stages. Know them, and you will understand every client’s story.',
 intro:['These fields hold the story of every life, from the first cry to the last reflection.','Piaget, Erikson, Vygotsky, Bowlby: their ideas bloom here.','A wraith drifts between the stages, confusing the unwary. Study well.'],
 boss:['M:Ages and stages are all the same to me… all a blur…','Hold steady. Name each stage and the wraith loses its shape.'],
 outro:['Beautifully done. You can trace a life from infancy to old age.','Next: the Mirror Village, where personality is studied.']},
{id:'pers',num:'Chapter 3',name:'The Mirror Village',ic:'🧠',col:'#8b5cf6',subj:'pers',kind:'ghoul',bossName:'The Bias Ghoul',
 blurb:'Freud, Jung, Rogers, Maslow, the Big Five and the Filipino concept of kapwa.',
 intro:['In the Mirror Village, every house reflects a different theory of who we are.','Defense mechanisms, archetypes, traits, self-efficacy: each one is a lens.','But beware the Bias Ghoul. It twists what you see in the mirrors.'],
 boss:['M:You only see what you want to see… the mirrors lie…','Trust your knowledge, not the reflection. Break the glass!'],
 outro:['The mirrors are clear again. You know the theories and their theorists.','The road darkens ahead. The Shadow Wards await.']},
{id:'abn',num:'Chapter 4',name:'The Shadow Wards',ic:'🌀',col:'#ec4899',subj:'abn',kind:'spider',bossName:'The Dread Weaver',
 blurb:'Diagnostic criteria, durations and the patterns that matter on the exam.',
 intro:['The Shadow Wards are heavy with fear, sorrow and confusion. This is where disorders are named and understood.','Durations, criteria, differential diagnosis: precision is your light here.','Silk threads hang everywhere. The Dread Weaver spins anxiety from doubt.'],
 boss:['M:So many threads… so many symptoms… you will tangle…','Stay clear. Precise criteria cut every thread.'],
 outro:['You faced the shadows with a steady mind and a clear head.','Now to the Measure Halls, where psychology becomes measurement.']},
{id:'assess',num:'Chapter 5',name:'The Measure Halls',ic:'📊',col:'#06b6d4',subj:'assess',kind:'horror',bossName:'The Error Horror',
 blurb:'Reliability, validity, norms, scores and the tests every psychologist must know.',
 intro:['Behold the Measure Halls: tests, scales, norms and numbers as far as the eye can see.','The exam weighs this heavily, so we linger here. Reliability and validity are your foundations.','Something slithers between the shelves. Measurement error given a body.'],
 boss:['M:Every score hides error… every test deceives…','Not so. Standardized, reliable, valid: that is how we beat you.'],
 outro:['Superb. You can judge a test by its reliability, validity and fairness.','On to the Counseling Cloister, the heart of the craft.']},
{id:'cth',num:'Chapter 6',name:'The Counseling Cloister',ic:'💬',col:'#3b82f6',subj:'cth',kind:'ghoul',bossName:'The Silence Ghoul',
 blurb:'Psychoanalytic, humanistic, cognitive-behavioral, systemic and brief therapies.',
 intro:['Quiet halls, warm lamps. This is where the helping professions practice their craft.','Rogers’ warmth, Beck’s thoughts, Ellis’s beliefs, Gestalt’s awareness, Bowen’s families.','But a Ghoul haunts these halls, feeding on unspoken pain.'],
 boss:['M:Say nothing… speak to no one… it is easier…','Listening is stronger than silence. Reflect, ask, and the Ghoul retreats.'],
 outro:['You know the schools of therapy and when to use their tools.','One bridge remains before the Citadel: the Oath Bridge of law and ethics.']},
{id:'ethr',num:'Chapter 7',name:'The Oath Bridge',ic:'⚖️',col:'#f59e0b',subj:'ethr',kind:'wraith',bossName:'The Breach Wraith',
 blurb:'RA 10029, informed consent, confidentiality and professional boundaries.',
 intro:['Every psychologist crosses this bridge. RA 10029, the Code of Ethics, informed consent, confidentiality.','Break an oath and the bridge crumbles beneath you.','A wraith guards it, whispering justifications for every shortcut.'],
 boss:['M:Just this once… no one will know… break the boundary…','Never. Our oath protects the client. Stand firm.'],
 outro:['The bridge holds. You carry the oath of the profession with you.','At last, the Licensure Citadel rises ahead.']},
{id:'final',num:'Final Chapter',name:'The Licensure Citadel',ic:'🏰',col:'#ef4444',subj:null,kind:'colossus',bossName:'The Doubt Colossus',
 blurb:'Everything you have learned, from every realm, in one last stand.',
 intro:['We have arrived. The Licensure Citadel, where all you have learned is put to the test.','The questions here come from every realm you crossed.','At its heart waits the Doubt Colossus. It feeds on every “I’m not ready.”'],
 boss:['M:YOU ARE NOT READY. YOU WILL NEVER BE READY.','You are. Every chapter proved it. Now show it!'],
 outro:['The Colossus crumbles to dust. The Citadel gates swing open.','You walked the whole road. You are ready for the board exam. Go and become a psychologist!'],
 st:[{t:'brief'},{t:'battle',n:12,need:8,xp:50},{t:'boss',n:20,need:15,xp:120}]}
];
const DEF=[{t:'brief'},{t:'cards',n:6},{t:'battle',n:8,need:5,xp:30},{t:'battle',n:8,need:5,xp:30},{t:'boss',n:10,need:7,xp:60}];
CH.forEach(c=>{if(!c.st)c.st=DEF});

window.JN=(()=>{
const rec=c=>S.story[CH[c].id]||(S.story[CH[c].id]={});
const sg=(c,k)=>(S.story[CH[c].id]||{})[k]||0;
const done=(c,k)=>sg(c,k)>0;
const chDone=c=>done(c,CH[c].st.length-1);
const chOpen=c=>c===0||chDone(c-1);
const stOpen=(c,k)=>chOpen(c)&&(k===0||done(c,k-1));
const stars=(c,k)=>{const v=sg(c,k);return '★'.repeat(v)+'☆'.repeat(Math.max(0,3-v))};
function next(){for(let c=0;c<CH.length;c++){if(!chOpen(c))break;for(let k=0;k<CH[c].st.length;k++)if(!done(c,k))return[c,k]}return null}
function stName(c,k){const s=CH[c].st[k];return s.t==='brief'?'Briefing':s.t==='cards'?'Warm-up cards':s.t==='boss'?'Boss: '+CH[c].bossName.replace(/^The /,''):'Trial '+(k===2?'I':k===3?'II':'')}
const stIcon=s=>s.t==='brief'?'📜':s.t==='cards'?'🃏':s.t==='boss'?'👹':'⚔️';
function stDesc(c,k){const s=CH[c].st[k];return s.t==='brief'?'Story and lesson':s.t==='cards'?'Review 6 key cards':`${s.n} questions · answer ${s.need} correctly to win`}
const chStars=c=>CH[c].st.reduce((a,_,k)=>a+sg(c,k),0);

function scene(o){go('scene',o)}
function play(c,k){const ch=CH[c],s=ch.st[k];
  if(!stOpen(c,k))return toast('Finish the previous stage first.','🔒');
  if(s.t==='brief')return scene({c,lines:ch.intro,then:()=>ch.subj?go('sub',{id:ch.subj,ch:c,k}):briefDone(c,k)});
  if(s.t==='cards')return cardsStage(c,k);
  const run=()=>startStory(c,k);
  if(s.t==='boss')scene({c,lines:ch.boss,foe:ch.kind,then:run});else run()}
function startStory(c,k){const ch=CH[c],s=ch.st[k],L=ch.subj?[sub(ch.subj)]:subs();
  start('story',L,s.n,{story:{c,k,need:s.need,xp:s.xp,boss:s.t==='boss'},foe:{kind:ch.kind,name:s.t==='boss'?ch.bossName:null}})}
function cardsStage(c,k){const ch=CH[c],sb=sub(ch.subj);window.CARDCTX={c,k};FREE=shuf(sb.c.map((cd,i)=>({k:sb.id+'.'+i,c:cd,s:sb,free:1}))).slice(0,6);CT='rev';go('cards')}
function mark(c,k,v){const r=rec(c);const prev=r[k]||0;if(v>prev)r[k]=v;save();return prev}
function cardsDone(){const x=window.CARDCTX;window.CARDCTX=null;if(!x)return go('map');const prev=mark(x.c,x.k,1);gain(prev?5:20);toast('Warm-up complete!','🃏');go('chapter',x.c)}
function cardsExit(){const x=window.CARDCTX;window.CARDCTX=null;FREE=null;go('chapter',x?x.c:undefined)}
function briefDone(c,k){const prev=mark(c,k,1);if(!prev)gain(15);toast('Briefing complete','📜');go('chapter',c)}
function stageResult(z,sc,dead){const st=z.story,c=st.c,k=st.k,pass=!!z.won&&!dead,stars=pass?(sc>=90?3:sc>=75?2:1):0;let bonus=0,first=false,chapterDone=false;
  if(pass){const prev=mark(c,k,stars);first=!prev;bonus=first?st.xp:10;chapterDone=first&&k===CH[c].st.length-1;
    if(chapterDone){if(c===0)setTimeout(()=>award('ch1'),900);if(c===CH.length-1)setTimeout(()=>award('story'),900)}}
  return{c,k,pass,stars,bonus,first,chapterDone}}
function outro(c){const ch=CH[c];scene({c,lines:ch.outro,then:()=>{if(c===CH.length-1){confetti(200);SND.win()}go(c===CH.length-1?'map':'chapter',c)}})}
function resButtons(A){const j=A.jn;
  if(j.pass)return `<button class="btn gold wide" id="jn1">${j.chapterDone?'📖 Chapter complete: see what happens next ▸':'Continue the journey ▸'}</button><button class="btn ghost wide" data-v="home">Home</button>`;
  return `<div class="row2"><button class="btn gold" id="jn2">↻ Retry stage</button><button class="btn ghost" id="jn3">Chapter</button></div><button class="btn ghost wide" data-v="home">Home</button>`}
function bindRes(A){const j=A.jn,b1=$('#jn1'),b2=$('#jn2'),b3=$('#jn3');
  if(b1)b1.onclick=()=>j.chapterDone?outro(j.c):go('chapter',j.c);
  if(b2)b2.onclick=()=>play(j.c,j.k);if(b3)b3.onclick=()=>go('chapter',j.c)}
function homeCta(){const n=next();
  if(!n)return `<button class="btn gold xl wide" data-v="map">🏰 Journey complete! Revisit chapters</button><button class="btn ghost wide" data-v="play">⚔️ Side quests &amp; modes</button>`;
  return `<button class="btn gold xl wide" id="jn">▶ Continue · ${esc(CH[n[0]].num)}: ${esc(stName(n[0],n[1]))}</button><button class="btn ghost wide" data-v="play">⚔️ Side quests &amp; modes</button>`}
function bindHome(){const b=$('#jn');if(b)b.onclick=()=>{const n=next();if(n)play(n[0],n[1])}}

/* ---- Journey map ---- */
VIEWS.map=function(){const n=next(),h=hero();
  $('#app').innerHTML=`<h1>The Road to Licensure</h1>
  <div class="card jhero"><div class="avt">${portrait(h.id,160)}</div><div><small class="mu">${esc(h.n)} says</small><p style="margin:2px 0 8px">${n?(n[1]===0&&n[0]===0&&!done(0,0)?'Your journey begins here. Let’s cross the Data Marshes.':'Next up: <b>'+esc(CH[n[0]].name)+'</b>, '+esc(stName(n[0],n[1]))+'.'):'You completed the journey. Replay any chapter to sharpen your skills.'}</p>${n?'<button class="btn gold sm" id="jgo">Continue ▸</button>':''}</div></div>
  <div class="path">${CH.map((ch,c)=>{const u=chOpen(c),total=ch.st.length,got=ch.st.filter((_,k)=>done(c,k)).length;return `<button class="pnode tilt ${u?'':'lk'} ${chDone(c)?'mx':''}" ${u?'':'disabled'} data-ch="${c}" style="--c:${ch.col};--p:${Math.round(100*got/total)}%"><span class="coin"><i>${u?ch.ic:'🔒'}</i></span><span class="nt"><small>${esc(ch.num)}</small><b>${esc(ch.name)}</b><small>${u?got+'/'+total+' stages · '+chStars(c)+'★':'Beat the previous boss to unlock'}</small><span class="pbar"><i style="width:${Math.round(100*got/total)}%"></i></span></span></button>`}).join('')}</div>
  <h2>Side quests</h2><p class="mu">Not tied to the story. Play any time for XP and practice.</p>
  <div class="sqs"><button class="sq" id="sq1">☀️<b>Daily Challenge</b></button><button class="sq" id="sq2">🚀<b>Speed Round</b></button><button class="sq" id="sq3">🩹<b>Weak Spots</b><small>${S.err.length}</small></button><button class="sq" data-v="vs">🤺<b>Battle Friends</b></button><button class="sq" data-v="play">👑<b>Boss Exam</b></button><button class="sq" data-v="cards">🃏<b>Flashcards</b></button></div>
  <details class="how"><summary>Study library: all subjects, free study</summary><div class="lib">${subs().map(s=>{const m=mast(s);return `<button class="sc" style="--c:${s.col}" data-v="sub" data-a="${s.id}">${s.ic} ${esc(s.n.replace('Advance ','').replace('Law & Ethics: ','Ethics: '))}${m===null?'':' · '+m+'%'}</button>`}).join('')}</div></details>`;
  $$('[data-ch]').forEach(b=>b.onclick=()=>{SND.tap();go('chapter',+b.dataset.ch)});const g=$('#jgo');if(g)g.onclick=()=>play(n[0],n[1]);
  $('#sq1').onclick=startDaily;$('#sq2').onclick=()=>start('speed',subs(),300);$('#sq3').onclick=()=>{if(!S.err.length)return toast('No saved mistakes yet. Nice!','✨');startWeak()}};

/* ---- Chapter ---- */
VIEWS.chapter=function(){const c=+A,ch=CH[c];if(isNaN(c)||!ch)return go('map');
  $('#app').innerHTML=`<button class="btn ghost sm" data-v="map">← Journey</button>
  <div class="banner" style="--c:${ch.col}"><span class="bic">${ch.ic}</span><div><small>${esc(ch.num)}</small><h1>${esc(ch.name)}</h1><span class="tag">${ch.subj?esc(sub(ch.subj).n):'All subjects'}</span></div></div>
  <p class="mu">${esc(ch.blurb)}</p>
  <div class="stages">${ch.st.map((s,k)=>{const o=stOpen(c,k),d=done(c,k);return `<button class="stn ${o?'':'lk'} ${d?'dn':''} ${s.t==='boss'?'bossn':''}" data-k="${k}" ${o?'':'disabled'}><span class="si">${o?stIcon(s):'🔒'}</span><span class="nt"><b>${esc(stName(c,k))}</b><small>${esc(stDesc(c,k))}</small></span><span class="stv">${s.t==='brief'||s.t==='cards'?(d?'✓':''):stars(c,k)}</span></button>`}).join('')}</div>`;
  $$('[data-k]').forEach(b=>b.onclick=()=>{SND.tap();play(c,+b.dataset.k)})};

/* ---- Story scene with dialogue ---- */
VIEWS.scene=function(){const o=A;if(!o)return go('map');const ch=CH[o.c],h=hero(),lines=o.lines;let i=0,timer=0,cur='';
  $('#app').innerHTML=`<div class="fit scene"><div class="stage3 sc" id="st"><div class="chp" style="--c:${ch.col}">${ch.ic} ${esc(ch.num)} · ${esc(ch.name)}</div></div><div class="dlg"><b class="spk" id="spk"></b><p id="dt" aria-live="polite"></p><div class="row2"><button class="btn ghost" id="skip">Skip</button><button class="btn gold" id="nxt">Next ▸</button></div></div></div>`;
  if(o.foe)mount($('#st'),{mode:'battle',hero:h.id,enemy:{kind:o.foe},accent:0xff2a40});else mount($('#st'),{mode:'hero',hero:h.id,shift:0,accent:0xffc83d});
  const show=()=>{const raw=lines[i],mon=raw.startsWith('M:');cur=(mon?raw.slice(2):raw).replace(/\{hero\}/g,h.n);const sp=$('#spk');sp.textContent=mon?ch.bossName:h.n;sp.className='spk'+(mon?' mon':'');const el=$('#dt');clearInterval(timer);
    if(mon&&ST&&ST.enemyAttack&&o.foe)ST.enemyHit&&ST.enemyHit();if(!mon&&ST&&ST.wave&&i===0)ST.wave();
    if(RM()){el.textContent=cur;return}el.textContent='';let n=0;timer=setInterval(()=>{n+=2;el.textContent=cur.slice(0,n);if(n>=cur.length)clearInterval(timer)},20)};
  const fin=()=>{clearInterval(timer);if(!o.then)return go('map');o.then()};
  $('#nxt').onclick=()=>{const el=$('#dt');if(el.textContent.length<cur.length){clearInterval(timer);el.textContent=cur;return}SND.tap();if(++i<lines.length)show();else fin()};
  $('#skip').onclick=fin;show()};

return{done,next,play,briefDone,cardsDone,cardsExit,stageResult,resButtons,bindRes,homeCta,bindHome,chapters:CH,stOpen,chOpen};
})();
