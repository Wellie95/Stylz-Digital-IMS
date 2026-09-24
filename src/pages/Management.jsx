import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Save, Printer } from "lucide-react";

const CONFIG = {
  Production: { key:"stylz_ims_production", title:"Production", subtitle:"Track jobs from queue to completion.", fields:[["job","Job / Order","text"],["customer","Customer","text"],["status","Status","select",["Queued","In Production","Quality Check","Ready","Completed"]],["progress","Progress %","number"],["dueDate","Due Date","date"],["assignedTo","Assigned To","text"]] },
  Payments: { key:"stylz_ims_payments", title:"Payments", subtitle:"Record customer payments and outstanding balances.", fields:[["reference","Invoice / Reference","text"],["customer","Customer","text"],["amount","Amount (R)","number"],["method","Payment Method","select",["Cash","EFT","eWallet","Card","Other"]],["date","Payment Date","date"],["status","Status","select",["Paid","Part Paid","Pending","Refunded"]]] },
  Inventory: { key:"stylz_ims_inventory", title:"Inventory", subtitle:"Keep track of printing materials and stock levels.", fields:[["item","Item / Material","text"],["category","Category","text"],["quantity","Quantity","number"],["reorder","Reorder Level","number"],["unit","Unit","text"],["supplier","Supplier","text"]] },
  Expenses: { key:"stylz_ims_expenses", title:"Expenses", subtitle:"Record business expenses and operating costs.", fields:[["description","Description","text"],["category","Category","text"],["amount","Amount (R)","number"],["date","Date","date"],["supplier","Supplier / Payee","text"],["method","Payment Method","select",["Cash","EFT","Card","Other"]]] },
  Staff: { key:"stylz_ims_staff", title:"Staff", subtitle:"Manage team members and responsibilities.", fields:[["name","Full Name","text"],["role","Role","text"],["phone","Phone","text"],["email","Email","email"],["status","Status","select",["Active","Inactive","On Leave"]],["notes","Notes","text"]] },
};

const today=()=>new Date().toISOString().slice(0,10);
const read=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch{return[]}};
const money=v=>`R ${Number(v||0).toLocaleString("en-ZA",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function Management({module}){
 const config=CONFIG[module];
 const blank=()=>Object.fromEntries(config.fields.map(([k])=>[k,k==="date"||k==="dueDate"?today():k==="progress"?0:""]));
 const [rows,setRows]=useState(()=>read(config.key)),[search,setSearch]=useState(""),[editing,setEditing]=useState(null),[showForm,setShowForm]=useState(false),[form,setForm]=useState(blank);
 useEffect(()=>{localStorage.setItem(config.key,JSON.stringify(rows))},[config.key,rows]);
 const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return q?rows.filter(r=>Object.values(r).some(v=>String(v??"").toLowerCase().includes(q))):rows},[rows,search]);
 const total=rows.reduce((s,r)=>s+Number(r.amount||0),0);
 const openAdd=()=>{setEditing(null);setForm(blank());setShowForm(true)};
 const openEdit=r=>{setEditing(r);setForm({...blank(),...r});setShowForm(true)};
 const save=e=>{e.preventDefault();if(editing)setRows(a=>a.map(r=>r.id===editing.id?{...form,id:editing.id}:r));else setRows(a=>[...a,{...form,id:Date.now()}]);setShowForm(false);setEditing(null)};
 const remove=id=>{if(window.confirm("Delete this record?"))setRows(a=>a.filter(r=>r.id!==id))};
 return <div className="page management-page">
  <div className="page-header"><div><h1>{config.title}</h1><p>{config.subtitle}</p></div><div style={{display:"flex",gap:10}}><button className="secondary-button" onClick={()=>window.print()}><Printer size={17}/> Print</button><button className="primary-button" onClick={openAdd}><Plus size={18}/> Add {module==="Staff"?"Staff Member":"Record"}</button></div></div>
  <div className="stats-grid"><div className="stat-card"><div className="stat-info"><span>Total Records</span><strong>{rows.length}</strong><small>Saved locally</small></div></div><div className="stat-card"><div className="stat-info"><span>{module==="Payments"||module==="Expenses"?"Total Value":"Active Records"}</span><strong>{module==="Payments"||module==="Expenses"?money(total):rows.filter(r=>r.status!=="Completed"&&r.status!=="Inactive").length}</strong><small>Current data</small></div></div><div className="stat-card"><div className="stat-info"><span>Search Results</span><strong>{filtered.length}</strong><small>Matching records</small></div></div></div>
  <div className="data-panel"><div className="panel-header"><div><h2>{config.title} Records</h2><p>Search, edit or remove records.</p></div><div className="topbar-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`}/></div></div>
  {filtered.length===0?<div className="empty-state"><h2>No records yet</h2><p>Add your first record using the button above.</p></div>:<div className="orders-table management-table"><div className="table-header">{config.fields.map(([k,l])=><span key={k}>{l}</span>)}<span>Actions</span></div>{filtered.map(r=><div className="table-row" key={r.id}>{config.fields.map(([k])=><span key={k}>{k==="amount"?money(r[k]):k==="progress"?`${r[k]||0}%`:r[k]||"—"}</span>)}<span style={{display:"flex",gap:6}}><button className="product-edit-button" onClick={()=>openEdit(r)} title="Edit"><Pencil size={15}/></button><button className="product-edit-button" onClick={()=>remove(r.id)} title="Delete"><Trash2 size={15}/></button></span></div>)}</div>}
  </div>
  {showForm&&<div className="stylz-modal-overlay"><div className="quote-form-modal"><div className="modal-header"><div><h2>{editing?"Edit":"Add"} {config.title} Record</h2><p>Enter the details below.</p></div><button className="icon-button" onClick={()=>setShowForm(false)}><X size={18}/></button></div><form onSubmit={save}><div className="form-grid">{config.fields.map(([k,l,t,opts])=><div className="form-group" key={k}><label>{l}</label>{t==="select"?<select value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input type={t} min={t==="number"?"0":undefined} max={k==="progress"?"100":undefined} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={["job","customer","name","item","description","amount"].includes(k)}/>}</div>)}</div><div className="modal-actions"><button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="stylz-primary-btn"><Save size={17}/> {editing?"Update":"Save"} Record</button></div></form></div></div>}
 </div>
}
export default Management;
