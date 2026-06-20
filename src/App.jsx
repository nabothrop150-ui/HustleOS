import { useState, useEffect } from "react";

const YT_API_KEY = "AIzaSyA_DnXK8xVTCIU0nRofbBVuuoFSC0GEeJ4";
const YT_CLIENT_ID = "180437806856-2fppuku0jcipqass4f6psi3u72tpe1td.apps.googleusercontent.com";
const GUMROAD_TOKEN = "aYUvXW58cTepY1vWuuxjaozyPFzE_J6A9exJ_Zm-2y4";

const SECTIONS = ["Dashboard","YouTube Studio","Product Factory","Social Media","Money Tracker","AI Assistant","Settings"];
const ICONS = {"Dashboard":"⚡","YouTube Studio":"🎬","Product Factory":"🏭","Social Media":"📱","Money Tracker":"💰","AI Assistant":"🤖","Settings":"⚙️"};
const INCOME_SOURCES = ["Digital Products","YouTube Revenue","Affiliate Marketing","Freelancing","Sponsorships","Print on Demand"];
const PRODUCT_TYPES = ["Prompt Pack","eBook","Mini Course","Template Pack","Cheat Sheet"];
const PLATFORMS = ["Instagram","Twitter/X","TikTok","LinkedIn","Facebook"];
const AI_TOOLS = [
  {l:"YouTube Script", p:"Write a gripping 8-10 min animated true crime YouTube script with labeled sections HOOK, SETUP, MYSTERY, INVESTIGATION, TWIST, ENDING about: "},
  {l:"Video Titles", p:"Write 10 viral YouTube video titles for a true crime animated video about: "},
  {l:"Video Description", p:"Write a full YouTube description with timestamps and hashtags for a video about: "},
  {l:"Shorts Script", p:"Write a 60-second YouTube Shorts script with hook, story and CTA about: "},
  {l:"Social Post", p:"Write an engaging Instagram post with emojis, CTA and hashtags about: "},
  {l:"Email", p:"Write a professional business email about: "},
  {l:"Content Ideas", p:"Generate 20 YouTube content ideas for a true crime animated channel about: "},
  {l:"Product Listing", p:"Write a full Gumroad product listing with title, description, and FAQs for: "},
];
const VIDEO_IDEAS = [
  "She vanished from a locked room with no exits",
  "The cult that controlled an entire US town",
  "He predicted his own murder in a sealed letter",
  "The ghost ship found drifting with no crew",
  "The family that walked into the forest and never returned",
  "She received a voicemail 3 days after she died",
  "The town that disappeared overnight",
  "The government experiment on its own citizens",
  "The child who led police to a crime scene from a past life",
  "He escaped prison twice — never found the second time",
  "100 colonists vanished without a single trace",
  "Convicted of murder — the victim showed up alive",
  "The world's most mysterious manuscript unsolved 600 years",
  "The detective who solved every case until he became one",
];

function Spinner({msg="Working..."}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:28}}>
      <div style={{width:22,height:22,borderRadius:"50%",border:"3px solid #1a1a2e",borderTop:"3px solid #7c5cff",animation:"spin 0.7s linear infinite"}}/>
      <span style={{color:"#5a5a7a",fontSize:12}}>{msg}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Toast({msg,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,4000);return()=>clearTimeout(t);},[onDone]);
  const isError=msg.startsWith("❌");
  return <div style={{position:"fixed",bottom:28,right:28,background:isError?"#7f1d1d":"#14532d",color:"#fff",padding:"14px 20px",borderRadius:8,fontSize:13,fontWeight:700,zIndex:9999,boxShadow:"0 4px 24px #0009",maxWidth:340,lineHeight:1.5}}>{msg}</div>;
}

const PROXY = "https://api.allorigins.win/raw?url=";

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [toast, setToast] = useState("");
  const showToast = (m)=>setToast(m);

  const [ytToken, setYtToken] = useState(()=>localStorage.getItem("yt_token")||"");
  const [ytChannel, setYtChannel] = useState(null);
  const [ytVideos, setYtVideos] = useState([]);
  const ytConnected = !!ytToken && !!ytChannel;

  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  const [scriptTitles, setScriptTitles] = useState("");
  const [scriptDesc, setScriptDesc] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);

  const [prodType, setProdType] = useState(PRODUCT_TYPES[0]);
  const [prodTopic, setProdTopic] = useState("");
  const [prodResult, setProdResult] = useState("");
  const [prodLoading, setProdLoading] = useState(false);
  const [prodPrice, setProdPrice] = useState("9");
  const [prodName, setProdName] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [gumroadProducts, setGumroadProducts] = useState([]);
  const [gumroadLoading, setGumroadLoading] = useState(false);

  const [platform, setPlatform] = useState("Instagram");
  const [socialTopic, setSocialTopic] = useState("");
  const [socialResult, setSocialResult] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);

  const [entries, setEntries] = useState([
    {source:"Digital Products",amount:9,date:"2026-06-01",note:"First prompt pack sale"}
  ]);
  const [newEntry, setNewEntry] = useState({source:INCOME_SOURCES[0],amount:"",date:"",note:""});
  const total = entries.reduce((s,e)=>s+Number(e.amount),0);

  const [aiTool, setAiTool] = useState(AI_TOOLS[0]);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState("");

  async function claude(prompt) {
    const r = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]})
    });
    const d = await r.json();
    return d.content?.map(b=>b.text||"").join("")||"";
  }

  async function gumroadGet(endpoint) {
    const url = `https://api.gumroad.com/v2/${endpoint}?access_token=${GUMROAD_TOKEN}`;
    const r = await fetch(PROXY + encodeURIComponent(url));
    return JSON.parse(await r.text());
  }

  async function gumroadPost(endpoint, params) {
    const qs = new URLSearchParams({...params, access_token: GUMROAD_TOKEN}).toString();
    const url = encodeURIComponent(`https://api.gumroad.com/v2/${endpoint}`);
    const r = await fetch(`${PROXY}${url}`, {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:qs});
    try { return JSON.parse(await r.text()); } catch { return {success:false}; }
  }

  async function fetchGumroadProducts() {
    setGumroadLoading(true);
    try {
      const d = await gumroadGet("products");
      if(d.success) setGumroadProducts(d.products||[]);
    } catch {}
    setGumroadLoading(false);
  }

  useEffect(()=>{
    fetchGumroadProducts();
    const hash=window.location.hash;
    if(hash.includes("access_token")){
      const p=new URLSearchParams(hash.replace("#","?"));
      const t=p.get("access_token");
      if(t){localStorage.setItem("yt_token",t);setYtToken(t);window.location.hash="";}
    }
    const saved=localStorage.getItem("yt_token");
    if(saved) fetchYT(saved);
  },[]);

  function connectYT(){
    const p=new URLSearchParams({client_id:YT_CLIENT_ID,redirect_uri:window.location.origin,response_type:"token",scope:"https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",include_granted_scopes:"true"});
    window.location.href=`https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  }

  async function fetchYT(token){
    try{
      const r=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&key=${YT_API_KEY}`,{headers:{Authorization:`Bearer ${token}`}});
      const d=await r.json();
      if(d.items?.[0]){
        setYtChannel(d.items[0]);
        const v=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&maxResults=5&type=video&order=date&key=${YT_API_KEY}`,{headers:{Authorization:`Bearer ${token}`}});
        const vd=await v.json();
        if(vd.items) setYtVideos(vd.items);
      } else { localStorage.removeItem("yt_token"); setYtToken(""); }
    } catch { localStorage.removeItem("yt_token"); setYtToken(""); }
  }

  function disconnectYT(){localStorage.removeItem("yt_token");setYtToken("");setYtChannel(null);setYtVideos([]);}

  async function generateScript(){
    if(!scriptTopic.trim()) return;
    setScriptLoading(true); setScriptResult(""); setScriptTitles(""); setScriptDesc("");
    try{
      const [script,titles,desc]=await Promise.all([
        claude(`Write a gripping 8-10 minute animated true crime YouTube script about: "${scriptTopic}". Sections: HOOK (0:00-0:45), SETUP (0:45-2:00), THE MYSTERY (2:00-5:00), THE INVESTIGATION (5:00-8:00), THE TWIST (8:00-9:30), ENDING (9:30-10:00). Full narration with [scene descriptions].`),
        claude(`Write 10 viral YouTube titles for a true crime animated video about: "${scriptTopic}". Numbered list only.`),
        claude(`Write a YouTube description for animated true crime video about: "${scriptTopic}". Include 2 paragraphs, 5 timestamps, subscribe CTA, 10 hashtags.`),
      ]);
      setScriptResult(script); setScriptTitles(titles); setScriptDesc(desc);
    } catch { showToast("❌ Failed. Try again."); }
    setScriptLoading(false);
  }

  async function generateProduct(){
    if(!prodTopic.trim()) return;
    setProdLoading(true); setProdResult(""); setPublishedUrl("");
    try{
      const prompts={
        "Prompt Pack":`Create a complete sellable AI Prompt Pack about "${prodTopic}". Include: title, tagline, 30 fully written prompts each with name, full prompt text, and tip. Add 5 bonus prompt formulas.`,
        "eBook":`Write a complete sellable eBook about "${prodTopic}". Include: title, subtitle, table of contents (8 chapters), full intro (300 words), all 8 chapters (250 words each), conclusion with CTA.`,
        "Mini Course":`Create a complete mini course on "${prodTopic}". Include: title, promise, 5 modules with lessons and action items, welcome email.`,
        "Template Pack":`Create a template pack about "${prodTopic}". Include: title, 10 fully written ready-to-use templates with instructions.`,
        "Cheat Sheet":`Create a cheat sheet about "${prodTopic}". Include: title, 5 sections, quick reference tables, top tips.`,
      };
      const result = await claude(prompts[prodType]);
      setProdResult(result);
      const name = await claude(`Write a short product name (5 words max) for a ${prodType} about "${prodTopic}". Return only the name.`);
      setProdName(name.trim().replace(/['"]/g,""));
    } catch { showToast("❌ Failed. Try again."); }
    setProdLoading(false);
  }

  async function publishToGumroad(){
    if(!prodResult||!prodName){showToast("❌ Generate a product first.");return;}
    setPublishLoading(true); setPublishedUrl("");
    showToast("⏳ Publishing to Gumroad...");
    try{
      const d = await gumroadPost("products",{
        name:prodName,
        price:Math.round(Number(prodPrice)*100),
        description:prodResult.substring(0,800)+"...\n\n✅ Instant download.",
        published:"true",
      });
      if(d.success&&d.product){
        setPublishedUrl(`https://app.gumroad.com/products/${d.product.id}`);
        showToast("✅ Product is LIVE on Gumroad!");
        fetchGumroadProducts();
      } else { setPublishedUrl("manual"); showToast("❌ Use Copy + Open Gumroad below."); }
    } catch { setPublishedUrl("manual"); showToast("❌ Use Copy + Open Gumroad below."); }
    setPublishLoading(false);
  }

  async function generateSocial(){
    if(!socialTopic.trim()) return;
    setSocialLoading(true); setSocialResult("");
    try{
      const guides={"Instagram":"engaging Instagram caption with emojis, 150 words, CTA, 8 hashtags","Twitter/X":"viral Twitter thread 8 tweets, hook first, CTA last","TikTok":"punchy TikTok caption 80 words, hook first, 6 hashtags","LinkedIn":"professional LinkedIn post 200 words, story angle, end with question","Facebook":"conversational Facebook post 150 words, storytelling, CTA"};
      setSocialResult(await claude(`Write a ${guides[platform]} about: "${socialTopic}".`));
    } catch { showToast("❌ Failed."); }
    setSocialLoading(false);
  }

  async function runAI(){
    if(!aiInput.trim()) return;
    setAiLoading(true); setAiResult("");
    try{ setAiResult(await claude(aiTool.p+aiInput)); }
    catch { showToast("❌ Failed."); }
    setAiLoading(false);
  }

  function copy(text,key){
    navigator.clipboard.writeText(text);
    setCopied(key); showToast("✅ Copied!");
    setTimeout(()=>setCopied(""),2000);
  }

  function addEntry(){
    if(!newEntry.amount||!newEntry.date) return;
    setEntries(p=>[...p,{...newEntry}]);
    setNewEntry({source:INCOME_SOURCES[0],amount:"",date:"",note:""});
    showToast("✅ Income logged!");
  }

  const incomeBySource=INCOME_SOURCES.map(src=>({src,total:entries.filter(e=>e.source===src).reduce((s,e)=>s+Number(e.amount),0)}));
  const C={bg:"#07070f",surf:"#0c0c1a",border:"#181830",purple:"#7c5cff",text:"#dddcf8",muted:"#454560",mid:"#8888a8"};
  const S={
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif",fontSize:14,display:"flex"},
    sb:{width:205,background:C.surf,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:100},
    nav:(a)=>({padding:"9px 16px",cursor:"pointer",fontSize:12.5,fontWeight:500,color:a?C.text:C.muted,background:a?"#11112a":"transparent",borderLeft:a?`3px solid ${C.purple}`:"3px solid transparent",display:"flex",alignItems:"center",gap:8,transition:"all 0.12s"}),
    main:{marginLeft:205,padding:"26px 26px 60px",flex:1,maxWidth:900},
    h1:{fontSize:22,fontWeight:900,letterSpacing:"-0.03em",color:"#fff",marginBottom:3},
    sub:{fontSize:12,color:C.muted,marginBottom:24},
    card:{background:C.surf,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px",marginBottom:12},
    label:{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.purple,marginBottom:8},
    stat:{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-0.03em"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12},
    inp:{width:"100%",background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
    ta:{width:"100%",background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",resize:"vertical",minHeight:85,fontFamily:"inherit",boxSizing:"border-box"},
    sel:{width:"100%",background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"},
    btn:{background:C.purple,color:"#fff",border:"none",borderRadius:6,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"},
    btnG:{background:"#14532d",color:"#4ade80",border:"1px solid #16a34a",borderRadius:6,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"},
    btnO:{background:"transparent",color:C.purple,border:`1px solid ${C.purple}`,borderRadius:6,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"},
    btnY:{background:"#713f12",color:"#fcd34d",border:"1px solid #92400e",borderRadius:6,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"},
    btnR:{background:"#4a1a1a",color:"#f87171",border:"1px solid #6a2a2a",borderRadius:6,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"},
    res:{background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:14,marginTop:12,fontSize:12.5,lineHeight:1.75,color:C.mid,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto"},
    chip:(a)=>({padding:"6px 12px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",border:a?`1px solid ${C.purple}`:`1px solid ${C.border}`,background:a?`${C.purple}22`:"transparent",color:a?C.purple:C.muted,fontFamily:"inherit",transition:"all 0.12s"}),
    ideaCard:{background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",fontSize:12,color:C.mid,cursor:"pointer",lineHeight:1.4,transition:"border-color 0.12s"},
    th:{textAlign:"left",padding:"7px 10px",color:C.muted,fontSize:10.5,fontWeight:700,borderBottom:`1px solid ${C.border}`},
    td:{padding:"9px 10px",borderBottom:`1px solid #0a0a18`,color:C.mid,fontSize:12.5},
    badge:(c)=>({display:"inline-block",background:`${c}22`,color:c,borderRadius:4,padding:"2px 8px",fontSize:10.5,fontWeight:700}),
    row:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  };

  return (
    <div style={S.app}>
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={S.sb}>
        <div style={{padding:"18px 16px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:19,fontWeight:900,letterSpacing:"-0.04em",color:"#fff"}}>Hustle<span style={{color:C.purple}}>OS</span></div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>Naboth's Command Center</div>
          <div style={{marginTop:8,display:"flex",gap:5}}>
            <span style={{fontSize:10,color:ytConnected?"#4ade80":"#f87171",fontWeight:700}}>{ytConnected?"● YouTube":"○ YouTube"}</span>
            <span style={{fontSize:10,color:"#4ade80",fontWeight:700}}>● Gumroad</span>
          </div>
        </div>
        <div style={{flex:1,paddingTop:6}}>
          {SECTIONS.map(s=><div key={s} style={S.nav(active===s)} onClick={()=>setActive(s)}><span>{ICONS[s]}</span>{s}</div>)}
        </div>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted}}>Total Earned</div>
          <div style={{fontSize:20,fontWeight:900,color:C.purple}}>${total.toFixed(2)}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>{gumroadProducts.length} products live</div>
        </div>
      </div>

      <div style={S.main}>
        {active==="Dashboard"&&(
          <div>
            <div style={S.h1}>Welcome back, Naboth 👋</div>
            <div style={S.sub}>Your automated business running 24/7.</div>
            <div style={S.g3}>
              <div style={S.card}><div style={S.label}>Total Earned</div><div style={S.stat}>${total.toFixed(0)}</div></div>
              <div style={S.card}><div style={S.label}>Products Live</div><div style={S.stat}>{gumroadProducts.length}</div></div>
              <div style={S.card}><div style={S.label}>YouTube Subs</div><div style={S.stat}>{ytChannel?.statistics?.subscriberCount||"—"}</div></div>
            </div>
            {!ytConnected&&<div style={{...S.card,borderColor:C.purple+"55"}}><div style={S.label}>Connect YouTube</div><button style={S.btn} onClick={connectYT}>Connect YouTube →</button></div>}
            {ytConnected&&ytChannel&&<div style={{...S.card,borderColor:"#4ade8033"}}><div style={S.row}><span style={{color:"#4ade80",fontWeight:700}}>● {ytChannel.snippet?.title}</span><span style={{color:C.muted,fontSize:11,marginLeft:"auto"}}>{ytChannel.statistics?.subscriberCount||0} subs</span><button style={S.btnR} onClick={disconnectYT}>Disconnect</button></div></div>}
            <div style={S.g2}>
              <div style={S.card}>
                <div style={S.label}>Income Streams</div>
                {incomeBySource.map(({src,total:t})=>(
                  <div key={src} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:3}}><span style={{color:C.mid}}>{src}</span><span style={{color:t>0?C.purple:C.muted,fontWeight:700}}>${t.toFixed(0)}</span></div>
                    <div style={{height:3,background:C.border,borderRadius:2}}><div style={{height:3,background:C.purple,borderRadius:2,width:`${total>0?(t/total)*100:0}%`}}/></div>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={S.label}>Live Products</div>
                {gumroadLoading&&<Spinner msg="Loading..."/>}
                {gumroadProducts.slice(0,4).map((p,i)=><div key={i} style={{padding:"8px 0",borderBottom:`1px solid #0a0a18`}}><div style={{fontSize:12.5,fontWeight:600,color:C.text}}>{p.name}</div><div style={{fontSize:11,color:C.muted}}>${(p.price/100).toFixed(2)} · {p.sales_count||0} sales</div></div>)}
                {gumroadProducts.length===0&&!gumroadLoading&&<div style={{fontSize:12,color:C.muted}}>No products yet.</div>}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.label}>Quick Actions</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                {[{l:"Script",t:"YouTube Studio",i:"🎬"},{l:"Product",t:"Product Factory",i:"🏭"},{l:"Post",t:"Social Media",i:"📱"},{l:"Income",t:"Money Tracker",i:"💰"}].map(a=>(
                  <div key={a.l} onClick={()=>setActive(a.t)} style={{background:"#09091a",border:`1px solid ${C.border}`,borderRadius:6,padding:"14px 10px",cursor:"pointer",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:5}}>{a.i}</div>
                    <div style={{fontSize:11,fontWeight:600,color:C.muted}}>{a.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active==="YouTube Studio"&&(
          <div>
            <div style={S.h1}>YouTube Studio 🎬</div>
            <div style={S.sub}>Generate full scripts, titles and descriptions instantly.</div>
            {!ytConnected?<div style={{...S.card,borderColor:C.purple+"44"}}><button style={S.btn} onClick={connectYT}>Connect YouTube →</button></div>:<div style={{...S.card,borderColor:"#4ade8033"}}><div style={S.row}><span style={{color:"#4ade80",fontWeight:700}}>● {ytChannel?.snippet?.title}</span><button style={S.btnR} onClick={disconnectYT}>Disconnect</button></div></div>}
            <div style={S.card}>
              <div style={S.label}>Script Generator</div>
              <textarea style={S.ta} placeholder="Enter video topic..." value={scriptTopic} onChange={e=>setScriptTopic(e.target.value)}/>
              <div style={{...S.row,marginTop:10}}>
                <button style={S.btn} onClick={generateScript} disabled={scriptLoading}>{scriptLoading?"Generating...":"✍️ Generate Script + Titles + Description"}</button>
                {scriptResult&&<button style={S.btnO} onClick={()=>copy(scriptResult,"script")}>{copied==="script"?"✓ Copied":"Copy"}</button>}
              </div>
              {scriptLoading&&<Spinner msg="Writing script..."/>}
              {scriptTitles&&<><div style={{...S.label,marginTop:14}}>Titles</div><div style={S.res}>{scriptTitles}</div></>}
              {scriptResult&&<><div style={{...S.label,marginTop:14}}>Script</div><div style={S.res}>{scriptResult}</div></>}
              {scriptDesc&&<><div style={{...S.label,marginTop:14}}>Description</div><div style={S.res}>{scriptDesc}</div><button style={{...S.btnO,marginTop:8}} onClick={()=>copy(scriptDesc,"desc")}>{copied==="desc"?"✓ Copied":"Copy Description"}</button></>}
            </div>
            <div style={S.card}>
              <div style={S.label}>Video Ideas</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {VIDEO_IDEAS.map((idea,i)=><div key={i} style={S.ideaCard} onClick={()=>{setScriptTopic(idea);showToast("✅ Topic set!");}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.purple} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}><span style={{color:C.purple,fontWeight:700,marginRight:5}}>{String(i+1).padStart(2,"0")}</span>{idea}</div>)}
              </div>
            </div>
            {ytVideos.length>0&&<div style={S.card}><div style={S.label}>Recent Videos</div>{ytVideos.map((v,i)=><div key={i} style={{display:"flex",gap:12,padding:"9px 0",borderBottom:`1px solid #0a0a18`,alignItems:"center"}}><img src={v.snippet?.thumbnails?.default?.url} alt="" style={{width:56,height:42,borderRadius:4,objectFit:"cover"}}/><div><div style={{fontSize:12.5,fontWeight:600,color:C.text}}>{v.snippet?.title}</div><div style={{fontSize:11,color:C.muted}}>{new Date(v.snippet?.publishedAt).toLocaleDateString()}</div></div></div>)}</div>}
          </div>
        )}

        {active==="Product Factory"&&(
          <div>
            <div style={S.h1}>Product Factory 🏭</div>
            <div style={S.sub}>Generate and publish digital products to Gumroad.</div>
            <div style={S.card}>
              <div style={S.label}>Product Type</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{PRODUCT_TYPES.map(p=><button key={p} style={S.chip(prodType===p)} onClick={()=>setProdType(p)}>{p}</button>)}</div>
              <div style={S.label}>Topic</div>
              <textarea style={S.ta} placeholder={`What should your ${prodType} be about?`} value={prodTopic} onChange={e=>setProdTopic(e.target.value)}/>
              <div style={{...S.row,marginTop:10}}>
                <button style={S.btn} onClick={generateProduct} disabled={prodLoading}>{prodLoading?"Creating...":"🚀 Generate "+prodType}</button>
                {prodResult&&<button style={S.btnO} onClick={()=>copy(prodResult,"prod")}>{copied==="prod"?"✓ Copied":"Copy"}</button>}
              </div>
              {prodLoading&&<Spinner msg={`Writing your ${prodType}...`}/>}
              {prodResult&&<div style={S.res}>{prodResult}</div>}
            </div>
            {prodResult&&(
              <div style={{...S.card,borderColor:C.purple+"44"}}>
                <div style={S.label}>Publish to Gumroad</div>
                <div style={S.g2}>
                  <div><div style={{fontSize:10,color:C.muted,marginBottom:5}}>Name</div><input style={S.inp} value={prodName} onChange={e=>setProdName(e.target.value)}/></div>
                  <div><div style={{fontSize:10,color:C.muted,marginBottom:5}}>Price ($)</div><input style={S.inp} type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)}/></div>
                </div>
                <div style={S.row}>
                  <button style={S.btnG} onClick={publishToGumroad} disabled={publishLoading}>{publishLoading?"Publishing...":"🟢 Publish to Gumroad"}</button>
                  <button style={S.btnY} onClick={()=>{copy(prodResult,"prod");setTimeout(()=>window.open("https://app.gumroad.com/products/new","_blank"),1500);}}>📋 Copy + Open Gumroad</button>
                </div>
                {publishedUrl&&publishedUrl!=="manual"&&<div style={{marginTop:12,background:"#14532d22",border:"1px solid #16a34a44",borderRadius:6,padding:"12px"}}><div style={{color:"#4ade80",fontWeight:700,marginBottom:4}}>✅ LIVE on Gumroad!</div><a href={publishedUrl} target="_blank" rel="noreferrer" style={{color:C.purple,fontSize:12}}>{publishedUrl}</a></div>}
                {publishedUrl==="manual"&&<div style={{marginTop:12,background:"#713f1222",border:"1px solid #92400e44",borderRadius:6,padding:"14px"}}><div style={{color:"#fcd34d",fontWeight:700,marginBottom:8}}>📋 Tap "Copy + Open Gumroad" above</div><div style={{fontSize:12,color:C.mid,lineHeight:1.8}}><div>1. Tap Copy + Open Gumroad</div><div>2. New Product → Digital Product</div><div>3. Paste content, set price ${prodPrice}</div><div>4. Publish</div></div></div>}
              </div>
            )}
            <div style={S.card}>
              <div style={S.label}>Live Products</div>
              {gumroadLoading&&<Spinner/>}
              {gumroadProducts.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid #0a0a18`}}><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.name}</div><div style={{fontSize:11,color:C.muted}}>${(p.price/100).toFixed(2)} · {p.sales_count||0} sales</div></div><span style={S.badge("#4ade80")}>LIVE</span><a href={`https://app.gumroad.com/products/${p.id}`} target="_blank" rel="noreferrer" style={{color:C.purple,fontSize:11,fontWeight:700,textDecoration:"none"}}>Edit →</a></div>)}
              {gumroadProducts.length===0&&!gumroadLoading&&<div style={{fontSize:12,color:C.muted}}>No products yet.</div>}
            </div>
            <div style={S.card}>
              <div style={S.label}>Product Ideas</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["50 AI prompts for making money online","Faceless YouTube channel blueprint","How to make your first $100 online","AI tools that replace a full-time employee","The side hustler's AI toolkit","Digital product launch checklist","Productivity system for entrepreneurs","True crime YouTube starter guide"].map((idea,i)=><div key={i} style={S.ideaCard} onClick={()=>{setProdTopic(idea);showToast("✅ Topic set!");}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.purple} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{idea}</div>)}
              </div>
            </div>
          </div>
        )}

        {active==="Social Media"&&(
          <div>
            <div style={S.h1}>Social Media 📱</div>
            <div style={S.sub}>Write platform-perfect posts instantly.</div>
            <div style={S.card}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{PLATFORMS.map(p=><button key={p} style={S.chip(platform===p)} onClick={()=>setPlatform(p)}>{p}</button>)}</div>
              <textarea style={S.ta} placeholder={`Topic for ${platform}...`} value={socialTopic} onChange={e=>setSocialTopic(e.target.value)}/>
              <div style={{...S.row,marginTop:10}}>
                <button style={S.btn} onClick={generateSocial} disabled={socialLoading}>{socialLoading?"Writing...":"✍️ Write "+platform+" Post"}</button>
                {socialResult&&<button style={S.btnO} onClick={()=>copy(socialResult,"social")}>{copied==="social"?"✓ Copied":"Copy"}</button>}
              </div>
              {socialLoading&&<Spinner/>}
              {socialResult&&<div style={S.res}>{socialResult}</div>}
            </div>
          </div>
        )}

        {active==="Money Tracker"&&(
          <div>
            <div style={S.h1}>Money Tracker 💰</div>
            <div style={S.sub}>Log every dollar across all streams.</div>
            <div style={S.g3}>
              <div style={S.card}><div style={S.label}>Total</div><div style={S.stat}>${total.toFixed(2)}</div></div>
              <div style={S.card}><div style={S.label}>Transactions</div><div style={S.stat}>{entries.length}</div></div>
              <div style={S.card}><div style={S.label}>To $100</div><div style={S.stat}>{Math.min(100,Math.round((total/100)*100))}%</div></div>
            </div>
            <div style={{height:5,background:C.border,borderRadius:3,marginBottom:12}}><div style={{height:5,background:C.purple,borderRadius:3,width:`${Math.min(100,(total/100)*100)}%`}}/></div>
            <div style={S.card}>
              <div style={S.label}>Log Income</div>
              <div style={S.g2}>
                <div><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Source</div><select style={S.sel} value={newEntry.source} onChange={e=>setNewEntry(p=>({...p,source:e.target.value}))}>{INCOME_SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
                <div><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Amount</div><input style={S.inp} type="number" placeholder="0.00" value={newEntry.amount} onChange={e=>setNewEntry(p=>({...p,amount:e.target.value}))}/></div>
                <div><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Date</div><input style={S.inp} type="date" value={newEntry.date} onChange={e=>setNewEntry(p=>({...p,date:e.target.value}))}/></div>
                <div><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Note</div><input style={S.inp} placeholder="e.g. Sale" value={newEntry.note} onChange={e=>setNewEntry(p=>({...p,note:e.target.value}))}/></div>
              </div>
              <button style={S.btn} onClick={addEntry}>+ Log Income</button>
            </div>
            <div style={S.card}>
              <div style={S.label}>History</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><th style={S.th}>Date</th><th style={S.th}>Source</th><th style={S.th}>Note</th><th style={{...S.th,textAlign:"right"}}>Amount</th></tr></thead>
                <tbody>{[...entries].reverse().map((e,i)=><tr key={i}><td style={S.td}>{e.date}</td><td style={S.td}><span style={S.badge(C.purple)}>{e.source}</span></td><td style={{...S.td,color:C.muted}}>{e.note||"—"}</td><td style={{...S.td,textAlign:"right",fontWeight:700,color:C.purple}}>${Number(e.amount).toFixed(2)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {active==="AI Assistant"&&(
          <div>
            <div style={S.h1}>AI Assistant 🤖</div>
            <div style={S.sub}>8 tools, instant results.</div>
            <div style={S.card}>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{AI_TOOLS.map(t=><button key={t.l} style={S.chip(aiTool.l===t.l)} onClick={()=>{setAiTool(t);setAiResult("");}}>{t.l}</button>)}</div>
              <textarea style={S.ta} placeholder="Type your topic..." value={aiInput} onChange={e=>setAiInput(e.target.value)}/>
              <div style={{...S.row,marginTop:10}}>
                <button style={S.btn} onClick={runAI} disabled={aiLoading}>{aiLoading?"Generating...":"⚡ Generate"}</button>
                {aiResult&&<button style={S.btnO} onClick={()=>copy(aiResult,"ai")}>{copied==="ai"?"✓ Copied":"Copy"}</button>}
                {aiResult&&<button style={{...S.btnO,borderColor:C.border,color:C.muted}} onClick={()=>setAiResult("")}>Clear</button>}
              </div>
              {aiLoading&&<Spinner/>}
              {aiResult&&<div style={S.res}>{aiResult}</div>}
            </div>
          </div>
        )}

        {active==="Settings"&&(
          <div>
            <div style={S.h1}>Settings ⚙️</div>
            <div style={S.sub}>Your connections.</div>
            <div style={S.card}>
              <div style={S.label}>YouTube</div>
              <div style={{fontSize:12,color:C.mid,marginBottom:10}}>Status: <span style={{color:ytConnected?"#4ade80":"#f87171",fontWeight:700}}>{ytConnected?"Connected ✓":"Not Connected"}</span></div>
              {ytConnected?<button style={S.btnR} onClick={disconnectYT}>Disconnect</button>:<button style={S.btn} onClick={connectYT}>Connect YouTube →</button>}
            </div>
            <div style={S.card}>
              <div style={S.label}>Gumroad</div>
              <div style={{fontSize:12,color:"#4ade80",fontWeight:700,marginBottom:8}}>Connected ✓</div>
              <div style={{fontSize:12,color:C.muted}}>{gumroadProducts.length} products live</div>
            </div>
            <div style={S.card}>
              <div style={S.label}>Credentials</div>
              <div style={{fontSize:12,color:C.mid,lineHeight:2}}>
                <div>YouTube API Key: <span style={{color:C.purple}}>✓</span></div>
                <div>YouTube OAuth: <span style={{color:C.purple}}>✓</span></div>
                <div>Gumroad Token: <span style={{color:C.purple}}>✓</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
