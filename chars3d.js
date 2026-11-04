/* RPsy 3D: stylized, lit, shadowed 3D characters built from primitives with three.js.
   Avatars are stylized illustrations, not portraits of the real people. */
(function(){
const T=window.THREE;if(T.ColorManagement)T.ColorManagement.enabled=true;
const ROSTER=[
{id:'freud',n:'Sigmund Freud',y:'1856–1939',lv:1,tag:'Founder of psychoanalysis',bio:'Developed psychoanalysis: the unconscious, defense mechanisms, and psychosexual stages.',L:{skin:0xe6b995,hair:0x9d9d9d,hs:'sides',beard:'full',bc:0x9d9d9d,suit:0x4a3a30,shirt:0xf4efe3,tie:'tie',tc:0x7a1f2b,glasses:0,acc:0xc8a24a}},
{id:'anna',n:'Anna Freud',y:'1895–1982',lv:1,tag:'Child psychoanalysis',bio:'Pioneered child psychoanalysis and systematized the ego’s defense mechanisms.',L:{skin:0xf0c8a8,hair:0x4a2f22,hs:'bun',fem:1,suit:0x7a5fa8,shirt:0xf6f0ff,tie:'none',glasses:0,acc:0xe8c36a}},
{id:'rogers',n:'Carl Rogers',y:'1902–1987',lv:1,tag:'Person-centered therapy',bio:'Founded person-centered therapy: congruence, unconditional positive regard, empathy.',L:{skin:0xe8bd98,hair:0xbdbdbd,hs:'recede',suit:0x4f7f69,shirt:0xf3efe2,tie:'none',glasses:1,gc:0x5a4a3a,acc:0x4fd1a5}},
{id:'may',n:'Rollo May',y:'1909–1994',lv:1,tag:'Existential psychology',bio:'Leading American existential psychologist: anxiety, freedom, love, will, and creativity.',L:{skin:0xe8bb97,hair:0xdedede,hs:'short',suit:0x5b4a6e,shirt:0xf3efe6,tie:'none',glasses:0,acc:0xb58cff}},
{id:'jung',n:'Carl Jung',y:'1875–1961',lv:2,tag:'Analytical psychology',bio:'Proposed the collective unconscious, archetypes, and introversion–extraversion.',L:{skin:0xe3b48e,hair:0xf2f2f2,hs:'sides',mu:1,bc:0xf2f2f2,suit:0x2d3a5a,shirt:0xffffff,tie:'tie',tc:0x3b5b8c,glasses:1,gc:0x2b2b2b,acc:0x8fb4ff}},
{id:'adler',n:'Alfred Adler',y:'1870–1937',lv:2,tag:'Individual psychology',bio:'Individual psychology: inferiority feelings, striving for superiority, social interest.',L:{skin:0xe9bf9d,hair:0x2f2420,hs:'short',mu:1,bc:0x2f2420,suit:0x5a5f69,shirt:0xf4f4f4,tie:'bow',tc:0x203a73,glasses:1,gc:0x1f1f1f,acc:0xff9f5a}},
{id:'maslow',n:'Abraham Maslow',y:'1908–1970',lv:3,tag:'Humanistic psychology',bio:'Proposed the hierarchy of needs and studied self-actualization.',L:{skin:0xe2b08a,hair:0x2a2420,hs:'short',suit:0x8a5a3c,shirt:0xe9e1cf,tie:'none',glasses:1,gc:0x111111,acc:0xffc24a}},
{id:'skinner',n:'B. F. Skinner',y:'1904–1990',lv:3,tag:'Operant conditioning',bio:'Developed operant conditioning and radical behaviorism.',L:{skin:0xeac3a2,hair:0xa8a8a8,hs:'short',suit:0x2f4f7a,shirt:0xffffff,tie:'tie',tc:0x9c2f2f,glasses:1,gc:0x3a3a3a,acc:0x5ad0ff}},
{id:'piaget',n:'Jean Piaget',y:'1896–1980',lv:4,tag:'Cognitive development',bio:'Described four stages of cognitive development: sensorimotor to formal operational.',L:{skin:0xebc4a4,hair:0xe6e6e6,hs:'recede',suit:0x8c7352,shirt:0xf3eee0,tie:'bow',tc:0x6a2c3a,glasses:1,gc:0x7a6a4a,acc:0x7ddf8a}},
{id:'erikson',n:'Erik Erikson',y:'1902–1994',lv:4,tag:'Psychosocial development',bio:'Proposed eight psychosocial stages across the life span, including identity crisis.',L:{skin:0xe8b996,hair:0xf5f5f5,hs:'wild',beard:'full',bc:0xf5f5f5,suit:0x6b4e8f,shirt:0xf0e8ff,tie:'scarf',tc:0xe1544f,glasses:0,acc:0xd69bff}},
{id:'bandura',n:'Albert Bandura',y:'1925–2021',lv:5,tag:'Social cognitive theory',bio:'Social cognitive theory: observational learning and self-efficacy.',L:{skin:0xe6bb99,hair:0x6b625a,hs:'short',mu:1,bc:0x6b625a,suit:0x243a63,shirt:0xffffff,tie:'tie',tc:0xd6a12f,glasses:0,acc:0xffd166}},
{id:'beck',n:'Aaron Beck',y:'1921–2021',lv:6,tag:'Cognitive therapy',bio:'Founded cognitive therapy and developed the Beck inventories for depression and anxiety.',L:{skin:0xeac4a5,hair:0xf0f0f0,hs:'short',suit:0x3c4f5a,shirt:0xe6f2ff,tie:'tie',tc:0x2c8f8f,glasses:1,gc:0x23272b,acc:0x34d3c3}},
{id:'enriquez',n:'Virgilio Enriquez',y:'1942–1994',lv:7,tag:'Sikolohiyang Pilipino',bio:'Founder of Sikolohiyang Pilipino, the Filipino psychology movement.',L:{skin:0xc99a6c,hair:0x1b1512,hs:'short',mu:1,bc:0x1b1512,suit:0xf1e4c3,shirt:0xfff8e6,tie:'none',glasses:0,barong:1,acc:0xffb347}},
{id:'horney',n:'Karen Horney',y:'1885–1952',lv:2,tag:'Neo-Freudian theory',bio:'Described basic anxiety and neurotic needs, with a culture-aware view of personality.',L:{skin:0xf0c8a8,hair:0x3a2a22,hs:'bun',fem:1,suit:0x2f6b73,shirt:0xf1f7f7,tie:'none',glasses:0,acc:0x5ad0c8}},
{id:'james',n:'William James',y:'1842–1910',lv:3,tag:'Functionalism',bio:'Wrote The Principles of Psychology (1890) and helped found functionalism.',L:{skin:0xe3b48f,hair:0x8a8a8a,hs:'short',beard:'full',bc:0x7d7d7d,suit:0x3b3f4a,shirt:0xf4f1e8,tie:'bow',tc:0x2a2a2a,glasses:0,acc:0xc8a24a}},
{id:'allport',n:'Gordon Allport',y:'1897–1967',lv:3,tag:'Trait theory',bio:'Pioneer of trait theory: cardinal, central, and secondary dispositions.',L:{skin:0xebc4a4,hair:0x7a7a7a,hs:'recede',suit:0x39454f,shirt:0xffffff,tie:'tie',tc:0x2a5a8a,glasses:0,acc:0x6ab0ff}},
{id:'pavlov',n:'Ivan Pavlov',y:'1849–1936',lv:4,tag:'Classical conditioning',bio:'Discovered classical conditioning while studying digestion in dogs.',L:{skin:0xe9bf9d,hair:0xe9e9e9,hs:'recede',beard:'full',bc:0xe9e9e9,suit:0xf1f1f1,shirt:0xdfe6ee,tie:'none',glasses:0,acc:0x9ad0ff}},
{id:'vygotsky',n:'Lev Vygotsky',y:'1896–1934',lv:4,tag:'Sociocultural theory',bio:'Proposed the zone of proximal development and the role of social interaction in learning.',L:{skin:0xe6bb99,hair:0x2b2220,hs:'short',mu:1,bc:0x2b2220,suit:0x4a4f3c,shirt:0xf3efe2,tie:'bow',tc:0x7a2f2f,glasses:0,acc:0xa8d86a}},
{id:'binet',n:'Alfred Binet',y:'1857–1911',lv:4,tag:'Intelligence testing',bio:'Co-created the first practical intelligence test, the Binet–Simon scale (1905).',L:{skin:0xe8bc9a,hair:0x2a2a2a,hs:'short',beard:'full',bc:0x2a2a2a,suit:0x3a3030,shirt:0xf4f1e8,tie:'bow',tc:0x3a3a6a,glasses:1,gc:0x333333,acc:0xff9f5a}},
{id:'wundt',n:'Wilhelm Wundt',y:'1832–1920',lv:5,tag:'Experimental psychology',bio:'Opened the first psychology laboratory in Leipzig in 1879.',L:{skin:0xe6b999,hair:0xcfcfcf,hs:'sides',beard:'full',bc:0xcfcfcf,suit:0x2b2b33,shirt:0xffffff,tie:'bow',tc:0x1a1a1a,glasses:0,acc:0xd8c27a}},
{id:'watson',n:'John B. Watson',y:'1878–1958',lv:5,tag:'Behaviorism',bio:'Founded classical behaviorism and the study of observable behavior.',L:{skin:0xebc4a4,hair:0x3a2f28,hs:'short',suit:0x34404f,shirt:0xffffff,tie:'tie',tc:0x8b2c2c,glasses:0,acc:0xff6b6b}},
{id:'ellis',n:'Albert Ellis',y:'1913–2007',lv:5,tag:'REBT',bio:'Created Rational Emotive Behavior Therapy and the ABC model.',L:{skin:0xeac4a5,hair:0x9a9a9a,hs:'recede',suit:0x2f4f6f,shirt:0xffffff,tie:'tie',tc:0xb8862b,glasses:1,gc:0x2a2a2a,acc:0xffd166}},
{id:'ainsworth',n:'Mary Ainsworth',y:'1913–1999',lv:6,tag:'Attachment theory',bio:'Created the Strange Situation procedure to study infant attachment styles.',L:{skin:0xf0c8a8,hair:0x6b4a36,hs:'short',fem:1,suit:0xc2587a,shirt:0xfff0f4,tie:'none',glasses:0,acc:0xffb3c8}},
{id:'frankl',n:'Viktor Frankl',y:'1905–1997',lv:6,tag:'Logotherapy',bio:'Founded logotherapy, centered on the search for meaning.',L:{skin:0xe9bf9d,hair:0x555555,hs:'recede',suit:0x3b3b3b,shirt:0xffffff,tie:'tie',tc:0x555555,glasses:1,gc:0x222222,acc:0xffc24a}},
{id:'kohlberg',n:'Lawrence Kohlberg',y:'1927–1987',lv:7,tag:'Moral development',bio:'Proposed three levels and six stages of moral development.',L:{skin:0xe6bb99,hair:0x3a3028,hs:'short',beard:'full',bc:0x3a3028,suit:0x5a6a4a,shirt:0xf3efe2,tie:'none',glasses:1,gc:0x3a2a1a,acc:0x7ddf8a}}
];
const byId=Object.fromEntries(ROSTER.map(r=>[r.id,r]));
const mesh=(g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;return o};
const M=(c,r=.7,m=0,e)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},e||{}));
const SP=(r,w=28,h=20)=>new T.SphereGeometry(r,w,h);
const person=(L,id)=>R3P.person(L,id);
function bulb(c){const g=new T.Group();g.add(mesh(SP(.2,16,12),M(0xffffff,.2,0,{emissive:c,emissiveIntensity:1.6}),0,0,0));const l=new T.PointLight(c,2.5,4);g.add(l);return g}

let rend=null,ok=null;
function supported(){if(ok!==null)return ok;try{const c=document.createElement('canvas');ok=!!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){ok=false}return ok}
function mkRenderer(pb){const r=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:!!pb,powerPreference:'default'});r.setClearColor(0,0);r.outputEncoding=T.sRGBEncoding;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.82;return r}
/* studio reflection environment so skin, glasses and eyes get real highlights */
const envCache=new WeakMap();
function envOf(r){if(envCache.has(r))return envCache.get(r);
  const sc=new T.Scene(),g=new T.SphereGeometry(30,32,20),pos=g.attributes.position,col=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)/30,top=[.5,.55,.9],mid=[.42,.34,.5],bot=[.08,.06,.16],a=y>0?top:bot,w=Math.pow(Math.abs(y),.7);col[i*3]=mid[0]+(a[0]-mid[0])*w;col[i*3+1]=mid[1]+(a[1]-mid[1])*w;col[i*3+2]=mid[2]+(a[2]-mid[2])*w}
  g.setAttribute('color',new T.BufferAttribute(col,3));sc.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
  const box=(x,y,z,w,h,r,gg,b)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({side:T.DoubleSide}));m.material.color.setRGB(r,gg,b);m.position.set(x,y,z);m.lookAt(0,0,0);sc.add(m)};
  box(9,8,12,9,6,6,5.4,4.8);box(-11,5,-8,8,5,2,3,7);box(-8,-1,10,6,5,1.4,1.1,1.7);box(0,14,0,10,10,2.2,2.2,2.6);
  const pm=new T.PMREMGenerator(r),tex=pm.fromScene(sc,.03).texture;pm.dispose();envCache.set(r,tex);return tex}
function lights(sc,accent,r){
  sc.environment=envOf(r);
  sc.add(new T.HemisphereLight(0xdfe6ff,0x3a2c70,.12));
  const k=new T.DirectionalLight(0xfff0d8,.95);k.position.set(3,5,5);k.castShadow=true;k.shadow.mapSize.set(1024,1024);k.shadow.radius=4;k.shadow.bias=-.0004;const c=k.shadow.camera;c.left=-5;c.right=5;c.top=5;c.bottom=-3;sc.add(k);
  const rim=new T.DirectionalLight(accent||0x7c5cff,.9);rim.position.set(-4,3,-4);sc.add(rim);
  const f=new T.PointLight(0x5de0ff,.2,12);f.position.set(-3,1,4);sc.add(f);
  const gr=new T.Mesh(new T.CircleGeometry(8,40),new T.ShadowMaterial({opacity:.3}));gr.rotation.x=-Math.PI/2;gr.position.y=-1.46;gr.receiveShadow=true;sc.add(gr);
}
function pedestal(sc,col,y=-1.46,r=1.15,dark){
  const g=new T.Group();g.add(mesh(new T.CylinderGeometry(r,r*1.12,.26,48),M(0x241c4a,.25,.6),0,y-.13,0));
  const ring=new T.Mesh(new T.TorusGeometry(r*1.0,.04,12,64),M(col,.3,.2,{emissive:col,emissiveIntensity:1.2}));ring.rotation.x=Math.PI/2;ring.position.y=y+.01;g.add(ring);
  const top=new T.Mesh(new T.CylinderGeometry(r*.96,r*.96,.02,48),M(dark?0x1a0b14:0x3a2e78,.2,.5,{emissive:col,emissiveIntensity:dark?.05:.15}));top.position.y=y+.005;g.add(top);
  g.userData.ring=ring;sc.add(g);return g;
}
function motes(sc,col){
  const n=90,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*8;p[i*3+1]=Math.random()*5-1.5;p[i*3+2]=(Math.random()-.5)*5}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));
  const pts=new T.Points(geo,new T.PointsMaterial({color:col,size:.07,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending}));sc.add(pts);return pts;
}
let mistT=null;const mistTex=()=>mistT||(mistT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,4,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new T.CanvasTexture(c)})());
/* hit flash that remembers and restores each material's own emissive colour */
function tint(g,sec){const list=[];g.traverse(m=>{if(m.isMesh&&m.material&&m.material.emissive&&!(m.material.userData&&m.material.userData.keep)){if(!m.material.userData.e0)m.material.userData.e0=m.material.emissive.clone();m.material.emissive.setRGB(.7,0,0);list.push(m.material)}});
  setTimeout(()=>list.forEach(x=>x.emissive.copy(x.userData.e0)),sec*1000)}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

function stage(el,o){
  o=o||{};if(!supported())return null;
  if(!rend){rend=mkRenderer(false)}
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,60);
  const battle=o.mode==='battle';
  lights(sc,o.accent,rend);const ped=pedestal(sc,o.accent||0x7c5cff,-1.46,battle?.9:1.2);
  const mt=motes(sc,0xb9a6ff);
  let perfN=0,perfT=0,hero=null,heroId=null,enemy=null,rival=null,ped2=null,drag=0,rot=0,tx=0,ty=0,alive=true,tw=[],blink=0,talk=0,flash=0;
  const root=new T.Group();sc.add(root);
  const eLight=new T.PointLight(0xff2a40,0,7);eLight.position.set(2.0,.4,2);sc.add(eLight);
  const mist=new T.Group();mist.visible=false;sc.add(mist);for(let i=0;i<6;i++){const s=new T.Sprite(new T.SpriteMaterial({map:mistTex(),color:0x7a2a4a,transparent:true,opacity:.14,depthWrite:false}));s.renderOrder=-1;s.scale.setScalar(2.4+Math.random());s.position.set(2.1+(Math.random()-.5)*2.6,-1.25+Math.random()*.25,-.6-Math.random()*1.2);s.userData.ph=Math.random()*6;mist.add(s)}
  function setHero(id){if(hero)root.remove(hero);heroId=id;hero=person(byId[id].L,id);root.add(hero);
    if(battle){hero.scale.setScalar(.74);hero.position.set(-2.0,-1.46+1.45*.74,0);hero.rotation.y=.55;ped.position.set(-2.0,0,0)}
    else{hero.position.set(o.shift||0,-.02,0);ped.position.x=o.shift||0;hero.rotation.y=rot}
    tw=tw.filter(t=>!t.hero)}
  function setEnemy(kind,col){if(enemy)root.remove(enemy);if(rival){root.remove(rival);rival=null}const m=R3M.make(kind,col);enemy=m.g;enemy.userData={m,s:enemy.scale.x,kind};enemy.position.set(2.1,-1.46,0);enemy.rotation.y=-.55;root.add(enemy);
    if(!ped2){ped2=pedestal(sc,0xff2a40,-1.46,1.15,true)}ped2.position.x=2.1;ped2.visible=true;mist.visible=true;eLight.intensity=1.3}
  function fit(){const w=el.clientWidth||300,h=el.clientHeight||240;rend.setPixelRatio(Math.min(devicePixelRatio||1,2));rend.setSize(w,h,false);cam.aspect=w/h;
    if(battle){cam.fov=34;cam.position.set(0,.5,6.9);cam.lookAt(0,.05,0)}else{cam.fov=30;cam.position.set(0,.45,6.6);cam.lookAt(0,-.15,0)}cam.updateProjectionMatrix()}
  const cv=rend.domElement;cv.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y';el.appendChild(cv);fit();
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();el.classList.add('nogl');el.dispatchEvent(new CustomEvent('gllost'))});
  const ro=new ResizeObserver(fit);ro.observe(el);
  const pm=e=>{const r=el.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;if(drag&&!battle){rot+=(e.clientX-drag)*.012;drag=e.clientX}};
  el.addEventListener('pointermove',pm);el.addEventListener('pointerdown',e=>{drag=e.clientX;el.dispatchEvent(new CustomEvent('tap3d'))});addEventListener('pointerup',()=>drag=0);
  function tween(dur,fn,done,hr){tw.push({t:0,d:dur,fn,done,hero:hr})}
  const api={
    setHero,setEnemy,get id(){return heroId},
    info(){return{enemy:!!(enemy&&enemy.visible),kind:enemy&&enemy.userData.kind,rival:!!rival,hero:!!hero}},
    wave(){if(!hero||hero.userData.busy)return;const U=hero.userData,a=U.arms[0],el2=a.userData.el,s=-1,env=u=>u<.2?ease(u/.2):u>.8?ease((1-u)/.2):1;U.busy=1;talk=1.6;
      tween(2.1,u=>{const e=env(u);a.rotation.z=s*(.09+e*1.45);el2.rotation.z=s*(.1+e*(1.2+Math.sin(u*Math.PI*2*3.4)*.3));el2.rotation.x=-.18*(1-e);U.body.rotation.z=-s*.025*e;U.head.rotation.z=-s*.07*e},
        ()=>{a.rotation.z=s*.09;el2.rotation.z=s*.1;el2.rotation.x=-.18;U.body.rotation.z=0;U.head.rotation.z=0;U.busy=0},1)},
    cheer(who){const G=who==='rival'?rival:hero;if(!G)return;const U=G.userData,y0=G.position.y,env=u=>u<.2?ease(u/.2):u>.75?ease((1-u)/.25):1;if(U.busy)return;U.busy=1;if(G===hero)talk=1.4;
      tween(1.3,u=>{const e=env(u);U.arms.forEach((a,i)=>{const s=i?1:-1,el2=a.userData.el;a.rotation.z=s*(.09+e*2.45);el2.rotation.z=s*(.1+e*.3+Math.sin(u*Math.PI*6)*.12*e);el2.rotation.x=-.18*(1-e)});G.position.y=y0+Math.abs(Math.sin(u*Math.PI*2))*.12;U.head.rotation.z=Math.sin(u*Math.PI*4)*.05*e},
        ()=>{U.arms.forEach((a,i)=>{const s=i?1:-1;a.rotation.z=s*.09;a.userData.el.rotation.z=s*.1;a.userData.el.rotation.x=-.18});G.position.y=y0;U.head.rotation.z=0;U.busy=0},1)},
    setRival(id){if(rival)root.remove(rival);if(enemy){root.remove(enemy);enemy=null;mist.visible=false;eLight.intensity=0}rival=person((byId[id]||ROSTER[0]).L,id);rival.scale.setScalar(.74);rival.position.set(2.0,-1.46+1.45*.74,0);rival.rotation.y=-.55;root.add(rival);if(!ped2){ped2=pedestal(sc,0xff7a59,-1.46,.9)}ped2.position.x=2.0;ped2.visible=true;rival.userData.id=id},
    get rivalId(){return rival&&rival.userData.id},
    rivalHit(){if(!rival)return;const x0=rival.position.x;tint(rival,.5);tween(.5,u=>{rival.position.x=x0+Math.sin(u*Math.PI*6)*.12*(1-u)},()=>rival.position.x=x0,1)},
    rivalAttack(hit){if(!rival||!hero)return;const x0=rival.position.x,pj=bulb(0xff7a59);pj.position.set(x0-.5,.2,.4);root.add(pj);const tx2=hero.position.x+.5;
      tween(.75,u=>{const v=ease(u);pj.position.x=x0-.5+(tx2-x0+.5)*v;pj.position.y=.2+Math.sin(v*Math.PI)*.8;pj.rotation.y=u*9;rival.position.x=x0-Math.sin(Math.min(u*2,1)*Math.PI)*.35},()=>{root.remove(pj);rival.position.x=x0;if(hit)hit()},1)},
    hurt(){if(!hero)return;const x0=hero.position.x;tween(.5,u=>{hero.position.x=x0+Math.sin(u*Math.PI*6)*.12*(1-u)},()=>hero.position.x=x0,1);tint(hero,.5)},
    attack(hit){if(!hero)return;const ex=rival?rival.position.x:enemy&&enemy.visible?enemy.position.x:hero.position.x+3.6;const x0=hero.position.x,pj=bulb(0xffd45e);pj.position.set(x0+.5,.2,.4);root.add(pj);
      tween(.75,u=>{const v=ease(u);pj.position.x=x0+.5+(ex-x0-.5)*v;pj.position.y=.2+Math.sin(v*Math.PI)*.8;pj.rotation.y=u*9;hero.position.x=x0+Math.sin(Math.min(u*2,1)*Math.PI)*.35},()=>{root.remove(pj);hero.position.x=x0;if(hit)hit()},1)},
    enemyHit(){if(!enemy)return;const e=enemy,s=e.userData.s,x0=e.position.x;tint(e,.45);tween(.5,u=>{const k=Math.sin(u*Math.PI);e.scale.set(s*(1+k*.12),s*(1-k*.15),s);e.position.x=x0+k*.3},()=>{e.scale.setScalar(s);e.position.x=x0})},
    enemyAttack(done){if(!enemy)return;const e=enemy,x0=e.position.x;tween(.7,u=>{e.position.x=x0-Math.sin(Math.min(u*1.4,1)*Math.PI)*3.3;e.rotation.z=Math.sin(u*Math.PI)*.25},()=>{e.position.x=x0;e.rotation.z=0});setTimeout(()=>{api.hurt();done&&done()},330)},
    enemyDie(done){if(!enemy)return;const e=enemy,s=e.userData.s;tween(1,u=>{e.scale.setScalar(Math.max(.001,s*(1-u*u)));e.rotation.y=-.55+u*8;e.position.y=-1.46-u*.9},()=>{e.visible=false;eLight.intensity=0;mist.visible=false;if(ped2)ped2.visible=false;done&&done()})},
    enemyShow(){if(!enemy)return;const e=enemy,s=e.userData.s;e.visible=true;e.scale.setScalar(.001);mist.visible=true;eLight.intensity=1.3;if(ped2)ped2.visible=true;tween(.9,u=>{const v=ease(u);e.scale.setScalar(Math.max(.001,s*v));e.position.y=-1.46-(1-v)*.9},()=>{e.position.y=-1.46;e.scale.setScalar(s)})},
    dispose(){alive=false;ro.disconnect();if(cv.parentNode===el)el.removeChild(cv);sc.traverse(o2=>{if(o2.geometry)o2.geometry.dispose();if(o2.material){[].concat(o2.material).forEach(m=>m.dispose())}})}
  };
  const clock=new T.Clock();
  function loop(){if(!alive)return;requestAnimationFrame(loop);if(!el.isConnected||document.hidden)return;const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime,rm=reduce();
    for(let i=tw.length-1;i>=0;i--){const w=tw[i];w.t+=dt;const u=Math.min(w.t/w.d,1);let bad=0;try{w.fn(u)}catch(e){bad=1}if(u>=1||bad){tw.splice(i,1);try{w.done&&w.done()}catch(e){}}}
    if(hero){const U=hero.userData,k=rm?0:1;
      U.body.scale.y=1+Math.sin(t*1.8)*.012*k;
      if(!battle){hero.rotation.y+=((rot+tx*.35)-hero.rotation.y)*.08;U.head.rotation.x+=((ty*.18)-U.head.rotation.x)*.1;U.head.rotation.y+=((tx*.3)-U.head.rotation.y)*.1;hero.position.y=-.02+Math.sin(t*1.5)*.02*k;U.eyes.forEach(e=>{e.rotation.y+=((tx*.3-U.head.rotation.y*.5)-e.rotation.y)*.15;e.rotation.x+=((ty*.2)-e.rotation.x)*.15})}
      else{U.head.rotation.y=Math.sin(t*.8)*.1*k-.12;U.eyes.forEach(e=>{e.rotation.y=.3})}
      blink-=dt;if(blink<0){blink=2+Math.random()*3.5;tween(.2,u=>{const v=Math.sin(u*Math.PI);U.lids.forEach(l=>l.rotation.x=-.5+1.7*v)},()=>U.lids.forEach(l=>l.rotation.x=-.5),1)}
      if(talk>0){talk-=dt;U.mouthSet(.35+Math.abs(Math.sin(t*14))*.6);if(talk<=0)U.mouthSet(0)}
      if(flash>0)flash-=dt}
    if(rival){const U=rival.userData;U.body.scale.y=1+Math.sin(t*1.7+1)*.012*(rm?0:1);U.head.rotation.y=Math.sin(t*.7+1)*.1*(rm?0:1)-.15}
    if(enemy&&enemy.visible){enemy.userData.m.anim(t,dt,rm);eLight.intensity=(1.0+Math.sin(t*13)*.25+Math.sin(t*5.3)*.2)*(rm?.8:1)}
    if(mist.visible&&!rm)mist.children.forEach(s=>{s.position.x+=Math.sin(t*.4+s.userData.ph)*.0025;s.material.opacity=.12+.06*Math.sin(t*.6+s.userData.ph)});
    ped.userData.ring.rotation.z=t*.4;mt.rotation.y=t*.03;const pa=mt.geometry.attributes.position;if(!rm){for(let i=0;i<pa.count;i++){let y=pa.getY(i)+dt*.18;if(y>3.5)y=-1.5;pa.setY(i,y)}pa.needsUpdate=true}
    perfN++;perfT+=dt;if(perfN===50){if(perfT/50>.045&&rend.getPixelRatio()>1)rend.setPixelRatio(1),fit();perfN=0;perfT=0}
    rend.render(sc,cam)}
  requestAnimationFrame(loop);
  if(o.hero)setHero(o.hero);if(battle&&o.enemy){setEnemy(o.enemy.kind||o.enemy,o.enemy.col);enemy.visible=true}
  return api;
}

// portrait renderer: renders a character bust to a data URL (cached)
let prend=null;const pcache={};
function portrait(id,px){
  const key=id+'@'+(px||200);if(pcache[key])return pcache[key];if(!supported()||!byId[id])return '';
  try{
  if(!prend){prend=mkRenderer(true);}
  const w=px||200,h=Math.round(w*1.12);prend.setPixelRatio(1);prend.setSize(w,h,false);
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(24,w/h,.1,50);lights(sc,0x9a7cff,prend);
  const p=person(byId[id].L,id);p.position.y=-.62;p.rotation.y=.28;sc.add(p);cam.position.set(0,.55,5.2);cam.lookAt(0,.28,0);
  prend.render(sc,cam);const url=prend.domElement.toDataURL('image/png');
  sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>m.dispose())});
  pcache[key]=url;return url}catch(e){return ''}
}
window.R3={ROSTER,byId,stage,portrait,supported};
})();
