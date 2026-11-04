/* RPsy monsters: creepy "misconception" creatures built from primitives with glowing eyes, teeth and claws.
   R3M.make(kind) -> {g, anim(t,dt,rm), flash:[materials]}. Origin is at the monster's feet. */
(function(){
const T=window.THREE;
const rng=seed=>{let s=(seed>>>0)||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)};
const SM=(c,r,m,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r==null?.6:r,metalness:m||0},o||{}));
const PM=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:c,roughness:.4},o||{}));
const glow=c=>new T.MeshBasicMaterial({color:c,toneMapped:false});
function mk(g,m,x,y,z,sx,sy,sz){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);if(sx!==undefined)o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);o.castShadow=true;return o}
const SP=(r,w,h)=>new T.SphereGeometry(r,w||24,h||16);
const cone=(r,h,s)=>new T.ConeGeometry(r,h,s||8);
function bloodEye(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=rng(5);g.fillStyle='#efe3d0';g.fillRect(0,0,128,128);
  for(let i=0;i<46;i++){g.strokeStyle='rgba(170,20,20,'+(.35+r()*.4)+')';g.lineWidth=.8+r()*1.5;g.beginPath();let x=64+Math.cos(i)*52,y=64+Math.sin(i)*52;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(64-x)*.22+(r()-.5)*14;y+=(64-y)*.22+(r()-.5)*14;g.lineTo(x,y)}g.stroke()}
  const gr=g.createRadialGradient(64,64,4,64,64,26);gr.addColorStop(0,'#10120a');gr.addColorStop(.35,'#10120a');gr.addColorStop(.38,'#d6e04a');gr.addColorStop(1,'#6a7a10');g.fillStyle=gr;g.beginPath();g.arc(64,64,26,0,7);g.fill();g.fillStyle='#050505';g.beginPath();g.ellipse(64,64,5,19,0,0,7);g.fill();
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
let EYE=null;const eyeball=r=>{EYE=EYE||bloodEye();return mk(SP(r,20,14),SM(0xffffff,.25,0,{map:EYE}))};
function claw(len,mat){const g=new T.Group();g.add(mk(new T.CylinderGeometry(.012,.02,len*.5,6),mat,0,-len*.25,0));const c=mk(cone(.02,len*.6,6),SM(0xe8e0c8,.35),0,-len*.75,0);c.rotation.x=Math.PI;g.add(c);return g}
function hand(mat,n,len,spread){const h=new T.Group();h.add(mk(SP(.07,12,10),mat,0,0,0,1,.8,.6));for(let i=0;i<n;i++){const f=claw(len,mat);f.position.set((i-(n-1)/2)*spread,-.03,0);f.rotation.z=(i-(n-1)/2)*.12;f.rotation.x=.25;h.add(f)}return h}
function teeth(g,count,r,y,z,sz,mat,down){for(let i=0;i<count;i++){const a=(i/(count-1)-.5)*Math.PI*.9;const t=mk(cone(sz*.4,sz,5),mat,Math.sin(a)*r,y+(down?-1:1)*Math.cos(a)*r*.18,z+Math.cos(a)*r*.2);t.rotation.x=down?0:Math.PI;t.rotation.z=-a*.3;g.add(t)}}
const TOOTH=()=>SM(0xd9d2a8,.4);

/* ---------- Wraith: hooded, tattered, glowing eyes, reaching arms ---------- */
function wraith(col){
  const g=new T.Group(),flash=[],fl=new T.Group();g.add(fl);
  const cloakM=SM(0x0b0b18,.92,0,{side:T.DoubleSide,emissive:0x05050d});flash.push(cloakM);
  const pts=[[.03,2.05],[.2,1.95],[.34,1.7],[.42,1.4],[.58,.95],[.72,.5],[.86,0]].map(v=>new T.Vector2(v[0],v[1]));
  const lg=new T.LatheGeometry(pts,48),p=lg.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);if(y<.6){const k=(.6-y)/.6;p.setXYZ(i,x*(1+.14*Math.sin(a*9)*k),y-.34*Math.abs(Math.sin(a*6+.5))*k*k,z*(1+.14*Math.sin(a*9)*k))}}
  lg.computeVertexNormals();fl.add(mk(lg,cloakM,0,.3,0));
  const hoodIn=mk(SP(.27,20,16),SM(0x020204,1),0,1.85,.16,.9,1.1,.85);fl.add(hoodIn);
  const eyeM=glow(col||0xff2a3a);[-1,1].forEach(s=>{const e=mk(SP(.055,12,8),eyeM,s*.1,1.88,.36,1.5,.6,.5);e.rotation.z=-s*.35;fl.add(e)});
  const jaw=mk(SP(.14,14,10),SM(0xcfc8b4,.6),0,1.69,.3,.8,1.1,.7);fl.add(jaw);const tm=TOOTH();for(let i=0;i<9;i++){const x=(i-4)*.026;const t=mk(cone(.01,.06,4),tm,x,1.68,.4);t.rotation.x=Math.PI;fl.add(t);const t2=mk(cone(.01,.05,4),tm,x,1.74,.4);fl.add(t2)}
  const skin=SM(0x5a6070,.7,0,{emissive:0x080a10});flash.push(skin);const arms=[];
  [-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.4,1.5,.1);a.add(mk(new T.CapsuleGeometry(.045,.55,4,8),skin,0,-.32,0));const el=new T.Group();el.position.y=-.64;el.add(mk(new T.CapsuleGeometry(.04,.5,4,8),skin,0,-.28,0));const h=hand(skin,4,.28,.045);h.position.y=-.58;el.add(h);a.add(el);a.userData.el=el;fl.add(a);arms.push(a)});
  const N=34,pa=new Float32Array(N*3),pg=new T.BufferGeometry();for(let i=0;i<N;i++){pa[i*3]=(Math.random()-.5)*1.4;pa[i*3+1]=Math.random()*2;pa[i*3+2]=(Math.random()-.5)*1.0}pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const wisps=new T.Points(pg,new T.PointsMaterial({color:0x8ab4ff,size:.06,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));g.add(wisps);
  const anim=(t,dt,rm)=>{const k=rm?0:1;fl.position.y=.18+Math.sin(t*1.4)*.08*k;fl.rotation.z=Math.sin(t*.9)*.04*k;
    arms.forEach((a,i)=>{const s=i?1:-1;a.rotation.z=s*(.25+Math.sin(t*1.1+i)*.12*k);a.rotation.x=-.9+Math.sin(t*1.7+i*2)*.15*k;a.userData.el.rotation.x=-.4+Math.sin(t*2.3+i)*.2*k});
    eyeM.color.setRGB(1,.16+.1*Math.sin(t*9)*k,.2);const pp=pg.attributes.position;if(!rm){for(let i=0;i<N;i++){let y=pp.getY(i)+dt*.3;if(y>2.2)y=0;pp.setY(i,y)}pp.needsUpdate=true}};
  return{g,anim,flash,eyes:eyeM}}

/* ---------- Spider: eight skittering legs, cluster of red eyes, fangs ---------- */
function spider(col){
  const g=new T.Group(),flash=[];const body=PM(0x0c0712,{roughness:.25,clearcoat:.8,metalness:.2,emissive:0x0a0412});flash.push(body);
  const bob=new T.Group();g.add(bob);
  bob.add(mk(SP(.62,32,24),body,0,.8,-.55,1,.85,1.25));
  const mark=new T.MeshBasicMaterial({color:0xff2a2a,toneMapped:false});bob.add(mk(SP(.07,10,8),mark,0,1.14,-.5,1,.5,2.2));bob.add(mk(SP(.07,10,8),mark,0,1.14,-.85,1.6,.5,1.2));
  bob.add(mk(SP(.4,24,18),body,0,.78,.2,1,.85,1));
  const head=mk(SP(.27,20,16),body,0,.78,.56);bob.add(head);
  const eyeM=glow(0xff3040);[[0,.12,.2,.08],[-.1,.11,.19,.08],[.1,.11,.19,.08],[-.17,.07,.15,.045],[.17,.07,.15,.045],[-.07,.2,.17,.04],[.07,.2,.17,.04]].forEach(e=>head.add(mk(SP(e[3],12,10),eyeM,e[0],e[1],e[2]+.02)));
  const fm=SM(0xe6dcc0,.35);[-1,1].forEach(s=>{const f=mk(new T.ConeGeometry(.05,.36,8),fm,s*.09,-.16,.2);f.rotation.x=Math.PI-.3;f.rotation.z=s*.12;head.add(f);const pp=mk(new T.CapsuleGeometry(.03,.2,4,6),body,s*.2,-.05,.2);pp.rotation.z=s*.7;head.add(pp)});
  const legs=[];const along=(len,r0,r1,m)=>{const c=mk(new T.CylinderGeometry(r1,r0,len,8),m,len/2,0,0);c.rotation.z=Math.PI/2;return c};
  for(let i=0;i<8;i++){const side=i<4?1:-1,k=i%4,leg=new T.Group();leg.position.set(0,.82,-.4+k*.26);leg.scale.x=side;leg.rotation.y=(1.5-k)*.5-.1;
    const up=new T.Group();up.rotation.z=.8;up.add(along(.62,.055,.04,body));up.add(mk(SP(.06,10,8),body,0,0,0));
    const knee=new T.Group();knee.position.x=.62;knee.rotation.z=-2.0;knee.add(mk(SP(.055,10,8),body,0,0,0));knee.add(along(1.05,.04,.016,body));const tip=mk(cone(.02,.16,6),SM(0xcfc6a8),1.1,0,0);tip.rotation.z=-Math.PI/2;knee.add(tip);
    up.add(knee);leg.add(up);leg.userData={up,knee,ph:i*.9+(side<0?.45:0)};g.add(leg);legs.push(leg)}
  const anim=(t,dt,rm)=>{const k=rm?0:1;bob.position.y=Math.sin(t*3)*.03*k;legs.forEach(l=>{const u=l.userData;u.up.rotation.z=.8+Math.sin(t*5+u.ph)*.12*k;u.knee.rotation.z=-2.0+Math.sin(t*5+u.ph+1)*.22*k});head.rotation.y=Math.sin(t*1.3)*.2*k;eyeM.color.setRGB(1,.18+.12*Math.sin(t*11)*k,.25)};
  g.scale.setScalar(1);return{g,anim,flash,eyes:eyeM}}

/* ---------- Ghoul: gaunt, hollow eyes, wide jagged grin, long clawed arms ---------- */
function ghoul(col,boss){
  const g=new T.Group(),flash=[];const skin=SM(boss?0x3a1512:0x4f5a4b,.7,0,{emissive:0x0c0e0c});flash.push(skin);
  const sway=new T.Group();g.add(sway);
  const legM=SM(0x3a3a34,.9);[-1,1].forEach(s=>{sway.add(mk(new T.CapsuleGeometry(.09,.7,4,8),legM,s*.2,.55,0));sway.add(mk(SP(.14,10,8),legM,s*.2,.1,.1,1,.5,1.8))});
  sway.add(mk(new T.CapsuleGeometry(.3,.75,6,14),skin,0,1.28,0,1,1,.8));
  for(let i=0;i<6;i++){const r=mk(new T.TorusGeometry(.26-i*.012,.016,6,16,Math.PI),SM(0xd8d4c0,.5),0,1.0+i*.11,.22-i*.005,1,1,.7);r.rotation.x=0;r.rotation.z=Math.PI;r.rotation.z=0;sway.add(r)}
  const head=new T.Group();head.position.set(0,1.95,.12);sway.add(head);
  head.add(mk(SP(.4,28,20),skin,0,0,.05,.88,1.05,.95));
  head.add(mk(SP(.3,20,14),skin,0,-.22,.1,1,.7,.9));
  const sock=SM(0x050405,1);[-1,1].forEach(s=>{head.add(mk(SP(.12,16,12),sock,s*.15,.06,.31,1,1.1,.6));});
  const eyeM=glow(boss?0xff8a1e:0xd8ff3a);[-1,1].forEach(s=>head.add(mk(SP(.035,10,8),eyeM,s*.15,.06,.4)));
  head.add(mk(SP(.04,8,6),sock,-.03,-.06,.44,.7,2,.5));head.add(mk(SP(.04,8,6),sock,.03,-.06,.44,.7,2,.5));
  const mouth=new T.Group();mouth.position.set(0,-.2,.34);mouth.add(mk(SP(.26,22,14),SM(0x2a0608,.8),0,0,0,1,.4,.35));
  const tm=TOOTH();for(let i=0;i<14;i++){const a=(i/13-.5)*2.2;const tt=mk(cone(.018,.11+(i%3)*.02,5),tm,Math.sin(a)*.24,.045,Math.cos(a)*.09+.04);tt.rotation.x=Math.PI;mouth.add(tt);const tb=mk(cone(.018,.1,5),tm,Math.sin(a)*.23,-.045,Math.cos(a)*.09+.04);mouth.add(tb)}
  head.add(mouth);
  if(boss){[-1,1].forEach(s=>{const h=mk(new T.CylinderGeometry(.03,.11,.7,10),SM(0x2a1a14,.5),s*.3,.52,.0);h.rotation.z=-s*.5;head.add(h);const t=mk(cone(.03,.3,8),SM(0x2a1a14,.5),s*.5,.84,.0);t.rotation.z=-s*.9;head.add(t)})}
  const hairM=SM(0x1a1818,.9);for(let i=0;i<9;i++){const h=mk(new T.CylinderGeometry(.006,.012,.55,4),hairM,(i-4)*.07,.3,-.12);h.rotation.z=(i-4)*.04;head.add(h)}
  const arms=[];[-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.38,1.7,0);a.add(mk(new T.CapsuleGeometry(.055,.75,4,8),skin,0,-.45,0));const el=new T.Group();el.position.y=-.9;el.add(mk(new T.CapsuleGeometry(.05,.7,4,8),skin,0,-.4,0));const h=hand(skin,5,.4,.045);h.position.y=-.82;el.add(h);a.add(el);a.userData.el=el;sway.add(a);arms.push(a)});
  if(boss){const cr=glow(0xff7a1a);for(let i=0;i<7;i++){const c=mk(new T.BoxGeometry(.03,.2+Math.random()*.2,.02),cr,(Math.random()-.5)*.4,1.1+Math.random()*.5,.26);c.rotation.z=(Math.random()-.5)*1.2;sway.add(c)};[-1,1].forEach(s=>{for(let i=0;i<3;i++){const sp=mk(cone(.05,.3,6),SM(0x2a1a14,.5),s*(.42+i*.06),2.0+i*.1,-.02);sp.rotation.z=-s*(.5+i*.3);sway.add(sp)}})}
  const anim=(t,dt,rm)=>{const k=rm?0:1;sway.rotation.z=Math.sin(t*.8)*.03*k;sway.position.y=Math.sin(t*1.6)*.025*k;head.rotation.z=Math.sin(t*.7)*.07*k+(Math.sin(t*.35)>.93?.25*k:0);head.rotation.x=.12+Math.sin(t*1.1)*.04*k;
    mouth.scale.y=1+Math.abs(Math.sin(t*1.4))*.5*k;arms.forEach((a,i)=>{const s=i?1:-1;a.rotation.z=s*(.1+Math.sin(t*1.2+i)*.05*k);a.rotation.x=-.25+Math.sin(t*1.5+i*2)*.1*k;a.userData.el.rotation.x=-.5+Math.sin(t*1.9+i)*.15*k});
    eyeM.color.setRGB(boss?1:.85,boss?.5:1,boss?.1:.22+.1*Math.sin(t*8)*k)};
  return{g,anim,flash,eyes:eyeM}}

/* ---------- Many-eyed horror: lumpy slime body, bloodshot eyes that track you, maw and tentacles ---------- */
function horror(col){
  const g=new T.Group(),flash=[];const c=new T.Color(0x2a1d3d);
  const gelM=PM(c,{roughness:.2,clearcoat:1,clearcoatRoughness:.1,sheen:.5,emissive:c.clone().multiplyScalar(.12)});flash.push(gelM);
  const bg=new T.SphereGeometry(.85,48,36),p=bg.attributes.position,r=rng(13);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.08*Math.sin(x*7+y*3)+.06*Math.sin(z*9-y*5);p.setXYZ(i,x*n,y*n*.92,z*n)}bg.computeVertexNormals();
  const sq=new T.Group();sq.position.y=.8;g.add(sq);sq.add(mk(bg,gelM));
  const eyes=[];const spots=[[0,.3,.78,.2],[-.35,.45,.68,.14],[.38,.5,.66,.13],[-.55,.1,.62,.11],[.55,.05,.6,.12],[-.2,.72,.55,.1],[.25,.78,.5,.09],[0,.0,.82,.08],[-.62,.55,.4,.08]];
  spots.forEach(s=>{const e=eyeball(s[3]);e.position.set(s[0],s[1],s[2]);e.rotation.y=0;sq.add(e);eyes.push(e)});
  const maw=new T.Group();maw.position.set(0,-.38,.74);maw.add(mk(SP(.34,22,14),SM(0x1a0409,.8),0,0,0,1,.55,.45));
  const tm=TOOTH();for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const t=mk(cone(.02,.12,5),tm,Math.cos(a)*.3,Math.sin(a)*.17,.12);t.rotation.x=Math.PI/2;t.lookAt(0,0,.0);t.rotateX(Math.PI/2);maw.add(t)}
  sq.add(maw);
  const tents=[];for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+.3,t=new T.Group();t.position.set(Math.cos(a)*.6,-.45,Math.sin(a)*.5);t.rotation.y=-a;let parent=t,len=.34,rad=.1;const segs=[];for(let k=0;k<5;k++){const sg=new T.Group();sg.position.x=k?len*.9:0;sg.add(mk(new T.CapsuleGeometry(rad,len,4,8),gelM,len/2,0,0).rotateZ(Math.PI/2));parent.add(sg);segs.push(sg);parent=sg;rad*=.78;len*=.9}t.userData={segs,ph:i*1.1};sq.add(t);tents.push(t)}
  const anim=(t,dt,rm)=>{const k=rm?0:1;sq.scale.set(1+Math.sin(t*2)*.04*k,1-Math.sin(t*2)*.05*k,1+Math.sin(t*2)*.04*k);maw.scale.y=1+Math.abs(Math.sin(t*1.2))*.45*k;
    eyes.forEach((e,i)=>{e.rotation.y=-.6+Math.sin(t*.8+i)*.15*k;e.rotation.x=Math.sin(t*1.1+i*2)*.15*k;e.scale.y=1-Math.max(0,Math.sin(t*.9+i*1.7)-.97)*30*k});
    tents.forEach(tt=>tt.userData.segs.forEach((s,j)=>{s.rotation.z=Math.sin(t*2.2+tt.userData.ph+j*.8)*.45*k-.15;s.rotation.y=Math.sin(t*1.3+j)*.2*k}))};
  return{g,anim,flash,eyes:null}}

const KINDS={wraith:{f:wraith,s:.85,names:['Confirmation Bias Wraith','Halo Effect Wraith','Hindsight Specter'],col:0xff2a3a},
 spider:{f:spider,s:.95,names:['Anxiety Weaver','Anchoring Spider','Catastrophe Crawler'],col:0xff3040},
 ghoul:{f:c=>ghoul(c,false),s:.85,names:['Doubt Ghoul','Procrastination Ghoul','Imposter Ghoul'],col:0xd8ff3a},
 horror:{f:horror,s:1.0,names:['Groupthink Horror','Overconfidence Horror','Bystander Horror'],col:0x3b2a55},
 colossus:{f:c=>ghoul(c,true),s:1.2,names:['The Doubt Colossus'],col:0xff8a1e}};
window.R3M={KINDS,list:['wraith','spider','ghoul','horror'],make(kind,col){const k=KINDS[kind]||KINDS.ghoul,o=k.f(col||k.col);o.g.scale.setScalar(k.s);o.kind=kind;o.g.traverse(m=>{if(m.isMesh&&m.material&&m.material.envMapIntensity!==undefined)m.material.envMapIntensity=.12});o.names=k.names;return o}};
})();
