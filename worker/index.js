/* RPsy online API: accounts, progress sync, leaderboard and live battles.
   Runs on Cloudflare Workers with D1 (data) and a Durable Object per battle room. Static files are served by the assets binding. */
const enc=new TextEncoder();
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,PUT,OPTIONS'};
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store',...CORS}});
const fail=(m,s=400)=>json({error:m},s);
const HEROES=['freud','anna','rogers','jung','adler','maslow','skinner','piaget','erikson','bandura','beck','enriquez'];

const SCHEMA=[
 `CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,pw TEXT NOT NULL,salt TEXT NOT NULL,hero TEXT DEFAULT '',xp INTEGER DEFAULT 0,streak INTEGER DEFAULT 0,wins INTEGER DEFAULT 0,battles INTEGER DEFAULT 0,wk TEXT DEFAULT '',wxp INTEGER DEFAULT 0,created INTEGER,seen INTEGER)`,
 `CREATE TABLE IF NOT EXISTS sessions(th TEXT PRIMARY KEY,uid INTEGER NOT NULL,exp INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS progress(uid INTEGER PRIMARY KEY,data TEXT NOT NULL,upd INTEGER NOT NULL)`,
 `CREATE INDEX IF NOT EXISTS users_xp ON users(xp DESC)`,
 `CREATE INDEX IF NOT EXISTS users_wxp ON users(wk,wxp DESC)`];
let ready=null;
const ensure=env=>ready||(ready=env.DB.batch(SCHEMA.map(s=>env.DB.prepare(s))).catch(e=>{ready=null;throw e}));

async function pbkdf2(pw,salt){const k=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},k,256))}
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const same=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};
const weekKey=(d=new Date())=>{const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+String(Math.ceil(((t-y)/864e5+1)/7)).padStart(2,'0')};
const pub=u=>({id:u.id,name:u.username,hero:u.hero||'',xp:u.xp||0,streak:u.streak||0,wins:u.wins||0,battles:u.battles||0});

async function newSession(env,uid){const b=crypto.getRandomValues(new Uint8Array(32)),token=hex(b);await env.DB.prepare('INSERT INTO sessions(th,uid,exp) VALUES(?,?,?)').bind(await sha(token),uid,Date.now()+60*864e5).run();return token}
async function authUser(env,token){if(!token||token.length!==64)return null;const th=await sha(token);const r=await env.DB.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.uid WHERE s.th=? AND s.exp>?').bind(th,Date.now()).first();return r||null}
const bearer=req=>(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
const body=async(req,max=400000)=>{const t=await req.text();if(t.length>max)throw new Error('too large');return JSON.parse(t||'{}')};
const cleanName=n=>String(n||'').trim().toLowerCase();

export default {
  async fetch(req,env){
    const url=new URL(req.url),p=url.pathname;
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
    if(!p.startsWith('/api/'))return env.ASSETS?env.ASSETS.fetch(req):new Response('Not found',{status:404});
    try{
      await ensure(env);
      if(p==='/api/health')return json({ok:true});
      if(p==='/api/register'&&req.method==='POST'){
        const b=await body(req,2000),name=cleanName(b.username),pw=String(b.password||'');
        if(!/^[a-z0-9_]{3,20}$/.test(name))return fail('Username must be 3 to 20 letters, numbers or underscores.');
        if(pw.length<6||pw.length>100)return fail('Password must be at least 6 characters.');
        const salt=crypto.getRandomValues(new Uint8Array(16));
        try{const r=await env.DB.prepare('INSERT INTO users(username,pw,salt,created,seen) VALUES(?,?,?,?,?)').bind(name,await pbkdf2(pw,salt),hex(salt),Date.now(),Date.now()).run();
          const id=r.meta.last_row_id,token=await newSession(env,id);return json({token,user:{id,name,hero:'',xp:0,streak:0,wins:0,battles:0}})}
        catch(e){if(/UNIQUE/i.test(String(e)))return fail('That username is taken.',409);throw e}}
      if(p==='/api/login'&&req.method==='POST'){
        const b=await body(req,2000),name=cleanName(b.username),pw=String(b.password||'');
        const u=await env.DB.prepare('SELECT * FROM users WHERE username=?').bind(name).first();
        const h=u?await pbkdf2(pw,unhex(u.salt)):await pbkdf2(pw,new Uint8Array(16));
        if(!u||!same(h,u.pw))return fail('Wrong username or password.',401);
        await env.DB.prepare('UPDATE users SET seen=? WHERE id=?').bind(Date.now(),u.id).run();
        return json({token:await newSession(env,u.id),user:pub(u)})}
      if(p==='/api/leaderboard'&&req.method==='GET'){
        const week=url.searchParams.get('scope')==='week',wk=weekKey(),col=week?'wxp':'xp';
        const q=week?`SELECT username,hero,xp,wxp,streak,wins FROM users WHERE wk=? AND wxp>0 ORDER BY wxp DESC,id LIMIT 50`:`SELECT username,hero,xp,wxp,streak,wins FROM users WHERE xp>0 ORDER BY xp DESC,id LIMIT 50`;
        const rows=(await (week?env.DB.prepare(q).bind(wk):env.DB.prepare(q)).all()).results.map((r,i)=>({rank:i+1,name:r.username,hero:r.hero,xp:r.xp,score:r[col],streak:r.streak,wins:r.wins}));
        let me=null;const u=await authUser(env,bearer(req));
        if(u){const val=week?(u.wk===wk?u.wxp:0):u.xp;const c=await (week?env.DB.prepare('SELECT COUNT(*) n FROM users WHERE wk=? AND wxp>?').bind(wk,val):env.DB.prepare('SELECT COUNT(*) n FROM users WHERE xp>?').bind(val)).first();me={rank:c.n+1,name:u.username,score:val}}
        return json({scope:week?'week':'all',rows,me})}
      // ----- authenticated -----
      const u=await authUser(env,p==='/api/battle/ws'?url.searchParams.get('token'):bearer(req));
      if(!u)return fail('Please sign in.',401);
      if(p==='/api/me'&&req.method==='GET'){const pr=await env.DB.prepare('SELECT data,upd FROM progress WHERE uid=?').bind(u.id).first();return json({user:pub(u),progress:pr?{data:JSON.parse(pr.data),upd:pr.upd}:null})}
      if(p==='/api/logout'&&req.method==='POST'){await env.DB.prepare('DELETE FROM sessions WHERE th=?').bind(await sha(bearer(req))).run();return json({ok:true})}
      if(p==='/api/progress'&&req.method==='PUT'){
        const b=await body(req),d=b.data;if(!d||typeof d!=='object')return fail('Bad data');
        const xp=Math.max(0,Math.min(1e7,Math.floor(+d.xp||0))),streak=Math.max(0,Math.min(5000,Math.floor(+d.streak||0))),hero=HEROES.includes(d.hero)?d.hero:'',wk=weekKey();
        const delta=Math.max(0,Math.min(xp-(u.xp||0),3000)),wxp=(u.wk===wk?u.wxp:0)+delta,now=Date.now();
        await env.DB.batch([env.DB.prepare('INSERT INTO progress(uid,data,upd) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET data=excluded.data,upd=excluded.upd').bind(u.id,JSON.stringify(d),now),
          env.DB.prepare('UPDATE users SET xp=MAX(xp,?),streak=?,hero=?,wk=?,wxp=?,seen=? WHERE id=?').bind(xp,streak,hero,wk,wxp,now,u.id)]);
        return json({ok:true,upd:now})}
      if(p==='/api/battle/create'&&req.method==='POST'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(5));return json({code:[...r].map(x=>A[x%A.length]).join('')})}
      if(p==='/api/battle/ws'){
        if(req.headers.get('upgrade')!=='websocket')return fail('Expected websocket',426);
        const code=(url.searchParams.get('code')||'').toUpperCase();if(!/^[A-Z0-9]{5}$/.test(code))return fail('Bad room code');
        const h=new Headers(req.headers);h.set('x-uid',String(u.id));h.set('x-name',u.username);h.set('x-hero',u.hero||'');
        return env.ROOM.get(env.ROOM.idFromName(code)).fetch(new Request(req.url,{headers:h,method:'GET'}))}
      return fail('Not found',404);
    }catch(e){return fail('Server error: '+(e&&e.message||e),500)}
  }
};

/* One Durable Object per battle room. A room is reusable: after each battle the same players can start another,
   and the room keeps a running tally of battles won. Tally is persisted so the invite link keeps working later. */
const QDUR=20000,MAXP=4,DMG=18,IDLE=3*864e5;
export class BattleRoom{
  constructor(state,env){this.st=state;this.env=env;this.status='lobby';this.host=0;this.players=new Map();this.qs=[];this.k=-1;this.timer=null;this.qat=0;this.adv=-1;this.tally=new Map();this.rounds=0;this.loaded=null}
  load(){return this.loaded||(this.loaded=this.st.storage.get('t').then(t=>{if(t){this.rounds=t.rounds||0;this.tally=new Map((t.tally||[]).map(x=>[x.uid,x]))}}).catch(()=>{}))}
  persist(){try{this.st.storage.put('t',{rounds:this.rounds,tally:[...this.tally.values()]});this.st.storage.setAlarm(Date.now()+IDLE)}catch(e){}}
  async alarm(){if([...this.players.values()].some(p=>p.ws))return this.st.storage.setAlarm(Date.now()+864e5);await this.st.storage.deleteAll();this.tally=new Map();this.rounds=0;this.players=new Map();this.status='lobby'}
  send(ws,m){try{m.sn=Date.now();ws.send(JSON.stringify(m))}catch(e){}}
  all(m){for(const p of this.players.values())if(p.ws)this.send(p.ws,{...m})}
  tallyList(){return[...this.tally.values()].sort((a,b)=>b.wins-a.wins||a.battles-b.battles)}
  view(){return{t:'lobby',status:this.status,host:this.host,rounds:this.rounds,tally:this.tallyList(),players:[...this.players.values()].map(p=>({uid:p.uid,name:p.name,hero:p.hero,hp:p.hp,score:p.score,correct:p.correct,on:!!p.ws}))}}
  async fetch(req){
    if(req.headers.get('upgrade')!=='websocket')return new Response('Expected websocket',{status:426});
    await this.load();
    const uid=+req.headers.get('x-uid'),name=req.headers.get('x-name'),hero=req.headers.get('x-hero')||'';
    const pair=new WebSocketPair(),[client,server]=Object.values(pair);server.accept();
    const old=this.players.get(uid),deny=m=>{this.send(server,{t:'err',m});server.close(1000,'denied');return new Response(null,{status:101,webSocket:client})};
    if(!old&&this.status==='play')return deny('A battle is in progress in this room. Try again when it ends.');
    if(!old&&this.players.size>=MAXP)return deny('This room is full (4 players).');
    let p=old;if(p){try{p.ws&&p.ws.close(1000,'replaced')}catch(e){}p.ws=server;p.hero=hero||p.hero}else{p={uid,name,hero,hp:100,score:0,correct:0,ans:{},ws:server};this.players.set(uid,p);if(!this.host||!this.players.get(this.host)||!this.players.get(this.host).ws)this.host=uid}
    server.addEventListener('message',ev=>this.msg(p,server,ev.data));
    const gone=()=>{if(p.ws!==server)return;p.ws=null;if(this.status!=='play'){this.players.delete(uid);if(this.host===uid)this.host=[...this.players.keys()][0]||0}this.all(this.view());this.check();this.persist()};
    server.addEventListener('close',gone);server.addEventListener('error',gone);
    this.send(server,{t:'hello',you:uid});this.all(this.view());this.persist();
    if(this.status==='play'){this.send(server,{t:'start',qs:this.qs,resume:true});if(this.k>=0)this.send(server,{t:'q',k:this.k,at:this.qat,dur:QDUR,resume:true})}
    return new Response(null,{status:101,webSocket:client})}
  msg(p,ws,raw){
    if(typeof raw!=='string'||raw.length>3000)return;let m;try{m=JSON.parse(raw)}catch(e){return}
    if(m.t==='start'&&p.uid===this.host&&this.status!=='play'){
      const qs=Array.isArray(m.qs)?m.qs.slice(0,15).filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&x[0].length<=10&&Number.isInteger(x[1])&&x[1]>=0&&x[1]<1000):[];
      if(qs.length<3||this.players.size<2)return this.send(ws,{t:'err2',m:'Need at least 2 players in the room to start.'});
      this.qs=qs;this.status='play';this.k=-1;this.adv=-1;for(const q of this.players.values()){q.hp=100;q.score=0;q.correct=0;q.ans={}}
      this.all({t:'start',qs});this.all(this.view());this.next(3000)}
    else if(m.t==='ans'&&this.status==='play'&&m.k===this.k&&!p.ans[this.k]&&p.hp>0){
      const ms=Math.max(0,Math.min(QDUR,+m.ms||QDUR)),ok=!!m.ok;p.ans[this.k]={ok,ms};let pts=0;const hits=[];
      if(ok){pts=100+Math.round(50*(1-ms/QDUR));p.score+=pts;p.correct++;for(const o of this.players.values())if(o!==p&&o.hp>0){o.hp=Math.max(0,o.hp-DMG);hits.push({uid:o.uid,hp:o.hp})}}
      this.all({t:'ev',k:this.k,uid:p.uid,ok,pts,score:p.score,hits});
      const alive=[...this.players.values()].filter(x=>x.hp>0);
      if(alive.length<=1&&this.players.size>1)return this.finish();
      this.check()}
  }
  check(){if(this.status!=='play')return;const live=[...this.players.values()].filter(x=>x.ws&&x.hp>0);if(!live.length)return this.finish();
    if(live.every(x=>x.ans[this.k]))this.advance(this.k,2300)}
  advance(k,delay){if(this.status!=='play'||k!==this.k||this.adv===k)return;this.adv=k;clearTimeout(this.timer);const last=this.k+1>=this.qs.length;this.all({t:'nx',k:k+1,in:delay,last});setTimeout(()=>{if(this.status!=='play'||this.k!==k)return;if(last)this.finish();else this.next(0)},delay)}
  next(delay){this.k++;this.adv=-1;this.qat=Date.now()+delay;const k=this.k;this.all({t:'q',k,at:this.qat,dur:QDUR});clearTimeout(this.timer);this.timer=setTimeout(()=>this.advance(k,900),delay+QDUR)}
  async finish(){if(this.status!=='play')return;this.status='done';clearTimeout(this.timer);
    const r=[...this.players.values()].map(p=>({uid:p.uid,name:p.name,hero:p.hero,score:p.score,hp:p.hp,correct:p.correct})).sort((a,b)=>(b.hp>0)-(a.hp>0)||b.score-a.score||b.hp-a.hp);
    this.rounds++;r.forEach((x,i)=>{const t=this.tally.get(x.uid)||{uid:x.uid,name:x.name,hero:x.hero,wins:0,battles:0};t.name=x.name;t.hero=x.hero;t.battles++;if(i===0&&r.length>1)t.wins++;this.tally.set(x.uid,t)});
    const h=this.players.get(this.host);if(!h||!h.ws)this.host=[...this.players.values()].find(p=>p.ws)?.uid||this.host;
    this.persist();this.all({t:'end',ranking:r,rounds:this.rounds,tally:this.tallyList()});this.all(this.view());
    try{await this.env.DB.batch(r.map((x,i)=>this.env.DB.prepare('UPDATE users SET battles=battles+1,wins=wins+? WHERE id=?').bind(i===0&&r.length>1?1:0,x.uid)))}catch(e){}}
}
