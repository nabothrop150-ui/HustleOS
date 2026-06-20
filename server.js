import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import {fileURLToPath} from 'url';
import {dirname,join} from 'path';
const __dirname=dirname(fileURLToPath(import.meta.url));
const app=express();
const PORT=process.env.PORT||3000;
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname,'dist')));
app.post('/api/claude',async(req,res)=>{
try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify(req.body)});res.json(await r.json());}catch(e){res.status(500).json({error:e.message});}
});
app.get('/api/gumroad/:ep',async(req,res)=>{
try{const r=await fetch(`https://api.gumroad.com/v2/${req.params.ep}?access_token=${process.env.GUMROAD_TOKEN}`);res.json(await r.json());}catch(e){res.status(500).json({error:e.message});}
});
app.post('/api/gumroad/:ep',async(req,res)=>{
try{const p=new URLSearchParams({...req.body,access_token:process.env.GUMROAD_TOKEN});const r=await fetch(`https://api.gumroad.com/v2/${req.params.ep}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:p.toString()});res.json(await r.json());}catch(e){res.status(500).json({error:e.message});}
});
app.get('*',(req,res)=>res.sendFile(join(__dirname,'dist','index.html')));
app.listen(PORT,'0.0.0.0',()=>console.log(`HustleOS live on port ${PORT}`));
