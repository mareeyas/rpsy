/* RPsy 3D: stylized, lit, shadowed 3D characters built from primitives with three.js.
   Avatars are stylized illustrations, not portraits of the real people. */
(function(){
const T=window.THREE;if(T.ColorManagement)T.ColorManagement.enabled=true;
const ROSTER=[
{id:'freud',n:'Sigmund Freud',y:'1856–1939',lv:1,tag:'Founder of psychoanalysis',bio:'Developed psychoanalysis: the unconscious, defense mechanisms, and psychosexual stages.',L:{skin:0xe6b995,hair:0x9d9d9d,hs:'sides',beard:'full',bc:0x9d9d9d,suit:0x4a3a30,shirt:0xf4efe3,tie:'tie',tc:0x7a1f2b,glasses:0,acc:0xc8a24a}},
{id:'anna',n:'Anna Freud',y:'1895–1982',lv:1,tag:'Child psychoanalysis',bio:'Pioneered child psychoanalysis and systematized the ego’s defense mechanisms.',L:{skin:0xf0c8a8,hair:0x4a2f22,hs:'bun',fem:1,suit:0x7a5fa8,shirt:0xf6f0ff,tie:'none',glasses:0,acc:0xe8c36a}},
{id:'rogers',n:'Carl Rogers',y:'1902–1987',lv:1,tag:'Person-centered therapy',bio:'Founded person-centered therapy: congruence, unconditional positive regard, empathy.',L:{skin:0xe8bd98,hair:0xbdbdbd,hs:'recede',suit:0x4f7f69,shirt:0xf3efe2,tie:'none',glasses:1,gc:0x5a4a3a,acc:0x4fd1a5}},
{id:'jung',n:'Carl Jung',y:'1875–1961',lv:2,tag:'Analytical psychology',bio:'Proposed the collective unconscious, archetypes, and introversion–extraversion.',L:{skin:0xe3b48e,hair:0xf2f2f2,hs:'sides',mu:1,bc:0xf2f2f2,suit:0x2d3a5a,shirt:0xffffff,tie:'tie',tc:0x3b5b8c,glasses:1,gc:0x2b2b2b,acc:0x8fb4ff}},
{id:'adler',n:'Alfred Adler',y:'1870–1937',lv:2,tag:'Individual psychology',bio:'Individual psychology: inferiority feelings, striving for superiority, social interest.',L:{skin:0xe9bf9d,hair:0x2f2420,hs:'short',mu:1,bc:0x2f2420,suit:0x5a5f69,shirt:0xf4f4f4,tie:'bow',tc:0x203a73,glasses:1,gc:0x1f1f1f,acc:0xff9f5a}},
{id:'maslow',n:'Abraham Maslow',y:'1908–1970',lv:3,tag:'Humanistic psychology',bio:'Proposed the hierarchy of needs and studied self-actualization.',L:{skin:0xe2b08a,hair:0x2a2420,hs:'short',suit:0x8a5a3c,shirt:0xe9e1cf,tie:'none',glasses:1,gc:0x111111,acc:0xffc24a}},
{id:'skinner',n:'B. F. Skinner',y:'1904–1990',lv:3,tag:'Operant conditioning',bio:'Developed operant conditioning and radical behaviorism.',L:{skin:0xeac3a2,hair:0xa8a8a8,hs:'short',suit:0x2f4f7a,shirt:0xffffff,tie:'tie',tc:0x9c2f2f,glasses:1,gc:0x3a3a3a,acc:0x5ad0ff}},
{id:'piaget',n:'Jean Piaget',y:'1896–1980',lv:4,tag:'Cognitive development',bio:'Described four stages of cognitive development: sensorimotor to formal operational.',L:{skin:0xebc4a4,hair:0xe6e6e6,hs:'recede',suit:0x8c7352,shirt:0xf3eee0,tie:'bow',tc:0x6a2c3a,glasses:1,gc:0x7a6a4a,acc:0x7ddf8a}},
{id:'erikson',n:'Erik Erikson',y:'1902–1994',lv:4,tag:'Psychosocial development',bio:'Proposed eight psychosocial stages across the life span, including identity crisis.',L:{skin:0xe8b996,hair:0xf5f5f5,hs:'wild',beard:'full',bc:0xf5f5f5,suit:0x6b4e8f,shirt:0xf0e8ff,tie:'scarf',tc:0xe1544f,glasses:0,acc:0xd69bff}},
{id:'bandura',n:'Albert Bandura',y:'1925–2021',lv:5,tag:'Social cognitive theory',bio:'Social cognitive theory: observational learning and self-efficacy.',L:{skin:0xe6bb99,hair:0x6b625a,hs:'short',mu:1,bc:0x6b625a,suit:0x243a63,shirt:0xffffff,tie:'tie',tc:0xd6a12f,glasses:0,acc:0xffd166}},
{id:'beck',n:'Aaron Beck',y:'1921–2021',lv:6,tag:'Cognitive therapy',bio:'Founded cognitive therapy and developed the Beck inventories for depression and anxiety.',L:{skin:0xeac4a5,hair:0xf0f0f0,hs:'short',suit:0x3c4f5a,shirt:0xe6f2ff,tie:'tie',tc:0x2c8f8f,glasses:1,gc:0x23272b,acc:0x34d3c3}},
{id:'enriquez',n:'Virgilio Enriquez',y:'1942–1994',lv:7,tag:'Sikolohiyang Pilipino',bio:'Founder of Sikolohiyang Pilipino, the Filipino psychology movement.',L:{skin:0xc99a6c,hair:0x1b1512,hs:'short',mu:1,bc:0x1b1512,suit:0xf1e4c3,shirt:0xfff8e6,tie:'none',glasses:0,barong:1,acc:0xffb347}}
];
const byId=Object.fromEntries(ROSTER.map(r=>[r.id,r]));
const M=(c,r=.7,m=0,e)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},e||{}));
const mesh=(g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;return o};
const SP=(r,w=28,h=20)=>new T.SphereGeometry(r,w,h);

function person(L){
  const sc0=new T.Color(L.skin);{const h={};sc0.getHSL(h);sc0.setHSL(h.h,Math.min(1,h.s*1.15),h.l*.9)}const g=new T.Group(),skin=M(sc0,.5,0),hair=M(L.hair||0x333333,.9),suit=M(L.suit,.8),shirt=M(L.shirt||0xffffff,.7);
  const body=new T.Group();g.add(body);
  const pts=[[0,-1.45],[.62,-1.45],[.82,-1.05],[.88,-.62],[.8,-.34],[.52,-.2],[.24,-.1],[0,-.08]].map(p=>new T.Vector2(p[0],p[1]));
  const torso=new T.Mesh(new T.LatheGeometry(pts,40),suit);torso.scale.set(L.fem?1:1.1,1,.72);torso.castShadow=true;body.add(torso);
  // shirt V + collar
  const sh=new T.Shape();sh.moveTo(-.2,-.16);sh.lineTo(.2,-.16);sh.lineTo(0,-.78);sh.closePath();
  const v=new T.Mesh(new T.ShapeGeometry(sh),L.barong?M(0xfff4d6,.9):shirt);v.position.z=.625;body.add(v);
  const lap=M(L.suit,.8);[-1,1].forEach(s=>{const l=mesh(new T.BoxGeometry(.14,.7,.05),lap,s*.26,-.5,.63);l.rotation.z=s*.3;body.add(l)});
  if(L.barong){[-1,1].forEach(s=>{const e=mesh(new T.BoxGeometry(.03,.9,.02),M(0xe8d3a3,.9),s*.12,-.8,.625);body.add(e)})}
  const collar=new T.Mesh(new T.CylinderGeometry(.27,.34,.1,28,1,true),new T.MeshStandardMaterial({color:L.shirt||0xffffff,side:T.DoubleSide,roughness:.7}));collar.position.y=-.14;body.add(collar);
  if(L.tie==='tie'){const tm=M(L.tc,.5,.1);body.add(mesh(SP(.07,16,12),tm,0,-.22,.63));const t=mesh(new T.BoxGeometry(.13,.55,.04),tm,0,-.52,.64);t.scale.y=1;body.add(t);const tip=mesh(new T.ConeGeometry(.1,.14,4),tm,0,-.84,.64);tip.rotation.z=Math.PI;tip.scale.z=.3;body.add(tip)}
  if(L.tie==='bow'){const tm=M(L.tc,.5,.1);body.add(mesh(SP(.06,12,10),tm,0,-.2,.6));[-1,1].forEach(s=>{const c=mesh(new T.ConeGeometry(.12,.2,16),tm,s*.14,-.2,.6);c.rotation.z=-s*Math.PI/2;body.add(c)})}
  if(L.tie==='scarf'){const s=mesh(new T.TorusGeometry(.33,.09,12,32),M(L.tc,.9),0,-.2,0);s.rotation.x=Math.PI/2;s.scale.set(1.08,1,1);body.add(s);body.add(mesh(new T.BoxGeometry(.14,.5,.06),M(L.tc,.9),.12,-.5,.62))}
  if(L.fem){const n=mesh(new T.TorusGeometry(.27,.014,8,40),M(L.acc,.2,.9),0,-.22,.1);n.rotation.x=Math.PI/2.4;body.add(n)}
  // arms
  const arms=[];[-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.92,-.42,0);const up=mesh(new T.CapsuleGeometry(.19,.78,6,14),suit,0,-.46,0);const cuff=mesh(new T.CylinderGeometry(.17,.17,.08,16),shirt,0,-.95,0);const hand=mesh(SP(.17,18,14),skin,0,-1.08,.02);hand.scale.set(1,1.15,.8);a.add(up,cuff,hand);a.rotation.z=s*.09;body.add(a);arms.push(a)});
  // neck
  body.add(mesh(new T.CylinderGeometry(.2,.24,.28,20),skin,0,-.05,0));
  // head group
  const head=new T.Group();head.position.y=.02;g.add(head);
  const H=(o)=>{head.add(o);return o};
  H(mesh(SP(.5,40,30),skin,0,.55,0,.93,1.08,.98));
  H(mesh(SP(.37,28,20),skin,0,.27,.08,.98,.78,.9));
  H(mesh(SP(.072,20,16),skin,0,.46,.5,1,1.25,1.1));
  [-1,1].forEach(s=>{H(mesh(SP(.1,16,12),skin,s*.46,.52,0,.5,1,.75));H(mesh(SP(.1,16,12),M(L.fem?0xf29aa8:0xe88f86,.8,0,{transparent:true,opacity:.28}),s*.28,.36,.38,1.2,.8,.4))});
  const eyes=[],brows=[];
  [-1,1].forEach(s=>{const e=new T.Group();e.position.set(s*.18,.63,.4);
    e.add(mesh(SP(.092,20,16),M(0xffffff,.25),0,0,0,1,1,.6));
    const ir=mesh(SP(.055,18,14),M(L.fem?0x3b6a5a:0x4b3426,.3),0,0,.04,1,1,.5);e.add(ir);
    e.add(mesh(SP(.03,14,10),M(0x050505,.2),0,0,.065,1,1,.4));e.add(mesh(SP(.014,10,8),M(0xffffff,.1,0,{emissive:0xffffff,emissiveIntensity:.8}),.02,.025,.08,1,1,.4));
    head.add(e);eyes.push(e);
    const b=mesh(new T.CapsuleGeometry(.025,.17,4,8),hair,s*.18,.79,.43);b.rotation.z=Math.PI/2+s*.12;b.rotation.y=-s*.2;H(b);brows.push(b);
    if(L.fem){const l=mesh(new T.CapsuleGeometry(.01,.12,4,6),M(0x1a1210,.6),s*.18,.72,.45);l.rotation.z=Math.PI/2;H(l)}});
  const mouth=new T.Mesh(new T.TorusGeometry(.115,.016,10,24,Math.PI),M(L.fem?0xc2425b:0x7a2e2e,.4));mouth.rotation.z=Math.PI;mouth.position.set(0,.37,.462);mouth.scale.set(1,.8,1);mouth.userData.base=1;H(mouth);
  // hair
  const cap=(rx,ry,sc)=>{const m=mesh(new T.SphereGeometry(.55,36,22,0,Math.PI*2,0,Math.PI*sc),hair,0,.57,-.04,.95,1.1,1.03);m.rotation.x=rx;return m};
  const hs=L.hs||'short';
  if(hs==='short'){H(cap(-.55,0,.53));H(mesh(SP(.17,16,12),hair,-.4,.6,-.02,.7,1.2,1));H(mesh(SP(.17,16,12),hair,.4,.6,-.02,.7,1.2,1))}
  if(hs==='recede'){H(cap(-.7,0,.52));[-1,1].forEach(s=>H(mesh(SP(.16,16,12),hair,s*.42,.55,-.04,.7,1.1,1)))}
  if(hs==='sides'){H(mesh(SP(.5,28,18),hair,0,.48,-.2,.92,.8,.85));[-1,1].forEach(s=>H(mesh(SP(.17,16,12),hair,s*.42,.54,-.06,.7,1.3,1)))}
  if(hs==='bun'){H(cap(-.75,0,.52));H(mesh(SP(.2,20,16),hair,0,1.0,-.38));[-1,1].forEach(s=>H(mesh(SP(.16,16,12),hair,s*.4,.6,-.02,.7,1.3,1)))}
  if(hs==='wild'){H(cap(-.6,0,.5));let sd=7;const rnd=()=>(sd=(sd*9301+49297)%233280)/233280;for(let i=0;i<22;i++){const a=rnd()*Math.PI*2,r=.35+rnd()*.15,h=.72+rnd()*.28;H(mesh(SP(.12+rnd()*.07,12,10),hair,Math.cos(a)*r*.95,h+.1,Math.sin(a)*r-.08))}}
  // beard / mustache
  const bm=M(L.bc||L.hair||0x333333,.95);
  if(L.beard==='full'){H(mesh(SP(.3,24,16),bm,0,.2,.2,1.15,.7,.7));[-1,1].forEach(s=>H(mesh(SP(.15,14,12),bm,s*.34,.32,.18,.7,1.5,.8)));}
  if(L.beard==='full'||L.mu){[-1,1].forEach(s=>{const m=mesh(new T.CapsuleGeometry(.04,.13,4,8),bm,s*.08,.41,.46);m.rotation.z=Math.PI/2-s*.18;H(m)})}
  // glasses
  if(L.glasses){const gm=M(L.gc||0x222222,.3,.6);[-1,1].forEach(s=>{const r=new T.Mesh(new T.TorusGeometry(.112,.009,10,30),gm);r.position.set(s*.18,.63,.45);H(r);const lens=new T.Mesh(new T.CircleGeometry(.108,24),new T.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.14,roughness:.05,metalness:.2}));lens.position.set(s*.18,.63,.452);H(lens);const arm=mesh(new T.BoxGeometry(.012,.012,.42),gm,s*.3,.63,.24);H(arm)});H(mesh(new T.BoxGeometry(.1,.014,.014),gm,0,.65,.46))}
  if(L.fem){[-1,1].forEach(s=>H(mesh(SP(.032,10,8),M(L.acc,.2,.9),s*.47,.4,0)))}
  g.userData={head,eyes,brows,mouth,arms,body};
  return g;
}

function monster(col){
  const g=new T.Group();
  const sk=M(col,.28,.05,{emissive:col,emissiveIntensity:.08}),dark=M(0x1b1030,.4);
  const b=mesh(SP(.95,40,28),sk,0,.95,0,1,.95,.95);g.add(b);
  g.add(mesh(SP(.7,28,20),M(new T.Color(col).lerp(new T.Color(0xffffff),.45),.5),0,.75,.4,1,.9,.6));
  [-1,1].forEach(s=>{const h=mesh(new T.ConeGeometry(.2,.55,16),M(0xf3e6c8,.4),s*.5,1.8,0);h.rotation.z=-s*.45;g.add(h);
    const e=new T.Group();e.position.set(s*.34,1.2,.78);e.add(mesh(SP(.2,20,16),M(0xffffff,.2),0,0,0));e.add(mesh(SP(.1,16,12),M(0x1a0f2e,.2),0,0,.14));e.add(mesh(SP(.035,10,8),M(0xffffff,.1,0,{emissive:0xffffff}),.03,.04,.21));g.add(e);
    const br=mesh(new T.BoxGeometry(.4,.09,.1),dark,s*.34,1.5,.82);br.rotation.z=s*.4;g.add(br);
    const arm=mesh(new T.CapsuleGeometry(.12,.4,6,10),sk,s*1.0,.8,.1);arm.rotation.z=s*.9;g.add(arm);
    const ft=mesh(SP(.28,16,12),sk,s*.42,.1,.3,1,.55,1.2);g.add(ft)});
  const mo=mesh(SP(.38,24,16),M(0x2a0a24,.5),0,.62,.78,1,.55,.35);g.add(mo);
  [-1,1].forEach(s=>{const t=mesh(new T.ConeGeometry(.06,.13,8),M(0xffffff,.3),s*.17,.78,.93);t.rotation.x=Math.PI;g.add(t)});
  g.userData={body:b,mouth:mo};return g;
}

function bulb(c){const g=new T.Group();g.add(mesh(SP(.2,16,12),M(0xffffff,.2,0,{emissive:c,emissiveIntensity:1.6}),0,0,0));const l=new T.PointLight(c,2.5,4);g.add(l);return g}

let rend=null,ok=null;
function supported(){if(ok!==null)return ok;try{const c=document.createElement('canvas');ok=!!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){ok=false}return ok}
function mkRenderer(pb){const r=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!pb,powerPreference:'low-power'});r.setClearColor(0,0);r.outputEncoding=T.sRGBEncoding;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.95;return r}
function lights(sc,accent){
  sc.add(new T.HemisphereLight(0xdfe6ff,0x3a2c70,.32));
  const k=new T.DirectionalLight(0xfff0d8,.85);k.position.set(3,5,5);k.castShadow=true;k.shadow.mapSize.set(1024,1024);k.shadow.radius=4;const c=k.shadow.camera;c.left=-5;c.right=5;c.top=5;c.bottom=-3;sc.add(k);
  const r=new T.DirectionalLight(accent||0x7c5cff,.8);r.position.set(-4,3,-4);sc.add(r);
  const f=new T.PointLight(0x5de0ff,.2,12);f.position.set(-3,1,4);sc.add(f);
  const gr=new T.Mesh(new T.CircleGeometry(8,40),new T.ShadowMaterial({opacity:.28}));gr.rotation.x=-Math.PI/2;gr.position.y=-1.46;gr.receiveShadow=true;sc.add(gr);
}
function pedestal(sc,col,y=-1.46,r=1.15){
  const g=new T.Group();g.add(mesh(new T.CylinderGeometry(r,r*1.12,.26,48),M(0x241c4a,.25,.6),0,y-.13,0));
  const ring=new T.Mesh(new T.TorusGeometry(r*1.0,.04,12,64),M(col,.3,.2,{emissive:col,emissiveIntensity:1.2}));ring.rotation.x=Math.PI/2;ring.position.y=y+.01;g.add(ring);
  const top=new T.Mesh(new T.CylinderGeometry(r*.96,r*.96,.02,48),M(0x3a2e78,.2,.5,{emissive:col,emissiveIntensity:.15}));top.position.y=y+.005;g.add(top);
  g.userData.ring=ring;sc.add(g);return g;
}
function motes(sc,col){
  const n=90,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*8;p[i*3+1]=Math.random()*5-1.5;p[i*3+2]=(Math.random()-.5)*5}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));
  const pts=new T.Points(geo,new T.PointsMaterial({color:col,size:.07,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending}));sc.add(pts);return pts;
}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

function stage(el,o){
  o=o||{};if(!supported())return null;
  if(!rend)rend=mkRenderer(false);
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,60);
  const battle=o.mode==='battle';
  lights(sc,o.accent);const ped=pedestal(sc,o.accent||0x7c5cff,-1.46,battle?.9:1.2);
  const mt=motes(sc,0xb9a6ff);
  let hero=null,heroId=null,enemy=null,ped2=null,drag=0,rot=0,tx=0,ty=0,alive=true,tw=[],t0=0,blink=0,talk=0,flash=0;
  const root=new T.Group();sc.add(root);
  function setHero(id){if(hero)root.remove(hero);heroId=id;hero=person(byId[id].L);root.add(hero);
    if(battle){hero.scale.setScalar(.74);hero.position.set(-2.0,-1.46+1.45*.74,0);hero.rotation.y=.55;ped.position.set(-2.0,0,0)}
    else{hero.position.set(o.shift||0,-.02,0);ped.position.x=o.shift||0;hero.rotation.y=rot}
    tw=tw.filter(t=>!t.hero)}
  function setEnemy(col){if(enemy)root.remove(enemy);enemy=monster(col);enemy.scale.setScalar(.95);enemy.position.set(2.1,-1.46,0);enemy.rotation.y=-.5;enemy.userData.hp=1;root.add(enemy);
    if(!ped2){ped2=pedestal(sc,0xff5d6c,-1.46,1.1);ped2.position.x=2.1}}
  function fit(){const w=el.clientWidth||300,h=el.clientHeight||240;rend.setPixelRatio(Math.min(devicePixelRatio||1,2));rend.setSize(w,h,false);cam.aspect=w/h;
    if(battle){cam.fov=34;cam.position.set(0,.5,6.9);cam.lookAt(0,.05,0)}else{cam.fov=30;cam.position.set(0,.45,6.6);cam.lookAt(0,-.15,0)}cam.updateProjectionMatrix()}
  const cv=rend.domElement;cv.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y';el.appendChild(cv);fit();
  const ro=new ResizeObserver(fit);ro.observe(el);
  const pm=e=>{const r=el.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;if(drag&&!battle){rot+=(e.clientX-drag)*.012;drag=e.clientX}};
  el.addEventListener('pointermove',pm);el.addEventListener('pointerdown',e=>{drag=e.clientX;el.dispatchEvent(new CustomEvent('tap3d'))});addEventListener('pointerup',()=>drag=0);
  function tween(dur,fn,done,hr){tw.push({t:0,d:dur,fn,done,hero:hr})}
  const api={
    setHero,setEnemy,get id(){return heroId},
    wave(){if(!hero)return;const a=hero.userData.arms[1];tween(1.1,u=>{a.rotation.z=-.09-Math.sin(u*Math.PI)*2.6+Math.sin(u*28)*.12*Math.sin(u*Math.PI)},()=>a.rotation.z=-.09*-1,1)},
    cheer(){if(!hero)return;const y0=hero.position.y,b=hero.scale.x;hero.userData.arms.forEach((a,i)=>{const s=i?-1:1;tween(1.1,u=>a.rotation.z=s*(.09+Math.sin(u*Math.PI)*2.7),()=>a.rotation.z=s*.09,1)});tween(.9,u=>{hero.position.y=y0+Math.abs(Math.sin(u*Math.PI*2))*.35;if(!battle)hero.rotation.y=rot+u*Math.PI*2},()=>{hero.position.y=y0},1);talk=1.2},
    hurt(){if(!hero)return;const x0=hero.position.x;tween(.5,u=>{hero.position.x=x0+Math.sin(u*Math.PI*6)*.12*(1-u)},()=>hero.position.x=x0,1);flash=.6},
    attack(hit){if(!hero)return;const ex=enemy&&enemy.visible?enemy.position.x:hero.position.x+3.6;const x0=hero.position.x,pj=bulb(0xffd45e);pj.position.set(x0+.5,.2,.4);root.add(pj);
      tween(.75,u=>{const v=ease(u);pj.position.x=x0+.5+(ex-x0-.5)*v;pj.position.y=.2+Math.sin(v*Math.PI)*.8;pj.rotation.y=u*9;hero.position.x=x0+Math.sin(Math.min(u*2,1)*Math.PI)*.35},()=>{root.remove(pj);hero.position.x=x0;if(hit)hit()},1)},
    enemyHit(hp){if(!enemy)return;enemy.userData.hp=hp;const s=enemy.scale.x;tween(.5,u=>{enemy.scale.set(s*(1+Math.sin(u*Math.PI)*.18),s*(1-Math.sin(u*Math.PI)*.22),s);enemy.userData.body.material.emissiveIntensity=.08+Math.sin(u*Math.PI)*1.2},()=>{enemy.scale.setScalar(s);enemy.userData.body.material.emissiveIntensity=.08});},
    enemyAttack(done){if(!enemy)return;const x0=enemy.position.x;tween(.7,u=>{enemy.position.x=x0-Math.sin(Math.min(u*1.4,1)*Math.PI)*3.5;enemy.rotation.z=Math.sin(u*Math.PI)*.4},()=>{enemy.position.x=x0;enemy.rotation.z=0},0);setTimeout(()=>{api.hurt();done&&done()},330)},
    enemyDie(done){if(!enemy)return;const s=enemy.scale.x;tween(.9,u=>{enemy.scale.setScalar(s*(1-u*u));enemy.rotation.y=-.5+u*10;enemy.position.y=-1.46+u*1.2},()=>{enemy.visible=false;done&&done()},0)},
    enemyShow(){if(!enemy)return;enemy.visible=true;enemy.position.y=-1.46;enemy.scale.setScalar(.95);enemy.rotation.set(0,-.5,0);tween(.6,u=>enemy.scale.setScalar(.95*ease(u)),()=>{},0)},
    dispose(){alive=false;ro.disconnect();if(cv.parentNode===el)el.removeChild(cv);sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(m=>m.dispose())}})}
  };
  const clock=new T.Clock();
  function loop(){if(!alive)return;requestAnimationFrame(loop);if(!el.isConnected||document.hidden)return;const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime,rm=reduce();
    for(let i=tw.length-1;i>=0;i--){const w=tw[i];w.t+=dt;const u=Math.min(w.t/w.d,1);let bad=0;try{w.fn(u)}catch(e){bad=1}if(u>=1||bad){tw.splice(i,1);try{w.done&&w.done()}catch(e){}}}
    if(hero){const U=hero.userData,k=rm?0:1;
      U.body.scale.y=1+Math.sin(t*1.8)*.012*k;
      if(!battle){if(!drag)rot+=(0-rot)*.0;hero.rotation.y+=((rot+tx*.35)-hero.rotation.y)*.08;U.head.rotation.x+=((ty*.18)-U.head.rotation.x)*.1;U.head.rotation.y+=((tx*.3)-U.head.rotation.y)*.1;hero.position.y=-.02+Math.sin(t*1.5)*.02*k}
      else{U.head.rotation.y=Math.sin(t*.8)*.1*k;hero.position.y+=0}
      blink-=dt;if(blink<0){blink=2+Math.random()*3;tween(.16,u=>{const s=1-Math.sin(u*Math.PI)*.92;U.eyes.forEach(e=>e.scale.y=s)},()=>U.eyes.forEach(e=>e.scale.y=1),1)}
      if(talk>0){talk-=dt;U.mouth.scale.y=.8+Math.abs(Math.sin(t*16))*.9;if(talk<=0)U.mouth.scale.y=.8}
      if(flash>0){flash-=dt;hero.traverse(m=>{if(m.isMesh&&m.material.emissive)m.material.emissive.setRGB(flash,0,0)})}else if(flash<=0&&flash>-1){flash=-2;hero.traverse(m=>{if(m.isMesh&&m.material.emissive&&!m.material.userData.keep)m.material.emissive.setRGB(0,0,0)})}}
    if(enemy&&enemy.visible){enemy.position.y+=0;const U=enemy.userData;U.mouth.scale.y=.55+Math.abs(Math.sin(t*3))*.12*(rm?0:1)}
    if(enemy&&enemy.visible&&!tw.length){enemy.position.y=-1.46+Math.abs(Math.sin(t*2.2))*.08*(rm?0:1)}
    ped.userData.ring.rotation.z=t*.4;mt.rotation.y=t*.03;const pa=mt.geometry.attributes.position;if(!rm){for(let i=0;i<pa.count;i++){let y=pa.getY(i)+dt*.18;if(y>3.5)y=-1.5;pa.setY(i,y)}pa.needsUpdate=true}
    rend.render(sc,cam)}
  requestAnimationFrame(loop);
  if(o.hero)setHero(o.hero);if(battle&&o.enemy)setEnemy(o.enemy);
  return api;
}

// portrait renderer: renders a character bust to a data URL (cached)
let prend=null;const pcache={};
function portrait(id,px){
  const key=id+'@'+(px||200);if(pcache[key])return pcache[key];if(!supported()||!byId[id])return '';
  try{
  if(!prend){prend=mkRenderer(true);}
  const w=px||200,h=Math.round(w*1.12);prend.setPixelRatio(1);prend.setSize(w,h,false);
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(26,w/h,.1,50);lights(sc,0x9a7cff);
  const p=person(byId[id].L);p.position.y=-.55;p.rotation.y=.25;sc.add(p);cam.position.set(0,.5,5.4);cam.lookAt(0,.25,0);
  prend.render(sc,cam);const url=prend.domElement.toDataURL('image/png');
  sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>m.dispose())});
  pcache[key]=url;return url}catch(e){return ''}
}
window.R3={ROSTER,byId,stage,portrait,supported};
})();
