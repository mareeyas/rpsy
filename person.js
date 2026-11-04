/* RPsy realistic 3D people: sculpted head, strand-clump hair and beards, eyes with lids and iris texture,
   skin/fabric textures, clothing detail and hands. Stylized illustrations, not portraits of the real people. */
(function(){
const T=window.THREE;
const rng=seed=>{let s=(seed>>>0)||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)};
const hashStr=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function cnv(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c}
function ctex(c,rx,ry,srgb){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=4;if(srgb)t.encoding=T.sRGBEncoding;return t}
const cache={};
function noiseTex(key,w,fn,rx,ry,srgb){return cache[key]||(cache[key]=ctex(cnv(w,w,fn),rx,ry,srgb))}
const skinBump=()=>noiseTex('sb',256,(g,w,h)=>{const id=g.createImageData(w,h),r=rng(7);for(let i=0;i<w*h;i++){const v=118+r()*24;id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v;id.data[i*4+3]=255}g.putImageData(id,0,0);g.globalAlpha=.5;for(let i=0;i<900;i++){g.fillStyle=r()<.5?'#6a6a6a':'#a8a8a8';g.beginPath();g.arc(r()*w,r()*h,.6+r()*1.6,0,7);g.fill()}},2,2);
const skinMap=()=>noiseTex('sm',256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);const r=rng(11);for(let i=0;i<70;i++){const x=r()*w,y=r()*h,rr=18+r()*46,gr=g.createRadialGradient(x,y,0,x,y,rr);const warm=r()<.5;gr.addColorStop(0,warm?'rgba(255,200,190,.22)':'rgba(215,200,175,.2)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}},2,2,true);
const fabricBump=()=>noiseTex('fb',128,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){g.fillStyle=i%4?'#999':'#6a6a6a';g.fillRect(i,0,1,h)}for(let j=0;j<h;j+=2){g.fillStyle=j%4?'#8f8f8f':'#707070';g.fillRect(0,j,w,1)}},9,9);
const irisTex=col=>noiseTex('ir'+col,128,(g,w)=>{const c=w/2,base=new T.Color(col),hex=a=>'#'+base.clone().multiplyScalar(a).getHexString();
  const gr=g.createRadialGradient(c,c,6,c,c,c);gr.addColorStop(0,hex(1.5));gr.addColorStop(.55,hex(1));gr.addColorStop(.9,hex(.45));gr.addColorStop(1,'#0b0807');g.fillStyle=gr;g.beginPath();g.arc(c,c,c,0,7);g.fill();
  const r=rng(hashStr(String(col)));for(let i=0;i<150;i++){const a=r()*6.283,r0=14+r()*8,r1=r0+16+r()*34;g.strokeStyle=r()<.5?'rgba(255,240,220,.18)':'rgba(0,0,0,.22)';g.lineWidth=.8+r();g.beginPath();g.moveTo(c+Math.cos(a)*r0,c+Math.sin(a)*r0);g.lineTo(c+Math.cos(a)*r1,c+Math.sin(a)*r1);g.stroke()}
  g.fillStyle='#050404';g.beginPath();g.arc(c,c,15,0,7);g.fill()},1,1,true);

const PM=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:c,roughness:.6},o||{}));
const SM=(c,r,m,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r==null?.7:r,metalness:m||0},o||{}));
function mk(g,m,x,y,z,sx,sy,sz){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);if(sx!==undefined)o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);o.castShadow=true;return o}
const SP=(r,w,h)=>new T.SphereGeometry(r,w||24,h||16);

/* sculpted head: tapered jaw, chin, brow ridge, cheekbones, eye sockets. Baked at y=.55 */
function headGeo(fem){const g=new T.SphereGeometry(1,80,60),p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const t=Math.max(0,-(y+.04)),jaw=1-(fem?.38:.3)*Math.pow(t,1.15);
    let X=x*.455*jaw,Y=y*.55,Z=z*.5*(1-.1*t);
    if(y<-.5){const k=(-.5-y)/.5;X*=1-.3*k;Z+=(fem?.03:.05)*k*Math.max(0,z)}
    if(y>.12&&y<.42&&z>0)Z+=.02*Math.sin((y-.12)/.3*Math.PI)*z;      // brow ridge
    if(y>-.3&&y<.08&&z>.15)X*=1+.045*(1-Math.abs(y+.1)/.2);          // cheekbones
    const ex=Math.abs(x)-.4,ey=y-.14;if(z>0.5&&ex*ex+ey*ey<.05)Z-=.016*(1-(ex*ex+ey*ey)/.05); // eye sockets
    if(y>.55)X*=1-.1*(y-.55)/.45;                                      // taper at the top
    p.setXYZ(i,X,Y+.55,Z)}
  g.computeVertexNormals();return g}

function earMesh(skin,s){const g=new T.Group();g.add(mk(SP(.1,16,12),skin,0,0,0,.34,1,.7));const h=mk(new T.TorusGeometry(.075,.012,8,22,Math.PI*1.45),skin,.012*s,.0,.0);h.rotation.y=Math.PI/2*s;h.rotation.z=-1.5;h.position.set(.01*s,.005,.0);g.add(h);g.add(mk(SP(.05,10,8),SM(0x5a2f28,.9),.014*s,0,.004,.25,.8,.5));return g}

function clumpInst(geo,mat,n,place,rnd){const im=new T.InstancedMesh(geo,mat,n),m=new T.Matrix4(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0),c=new T.Color();let k=0;
  for(let i=0;i<n*8&&k<n;i++){const r=place(rnd);if(!r)continue;q.setFromUnitVectors(Y,r.dir);const roll=new T.Quaternion().setFromAxisAngle(r.dir,rnd()*6.28);q.premultiply(roll);
    m.compose(r.pos,q,new T.Vector3(r.s[0],r.s[1],r.s[2]));im.setMatrixAt(k,m);c.setScalar(1).multiplyScalar(.8+rnd()*.4);im.setColorAt(k,c);k++}
  im.count=k;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;return im}

function build(L,id){
  const rnd=rng(hashStr(id||'x')),fem=!!L.fem,g=new T.Group();
  const sc=new T.Color(L.skin);{const h={};sc.getHSL(h);sc.setHSL(h.h,Math.min(1,h.s*1.1),h.l*.92)}
  const skin=PM(sc,{map:skinMap(),bumpMap:skinBump(),bumpScale:.02,roughness:.62,sheen:.35,sheenRoughness:.5,sheenColor:new T.Color(0xff9d86),clearcoat:.06,clearcoatRoughness:.6,envMapIntensity:.42});
  const hairC=new T.Color(L.hair||0x333333);
  const hairMat=PM(hairC,{roughness:.55,envMapIntensity:.5,sheen:.5,sheenRoughness:.4,sheenColor:hairC.clone().lerp(new T.Color(0xffffff),.45),metalness:.05});
  const baseHair=SM(hairC.clone().multiplyScalar(.62),.9);
  const suitM=PM(L.suit,{roughness:.85,bumpMap:fabricBump(),bumpScale:.35,sheen:.6,sheenRoughness:.7,sheenColor:new T.Color(L.suit).lerp(new T.Color(0xffffff),.3)});
  const shirtM=PM(L.shirt||0xffffff,{roughness:.7,bumpMap:fabricBump(),bumpScale:.2,sheen:.5});
  const body=new T.Group();g.add(body);
  /* torso with natural shoulders */
  const pts=[[0,-1.45],[.58,-1.45],[.8,-1.1],[.9,-.72],[.88,-.5],[.74,-.34],[.5,-.22],[.24,-.12],[0,-.08]].map(v=>new T.Vector2(v[0],v[1]));
  const torso=new T.Mesh(new T.LatheGeometry(pts,56),suitM);torso.scale.set(fem?1:1.1,1,.72);torso.castShadow=true;body.add(torso);
  /* shirt front + collar points */
  const sh=new T.Shape();sh.moveTo(-.2,-.14);sh.lineTo(.2,-.14);sh.lineTo(0,-.8);sh.closePath();
  const v=new T.Mesh(new T.ShapeGeometry(sh),L.barong?PM(0xfff1d2,{roughness:.9}):shirtM);v.position.z=.628;body.add(v);
  const lapM=PM(L.suit,{roughness:.8,bumpMap:fabricBump(),bumpScale:.3});
  [-1,1].forEach(s=>{const ls=new T.Shape();ls.moveTo(0,0);ls.lineTo(.2*s,.02);ls.lineTo(.27*s,-.2);ls.lineTo(.12*s,-.28);ls.lineTo(.2*s,-.78);ls.lineTo(0,-.7);ls.closePath();
    const lap=new T.Mesh(new T.ExtrudeGeometry(ls,{depth:.03,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:1}),lapM);lap.position.set(s*.0,-.16,.615);lap.castShadow=true;body.add(lap)});
  if(L.barong){[-1,1].forEach(s=>body.add(mk(new T.BoxGeometry(.025,.95,.015),PM(0xe3cf9c,{roughness:.8}),s*.14,-.62,.634)));body.add(mk(new T.TorusGeometry(.26,.04,8,28,Math.PI),PM(0xfff1d2,{roughness:.9}),0,-.14,.12,1.05,1,1))}
  else{[-1,1].forEach(s=>{const cs=new T.Shape();cs.moveTo(0,0);cs.lineTo(.2*s,.0);cs.lineTo(.06*s,-.2);cs.closePath();const c=new T.Mesh(new T.ExtrudeGeometry(cs,{depth:.02,bevelEnabled:false}),shirtM);c.position.set(s*.02,-.1,.6);c.rotation.z=s*.12;c.castShadow=true;body.add(c)})}
  const collar=new T.Mesh(new T.CylinderGeometry(.27,.32,.1,32,1,true),new T.MeshStandardMaterial({color:L.shirt||0xffffff,side:T.DoubleSide,roughness:.7}));collar.position.y=-.13;body.add(collar);
  /* buttons, pocket square, ties */
  const btn=SM(0x1e1a18,.35,.3);[-.62,-.9,-1.18].forEach(y=>{if(!L.barong)body.add(mk(new T.CylinderGeometry(.03,.03,.018,14),btn,.02,y,.64+(-y-.6)*.0).rotateX(Math.PI/2))});
  if(!L.barong&&L.tie!=='scarf'&&L.suit!==0xf1f1f1){const pq=mk(new T.BoxGeometry(.14,.1,.02),PM(0xf6f1e4,{roughness:.9}),-.4,-.55,.6);pq.rotation.z=.15;body.add(pq)}
  const tieM=PM(L.tc||0x7a1f2b,{roughness:.35,sheen:1,sheenColor:new T.Color(0xffffff)});
  if(L.tie==='tie'){body.add(mk(SP(.07,16,12),tieM,0,-.22,.64,1.1,.9,.9));const ts=new T.Shape();ts.moveTo(-.055,0);ts.lineTo(.055,0);ts.lineTo(.085,-.62);ts.lineTo(0,-.7);ts.lineTo(-.085,-.62);ts.closePath();const t=new T.Mesh(new T.ExtrudeGeometry(ts,{depth:.025,bevelEnabled:false}),tieM);t.position.set(0,-.25,.635);t.castShadow=true;body.add(t)}
  if(L.tie==='bow'){body.add(mk(SP(.05,12,10),tieM,0,-.2,.61));[-1,1].forEach(s=>{const c=mk(new T.ConeGeometry(.11,.2,18),tieM,s*.14,-.2,.61);c.rotation.z=-s*Math.PI/2;body.add(c)})}
  if(L.tie==='scarf'){const s=mk(new T.TorusGeometry(.33,.09,14,36),PM(L.tc,{roughness:.95,bumpMap:fabricBump(),bumpScale:.6}),0,-.2,0,1.08,1,1);s.rotation.x=Math.PI/2;body.add(s);body.add(mk(new T.BoxGeometry(.15,.5,.07),PM(L.tc,{roughness:.95}),.12,-.5,.62))}
  if(fem){const n=mk(new T.TorusGeometry(.27,.013,8,44),SM(L.acc||0xe8c36a,.2,.95),0,-.22,.1);n.rotation.x=Math.PI/2.4;body.add(n);body.add(mk(SP(.04,12,10),SM(L.acc||0xe8c36a,.2,.95),0,-.4,.57))}
  /* arms with elbows and hands */
  const arms=[];[-1,1].forEach(s=>{const a=new T.Group();a.position.set(s*.92,-.42,0);
    a.add(mk(new T.CapsuleGeometry(.19,.28,6,16),suitM,0,-.27,0));
    const el=new T.Group();el.position.y=-.5;
    el.add(mk(SP(.185,18,14),suitM,0,0,0));el.add(mk(new T.CapsuleGeometry(.165,.26,6,16),suitM,0,-.25,0));
    el.add(mk(new T.CylinderGeometry(.152,.152,.08,20),shirtM,0,-.46,0));
    const hand=new T.Group();hand.position.set(0,-.55,.02);
    hand.add(mk(SP(.1,16,12),skin,0,-.05,0,.95,1.05,.55));
    [-.06,-.02,.02,.06].forEach((x,i)=>{const f=mk(new T.CapsuleGeometry(.022,.085+(i==1||i==2?.015:0),4,8),skin,x,-.14,.01);f.rotation.x=.12;hand.add(f)});
    const th=mk(new T.CapsuleGeometry(.024,.07,4,8),skin,-.085*s,-.07,.04);th.rotation.z=.6*s;th.rotation.x=-.3;hand.add(th);
    el.add(hand);a.add(el);a.userData.el=el;a.rotation.z=s*.09;el.rotation.z=s*.1;el.rotation.x=-.18;body.add(a);arms.push(a)});
  /* neck */
  body.add(mk(new T.CylinderGeometry(.19,.235,.32,28),skin,0,-.04,0));
  /* head */
  const head=new T.Group();head.position.y=.02;g.add(head);const H=o=>{head.add(o);return o};
  const hg=headGeo(fem);const headM=new T.Mesh(hg,skin);headM.castShadow=true;head.add(headM);
  /* nose */
  const nose=new T.Group();nose.add(mk(new T.CapsuleGeometry(.03,.11,4,10),skin,0,.55,.472).rotateX(-.35));
  nose.add(mk(SP(.044,16,12),skin,0,.455,.512,1,.9,1.1));[-1,1].forEach(s=>{nose.add(mk(SP(.027,12,10),skin,s*.034,.45,.49));nose.add(mk(SP(.012,8,6),SM(0x2a1410,.9),s*.02,.438,.532,1,.6,1))});H(nose);
  /* ears */
  [-1,1].forEach(s=>{const e=earMesh(skin,s);e.position.set(s*.452,.53,-.01);e.rotation.y=s*.28;H(e)});
  /* eyes with lids */
  const eyes=[],lids=[];const irisC=L.eye||(fem?0x3b6a5a:0x5b3d28);
  [-1,1].forEach(s=>{const e=new T.Group();e.position.set(s*.178,.635,.4);
    e.add(mk(SP(.075,28,20),PM(0xf2ece4,{roughness:.2,clearcoat:.6})));
    const ir=new T.Mesh(new T.CircleGeometry(.04,28),new T.MeshBasicMaterial({map:irisTex(irisC),transparent:true,toneMapped:true}));ir.position.z=.0756;e.add(ir);
    e.add(mk(SP(.0775,24,16),PM(0xffffff,{roughness:0,clearcoat:1,clearcoatRoughness:0,transparent:true,opacity:.14})));
    e.add(mk(SP(.011,8,6),new T.MeshBasicMaterial({color:0xffffff}),.022*s*-1+.03,.026,.078));
    const lid=mk(new T.SphereGeometry(.082,28,14,0,Math.PI*2,0,Math.PI*.5),skin);lid.rotation.x=-.5;e.add(lid);e.userData.lid=lid;
    H(e);eyes.push(e);lids.push(lid)});
  /* brows */
  const browC=hairC.clone().lerp(new T.Color(0xd8d2c8),L.hair>0xaaaaaa?0:0);
  const brows=[];[-1,1].forEach(s=>{const th=L.brow||.017;const cv=new T.CatmullRomCurve3([new T.Vector3(s*.07,.775,.462),new T.Vector3(s*.13,.8,.452),new T.Vector3(s*.2,.808,.43),new T.Vector3(s*.27,.793,.4),new T.Vector3(s*.31,.775,.372)]);
    const b=mk(new T.TubeGeometry(cv,16,fem?th*.7:th,6,false),PM(browC,{roughness:.9}));b.scale.set(1,1,1);H(b);brows.push(b)});
  /* wrinkles for older faces */
  if(!L.young){const wm=new T.MeshBasicMaterial({color:0x5a2c20,transparent:true,opacity:.14,depthWrite:false});[.88,.915,.95].forEach((y,i)=>{const cv=new T.CatmullRomCurve3([new T.Vector3(-.26+i*.03,y,.4),new T.Vector3(-.1,y+.012,.455),new T.Vector3(.1,y+.012,.455),new T.Vector3(.26-i*.03,y,.4)]);H(new T.Mesh(new T.TubeGeometry(cv,18,.004,4,false),wm))});
    [-1,1].forEach(s=>{[0,1].forEach(k=>{const cv=new T.CatmullRomCurve3([new T.Vector3(s*.27,.65-k*.02,.37),new T.Vector3(s*.31,.665-k*.035,.34),new T.Vector3(s*.34,.665-k*.06,.31)]);H(new T.Mesh(new T.TubeGeometry(cv,6,.003,4,false),wm))});
      const nl=new T.CatmullRomCurve3([new T.Vector3(s*.06,.45,.5),new T.Vector3(s*.11,.4,.485),new T.Vector3(s*.13,.34,.47)]);H(new T.Mesh(new T.TubeGeometry(nl,8,.0035,4,false),wm))})}
  /* mouth: lips, corners and inside */
  const lipC=fem?0xa83a52:0x9c564e,lipM=PM(lipC,{roughness:.5,clearcoat:.12});
  const mouth=new T.Group();mouth.position.set(0,.372,.452);mouth.rotation.x=.12;
  const inside=mk(SP(.1,16,10),SM(0x2a0c0c,.8),0,-.004,-.012,1,.08,.5);mouth.add(inside);
  const up=new T.Group();[-1,1].forEach(s=>{const u=mk(SP(.06,16,10),lipM,s*.055,.012,.0,1,.36,.5);u.rotation.z=s*-.16;up.add(u)});mouth.add(up);
  const low=new T.Group();const lw=mk(SP(.1,18,12),lipM,0,-.022,.002,1,.3,.5);low.add(lw);mouth.add(low);
  [-1,1].forEach(s=>mouth.add(mk(SP(.012,8,6),SM(0x5a2a24,.8),s*.108,.01,-.004)));
  mouth.userData={inside,low};H(mouth);
  const mouthSet=v=>{inside.scale.y=.08+v*1.3;low.position.y=-v*.04;inside.position.y=-.004-v*.02};
  /* hair, beard and mustache from strand clumps */
  const hs=L.hs||'short',pos=hg.attributes.position,nor=hg.attributes.normal,N=pos.count;const P=new T.Vector3(),Nn=new T.Vector3();
  const vertex=i=>{P.fromBufferAttribute(pos,i);Nn.fromBufferAttribute(nor,i);return[P,Nn]};
  const crown=new T.Vector3(0,1.02,-.12);
  const flowDir=(p,n,out)=>{const d=p.clone().sub(crown).normalize();d.addScaledVector(n,-d.dot(n));if(out)d.addScaledVector(n,out);return d.normalize()};
  const hairGeo=new T.CapsuleGeometry(hs==='wild'?.02:.0125,hs==='wild'?.15:.115,2,5);
  function hairPlace(){return r=>{const i=(r()*N)|0,[p,n]=vertex(i);const nx=Math.abs(p.x)/.46;let ok=false;
    if(hs==='short'||hs==='bun'){const hl=(hs==='bun'?.9:.93)-.36*nx*nx;ok=p.z<=.03?p.y>.4:(p.y>hl)}
    else if(hs==='recede'){const hl=1.0-.3*nx*nx;ok=(p.z<=.03?p.y>.42&&(p.y<.95||r()<.55):p.y>hl&&r()<.85)}
    else if(hs==='sides'){ok=(p.z<=.02&&p.y>.4&&p.y<.82)||(p.y>1.05&&r()<.04)}
    else if(hs==='wild'){ok=p.y>.55||(p.z<0&&p.y>.38)}
    if(!ok)return null;const d=hs==='wild'?n.clone().add(new T.Vector3(r()-.5,r()*.4,r()-.5)).normalize():flowDir(p,n,.12+r()*.1);
    const big=hs==='wild'?1.4:1;return{pos:p.clone().addScaledVector(n,.006),dir:d,s:[(.9+r()*.5)*big,(.8+r()*.7)*big,(.9+r()*.5)*big]}}}
  if(hs!=='bald'){
    const cap=(rx,sc)=>{const m=mk(new T.SphereGeometry(.532,40,24,0,Math.PI*2,0,Math.PI*sc),baseHair,0,.57,-.04,.93,1.08,1.0);m.rotation.x=rx;return m};
    if(hs==='short')H(cap(-.62,.5));if(hs==='recede')H(cap(-.8,.46));if(hs==='bun')H(cap(-.72,.5));if(hs==='wild')H(cap(-.6,.5));
    if(hs==='sides'){H(mk(SP(.5,28,18),baseHair,0,.5,-.2,.9,.78,.82));[-1,1].forEach(s=>H(mk(SP(.15,14,12),baseHair,s*.4,.55,-.07,.7,1.2,1)))}
    H(clumpInst(hairGeo,hairMat,hs==='wild'?1100:hs==='sides'?900:1500,hairPlace(),rnd));
    if(hs==='bun'){H(mk(SP(.2,20,16),baseHair,0,1.0,-.4));H(clumpInst(new T.CapsuleGeometry(.02,.12,2,5),hairMat,320,r=>{const d=new T.Vector3(r()-.5,r()-.5,r()-.5).normalize();return{pos:new T.Vector3(0,1.0,-.4).addScaledVector(d,.2),dir:d.clone().cross(new T.Vector3(0,1,0)).normalize(),s:[1,1,1]}},rnd))}
  }
  if(L.beard==='full'){const bc=new T.Color(L.bc||L.hair),bm=PM(bc,{roughness:.7,sheen:.6,sheenColor:bc.clone().lerp(new T.Color(0xffffff),.4)});
    H(clumpInst(new T.CapsuleGeometry(.0135,.12,2,5),bm,1500,r=>{const i=(r()*N)|0,[p,n]=vertex(i);
      if(!(p.y<.46&&p.y>.02&&p.z>-.12))return null;if(p.y>.3&&Math.abs(p.x)<.21)return null;if(Math.abs(p.x)<.15&&p.y>.32&&p.y<.45&&p.z>.3)return null;
      if(p.y>.2&&Math.abs(p.x)>.3&&p.z<.1)return null;
      const d=new T.Vector3(n.x*.3,-1,n.z*.25).normalize();return{pos:p.clone().addScaledVector(n,.01),dir:d,s:[1+r()*.4,.9+r()*.8,1+r()*.4]}},rnd));
    H(mk(SP(.3,20,14),SM(bc.clone().multiplyScalar(.65),.9),0,.16,.14,1.15,.55,.7))}
  if(L.beard==='full'||L.mu){const bc=new T.Color(L.bc||L.hair),bm=PM(bc,{roughness:.7});[-1,1].forEach(s=>{for(let k=0;k<9;k++){const m=mk(new T.CapsuleGeometry(.012,.07+k*.004,3,6),bm,s*(.012+k*.014),.41-k*.0025,.472-k*.004);m.rotation.z=Math.PI/2-s*(.35+k*.04);m.rotation.y=s*.1;H(m)}})}
  /* glasses */
  if(L.glasses){const gm=SM(L.gc||0x222222,.25,.85);const lensM=PM(0xdbeaff,{roughness:.02,metalness:0,transparent:true,opacity:.13,clearcoat:1,clearcoatRoughness:0});
    [-1,1].forEach(s=>{const r=new T.Mesh(new T.TorusGeometry(.108,.0085,12,34),gm);r.position.set(s*.178,.635,.492);H(r);const ln=new T.Mesh(new T.CircleGeometry(.104,28),lensM);ln.position.set(s*.178,.635,.493);H(ln);
      H(mk(new T.BoxGeometry(.011,.011,.42),gm,s*.29,.64,.28));H(mk(SP(.014,8,6),gm,s*.088,.6,.488))});
    H(mk(new T.BoxGeometry(.075,.012,.012),gm,0,.66,.5))}
  if(fem)[-1,1].forEach(s=>H(mk(SP(.032,12,10),SM(L.acc||0xe8c36a,.2,.95),s*.462,.42,-.01)));
  g.userData={head,eyes,lids,brows,mouth,mouthSet,arms,body,headM};
  return g}

window.R3P={person:build};
})();
