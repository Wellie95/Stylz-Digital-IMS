import React, { useMemo, useRef, useState } from "react";
import { Download, Copy, FileText, ImagePlus, Palette, Plus, Save, Trash2, Type, Upload, Wand2, GripVertical } from "lucide-react";
import "./CompanyDocuments.css";

const KEY="stylz_ims_company_documents";
const COMPANY_KEY="stylz_ims_company_profile";
const defaults={name:"STYLZ DIGITAL SOLUTIONS",tagline:"Creative Printing, Branding & Digital Solutions",registration:"Reg No. 2023/916461/07 · Zimbabwe & South Africa",address:"Randfontein, Gauteng, South Africa",phone:"",email:"info@stylzdigital.co.za",website:"stylzdigital.co.za",services:"Large-format printing, digital printing, graphic design, websites, online applications and branding.",primary:"#174ea6",secondary:"#e31b23",font:"Arial"};
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||"null")||f}catch{return f}};
const uid=()=>Date.now()+Math.random();
const blocksFor=(type)=>type==="profile"?[{id:uid(),type:"hero",title:"COMPANY PROFILE",text:"Professional solutions for modern businesses."},{id:uid(),type:"text",title:"About Us",text:"Tell customers who you are, what you do and why they should work with you."},{id:uid(),type:"columns",title:"Mission & Vision",text:"Our mission|Our vision"},{id:uid(),type:"services",title:"Our Services",text:"Printing and branding|Graphic design|Websites|Business solutions"},{id:uid(),type:"values",title:"Our Values",text:"Quality|Reliability|Creativity|Professionalism"}]:[{id:uid(),type:"letterHeader",title:"Business Letterhead",text:""},{id:uid(),type:"text",title:"Recipient",text:"Recipient Name\nCompany / Address"},{id:uid(),type:"text",title:"Subject",text:"RE: Business Communication"},{id:uid(),type:"text",title:"Letter",text:"Dear Sir/Madam,\n\nWrite your professional letter here.\n\nYours faithfully,"},{id:uid(),type:"signature",title:"Signature",text:"Welly|Administrator"}];

function loadCompany(){return {...defaults,...read(COMPANY_KEY,{})}}
function newDoc(type="profile"){return {id:uid(),name:type==="profile"?"Untitled Company Profile":"Untitled Letterhead",type,template:"modern",blocks:blocksFor(type),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}

export default function CompanyDocuments(){
 const [company,setCompany]=useState(loadCompany); const [docs,setDocs]=useState(()=>read(KEY,[])); const [activeId,setActiveId]=useState(()=>docs[0]?.id||null); const [type,setType]=useState("profile"); const [template,setTemplate]=useState("modern"); const [selected,setSelected]=useState(null); const [prompt,setPrompt]=useState(""); const [zoom,setZoom]=useState(70); const fileRef=useRef(null);
 const active=docs.find(d=>d.id===activeId)||null;
 const persist=(next)=>{setDocs(next);localStorage.setItem(KEY,JSON.stringify(next))};
 const updateDoc=(patch)=>{if(!active)return;persist(docs.map(d=>d.id===active.id?{...d,...patch,updatedAt:new Date().toISOString()}:d))};
 const updateBlocks=(blocks)=>updateDoc({blocks});
 const create=(t=type)=>{const d=newDoc(t);d.template=template;persist([...docs,d]);setActiveId(d.id);setType(t);setSelected(d.blocks[0].id)};
 const duplicate=()=>active&&(()=>{const d={...active,id:uid(),name:`${active.name} Copy`,blocks:active.blocks.map(b=>({...b,id:uid()})),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};persist([...docs,d]);setActiveId(d.id)})();
 const remove=()=>{if(active&&window.confirm("Delete this saved document?")){const n=docs.filter(d=>d.id!==active.id);persist(n);setActiveId(n[0]?.id||null)}};
 const saveCompany=(c)=>{setCompany(c);localStorage.setItem(COMPANY_KEY,JSON.stringify(c))};
 const generate=()=>{
  const p=prompt.trim(); if(!p)return;
  const info=parseCompanyPrompt(p);
  const generated=createProfileFromInfo(info);
  saveCompany(generated.company);
  persist([...docs,generated.doc]);
  setActiveId(generated.doc.id);setType("profile");setTemplate(generated.doc.template);setSelected(generated.doc.blocks[0].id);
 }; const addBlock=()=>{const b={id:uid(),type:"text",title:"New Section",text:"Click this section to edit it."};updateBlocks([...(active?.blocks||[]),b]);setSelected(b.id)};
 const move=(id,dir)=>{const a=[...(active?.blocks||[])],i=a.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];updateBlocks(a)};
 const updateBlock=(id,patch)=>updateBlocks(active.blocks.map(b=>b.id===id?{...b,...patch}:b));
 const removeBlock=id=>updateBlocks(active.blocks.filter(b=>b.id!==id));
 const selectedBlock=active?.blocks.find(b=>b.id===selected);
 const exportPDF=()=>window.print();
 const logoUpload=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>saveCompany({...company,logo:r.result});r.readAsDataURL(f)};
 const colors={primary:company.primary,secondary:company.secondary};
 return <div className="studio">
  <header className="studio-top no-print"><div><span className="studio-kicker">STYLZ IMS · DOCUMENT STUDIO</span><h1>Canva-style Business Designer</h1></div><div className="studio-actions"><button onClick={()=>create("profile")}><Plus size={16}/> New Profile</button><button onClick={()=>create("letter")}><Plus size={16}/> New Letterhead</button><button onClick={duplicate}><Copy size={16}/> Duplicate</button><button className="primary" onClick={exportPDF}><Download size={16}/> Download PDF</button></div></header>
  <div className="studio-layout no-print">
   <aside className="studio-sidebar">
    <div className="side-section"><strong>Saved Documents</strong>{docs.length===0&&<small>No saved documents yet.</small>}{docs.map(d=><button className={d.id===activeId?"doc-list active":"doc-list"} key={d.id} onClick={()=>{setActiveId(d.id);setType(d.type)}}><FileText size={15}/><span>{d.name}</span></button>)}</div>
    <div className="side-section"><strong>Templates</strong><button onClick={()=>{setType("profile");setTemplate("modern");create("profile")}}>Modern Profile</button><button onClick={()=>{setType("profile");setTemplate("corporate");create("profile")}}>Corporate Profile</button><button onClick={()=>{setType("profile");setTemplate("creative");create("profile")}}>Creative Profile</button><button onClick={()=>{setType("letter");setTemplate("classic");create("letter")}}>Classic Letterhead</button><button onClick={()=>{setType("letter");setTemplate("modern");create("letter")}}>Modern Letterhead</button><button onClick={()=>{setType("letter");setTemplate("bold");create("letter")}}>Bold Letterhead</button></div>
    {active&&<div className="side-section"><strong>Document</strong><input value={active.name} onChange={e=>updateDoc({name:e.target.value})}/><button onClick={addBlock}><Plus size={15}/> Add section</button><button onClick={remove} className="danger"><Trash2 size={15}/> Delete</button></div>}
   </aside>
   <main className="editor-area">
    <div className="editor-toolbar"><div className="tool-group"><button onClick={()=>setZoom(Math.max(40,zoom-10))}>−</button><span>{zoom}%</span><button onClick={()=>setZoom(Math.min(110,zoom+10))}>+</button></div><div className="tool-group"><button onClick={()=>fileRef.current?.click()}><Upload size={15}/> Logo</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={logoUpload}/><label><Palette size={15}/> Primary <input type="color" value={company.primary} onChange={e=>saveCompany({...company,primary:e.target.value})}/></label><label>Secondary <input type="color" value={company.secondary} onChange={e=>saveCompany({...company,secondary:e.target.value})}/></label><label><Type size={15}/> Font <select value={company.font} onChange={e=>saveCompany({...company,font:e.target.value})}><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Trebuchet MS</option><option>Times New Roman</option></select></label></div></div>
    <div className="canvas-scroll"><div className="canvas" style={{transform:`scale(${zoom/100})`}}>{active?<DocumentCanvas doc={active} company={company} colors={colors} selected={selected} setSelected={setSelected} updateBlock={updateBlock} move={move} removeBlock={removeBlock}/>:<div className="empty-canvas"><Wand2 size={38}/><h2>Create a document</h2><p>Choose a template or create a new company profile or letterhead.</p></div>}</div></div>
   </main>
   <aside className="properties no-print"><div className="property-title"><strong>Design & Content</strong><small>Selected element</small></div>{!active&&<p>Create a document to begin.</p>}{active&&<><div className="prompt-box"><Wand2 size={16}/><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Prompt this document..."/><button onClick={generate}>Generate</button></div><div className="prop-section"><strong>Company</strong>{["name","tagline","registration","address","phone","email","website","services"].map(k=><label key={k}>{k}<input value={company[k]||""} onChange={e=>saveCompany({...company,[k]:e.target.value})}/></label>)}</div>{selectedBlock&&<BlockEditor block={selectedBlock} update={p=>updateBlock(selectedBlock.id,p)}/>}</>}</aside>
  </div>
  {active&&<div className="mobile-save no-print"><button onClick={exportPDF}><Download size={16}/> Download PDF</button></div>}
 </div>
}

function clean(v){return (v||"").replace(/^[-•*]+\\s*/,"").replace(/\\s+/g," ").trim()}
function extractField(text,labels){
 const lines=text.split(/\\r?\\n/).map(clean).filter(Boolean);
 for(const line of lines){for(const label of labels){const m=line.match(new RegExp("^"+label.replace(/[.*+?^{}()|[\\]\\\\]/g,"\\\\$&")+"\\s*[:\\-]\\s*(.+)$","i"));if(m)return clean(m[1]);}}
 return "";
}
function section(text,names){
 const lines=text.split(/\\r?\\n/);let on=false,out=[];
 for(const raw of lines){const line=clean(raw);if(!line)continue;
  if(names.some(n=>new RegExp("^"+n+"\\s*:?[ ]*$","i").test(line))){on=true;continue;}
  if(on&&/^[A-Z][A-Za-z &/\\-]{2,45}:?$/.test(line)&&!line.includes("http"))break;
  if(on)out.push(line);
 } return out;
}
function parseCompanyPrompt(text){
 const lines=text.split(/\\r?\\n/).map(clean).filter(Boolean);
 let name=extractField(text,["company name","business name","name","company"]);
 if(!name)name=lines.find(x=>/\\b(PTY|LTD|CC|INC|LLC|LIMITED|SOLUTIONS|SERVICES|TRADING)\\b/i.test(x))||"Company Name";
 name=name.replace(/^(company name|business name|name)\\s*[:\\-]\\s*/i,"").trim();
 return {name,tagline:extractField(text,["tagline","slogan"]),registration:extractField(text,["registration","registration number","reg no","company registration"]),phone:extractField(text,["phone","telephone","tel","mobile","whatsapp","contact"]),email:extractField(text,["email","email address"]),address:extractField(text,["address","physical address","location"]),website:extractField(text,["website","web"]),ownership:extractField(text,["ownership","ownership status"]),hours:extractField(text,["operating hours","business hours","hours"]),mission:extractField(text,["mission"]),vision:extractField(text,["vision"]),values:section(text,["values","core values"]).join("|"),about:section(text,["about us","about","company overview","profile","introduction"]).join(" "),serviceLines:section(text,["services","our services","products and services","service offering"]),areas:section(text,["service areas","areas served","coverage"]).join(", "),clients:section(text,["target market","target clients","clients","market"]).join(", "),why:section(text,["why choose us","why choose","key strengths","advantages"]),industries:section(text,["industries","sectors"]),raw:text};
}
function createProfileFromInfo(info){
 const serviceItems=(info.serviceLines.length?info.serviceLines:info.raw.split(/[,;|]/).map(clean).filter(x=>x.length>2&&x.length<90).slice(0,12));
 const blocks=[{id:uid(),type:"hero",title:"COMPANY PROFILE",text:info.tagline||"Professional solutions for modern businesses."},{id:uid(),type:"text",title:"About Us",text:info.about||((info.name)+" is a professional business committed to delivering quality products and services to its customers.")}];
 if(info.mission||info.vision)blocks.push({id:uid(),type:"columns",title:"Mission & Vision",text:(info.mission||"Our mission is to deliver dependable, customer-focused solutions.")+"|"+(info.vision||"Our vision is to build a trusted and sustainable business.")});
 if(serviceItems.length)blocks.push({id:uid(),type:"services",title:"Our Services",text:serviceItems.join("|")});
 if(info.industries)blocks.push({id:uid(),type:"text",title:"Industries & Sectors",text:info.industries});
 if(info.areas||info.clients)blocks.push({id:uid(),type:"text",title:"Market & Service Areas",text:[info.areas&&("Service Areas: "+info.areas),info.clients&&("Target Clients: "+info.clients)].filter(Boolean).join("\n\n")});
 if(info.values)blocks.push({id:uid(),type:"values",title:"Our Values",text:info.values});
 if(info.why.length)blocks.push({id:uid(),type:"services",title:"Why Choose Us",text:info.why.join("|")});
 blocks.push({id:uid(),type:"text",title:"Company Details",text:[info.registration&&("Registration: "+info.registration),info.ownership&&("Ownership: "+info.ownership),info.hours&&("Operating Hours: "+info.hours)].filter(Boolean).join("\n")||"Company information can be updated from the Design & Content panel."});
 blocks.push({id:uid(),type:"text",title:"Contact Us",text:[info.phone&&("Phone / WhatsApp: "+info.phone),info.email&&("Email: "+info.email),info.address&&("Address: "+info.address),info.website&&("Website: "+info.website)].filter(Boolean).join("\n")||"Contact details to be added."});
 const doc={id:uid(),name:info.name+" — Company Profile",type:"profile",template:"modern",blocks,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 const company={...defaults,name:info.name,tagline:info.tagline||"",registration:info.registration||"",address:info.address||"",phone:info.phone||"",email:info.email||"",website:info.website||"",services:serviceItems.join(", "),primary:"#174ea6",secondary:"#e31b23",font:"Arial"};
 return {doc,company};
}

function BlockEditor({block,update}){return <div className="prop-section"><strong>Edit selected section</strong><label>Heading<input value={block.title||""} onChange={e=>update({title:e.target.value})}/></label><label>Content<textarea value={block.text||""} onChange={e=>update({text:e.target.value})}/></label><small>Use each line as a separate item in service/value sections.</small></div>}

function DocumentCanvas({doc,company,colors,selected,setSelected,updateBlock,move,removeBlock}){return <article className={`design-paper template-${doc.template} type-${doc.type}`} style={{fontFamily:company.font,"--primary":colors.primary,"--secondary":colors.secondary}}>{doc.blocks.map((b,i)=><section key={b.id} className={`design-block block-${b.type} ${selected===b.id?"selected":""}`} onClick={()=>setSelected(b.id)}><div className="block-handle no-print"><GripVertical size={14}/><button onClick={e=>{e.stopPropagation();move(b.id,-1)}}>↑</button><button onClick={e=>{e.stopPropagation();move(b.id,1)}}>↓</button><button onClick={e=>{e.stopPropagation();removeBlock(b.id)}}>×</button></div><BlockView block={b} company={company}/></section>)}</article>}
function BlockView({block,company}){if(block.type==="hero")return <><div className="hero-logo">{company.logo?<img src={company.logo}/>:<img src="/stylz_digital_logo.png"/>}</div><span>{block.title}</span><h2>{company.name}</h2><p>{company.tagline}</p></>;if(block.type==="letterHeader")return <><div className="letter-brand"><div className="hero-logo">{company.logo?<img src={company.logo}/>:<img src="/stylz_digital_logo.png"/>}</div><div><h2>{company.name}</h2><p>{company.tagline}</p></div><div className="contact">{company.phone}<br/>{company.email}<br/>{company.website}</div></div><div className="rule"/></>;if(block.type==="columns")return <><h3>{block.title}</h3><div className="columns">{block.text.split("|").map((x,i)=><div key={i}><h4>{i%2===0?"MISSION":"VISION"}</h4><p>{x}</p></div>)}</div></>;if(["services","values"].includes(block.type))return <><h3>{block.title}</h3><div className="chips">{block.text.split("|").map(x=><span key={x}>{x}</span>)}</div></>;if(block.type==="signature")return <div className="signature"><strong>{block.text.split("|")[0]}</strong><span>{block.text.split("|")[1]}</span></div>;return <><h3>{block.title}</h3>{block.text.split("\n").map((x,i)=><p key={i}>{x||"\u00a0"}</p>)}</>}
