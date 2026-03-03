'use client'
import { useState } from 'react'
const CATS=['Tech','Creative','Academic']
const iS={width:'100%',background:'#1A1A1A',border:'1px solid rgba(245,197,24,0.1)',borderRadius:'10px',padding:'10px 14px',color:'#F5F5F0',fontFamily:'DM Sans,sans-serif',fontSize:'14px',outline:'none'}
const lS={display:'block',fontSize:'12px',fontWeight:600,color:'#A0A0A0',marginBottom:'6px',fontFamily:'DM Sans,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase'}
export default function PostGigModal({onClose,onSubmit}){
  const [form,setForm]=useState({title:'',description:'',category:'Tech',price:'',priceType:'fixed',deadline:'',visibility:'all',skillTags:[]})
  const [loading,setLoading]=useState(false)
  const u=(k,v)=>setForm(f=>({...f,[k]:v}))
  async function aiSuggest(type){
    if(!form.title)return
    setLoading(true)
    try{
      const res=await fetch('/api/kai/suggest-description',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:form.title,category:form.category,type})})
      const d=await res.json()
      if(type==='desc')u('description',d.result)
      if(type==='price')u('price',d.result)
      if(type==='tags')u('skillTags',d.result||[])
    }catch(e){console.error(e)}
    setLoading(false)
  }
  return(
    <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#111111',border:'1px solid rgba(245,197,24,0.2)',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'540px',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'22px',color:'#F5F5F0'}}>Post a Gig</h2>
          <button onClick={onClose} style={{background:'#1A1A1A',border:'none',color:'#A0A0A0',width:'32px',height:'32px',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>✕</button>
        </div>
        <div style={{marginBottom:'18px'}}>
          <label style={lS}>Category</label>
          <div style={{display:'flex',gap:'8px'}}>
            {CATS.map(c=>{const cols={Tech:'#4F8EF7',Creative:'#B57BFF',Academic:'#4FD1A0'};const a=form.category===c;return<button key={c} onClick={()=>u('category',c)} style={{flex:1,padding:'8px',borderRadius:'10px',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'13px',border:`1px solid ${a?cols[c]:'rgba(255,255,255,0.08)'}`,background:a?`${cols[c]}20`:'#1A1A1A',color:a?cols[c]:'#A0A0A0'}}>{c}</button>})}
          </div>
        </div>
        <div style={{marginBottom:'18px'}}>
          <label style={lS}>Gig Title *</label>
          <input value={form.title} onChange={e=>u('title',e.target.value)} placeholder="e.g. Need DSA tutor for placement prep" style={iS}/>
        </div>
        <div style={{marginBottom:'18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
            <label style={{...lS,marginBottom:0}}>Description</label>
            <button onClick={()=>aiSuggest('desc')} style={{fontSize:'11px',padding:'4px 10px',background:'rgba(245,197,24,0.1)',color:'#F5C518',border:'1px solid rgba(245,197,24,0.2)',borderRadius:'6px',cursor:'pointer'}}>{loading?'⏳...':'✨ AI Suggest'}</button>
          </div>
          <textarea value={form.description} onChange={e=>u('description',e.target.value)} placeholder="Describe what you need..." rows={3} style={{...iS,resize:'vertical'}}/>
        </div>
        <div style={{display:'flex',gap:'12px',marginBottom:'18px'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
              <label style={{...lS,marginBottom:0}}>Price (₹)</label>
              <button onClick={()=>aiSuggest('price')} style={{fontSize:'11px',padding:'4px 10px',background:'rgba(245,197,24,0.1)',color:'#F5C518',border:'1px solid rgba(245,197,24,0.2)',borderRadius:'6px',cursor:'pointer'}}>✨ Fair Price</button>
            </div>
            <input value={form.price} onChange={e=>u('price',e.target.value)} placeholder="500" type="number" style={iS}/>
          </div>
          <div style={{width:'120px'}}>
            <label style={lS}>Type</label>
            <select value={form.priceType} onChange={e=>u('priceType',e.target.value)} style={{...iS,cursor:'pointer'}}>
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:'12px',marginBottom:'24px'}}>
          <div style={{flex:1}}>
            <label style={lS}>Deadline</label>
            <input type="date" value={form.deadline} onChange={e=>u('deadline',e.target.value)} style={iS}/>
          </div>
          <div style={{flex:1}}>
            <label style={lS}>Visibility</label>
            <select value={form.visibility} onChange={e=>u('visibility',e.target.value)} style={{...iS,cursor:'pointer'}}>
              <option value="all">All Students</option>
              <option value="department">My Department</option>
              <option value="year">My Year</option>
            </select>
          </div>
        </div>
        <button onClick={()=>onSubmit(form)} disabled={!form.title||!form.price} style={{width:'100%',padding:'14px',background:form.title&&form.price?'#F5C518':'#222',color:form.title&&form.price?'#0A0A0A':'#A0A0A0',border:'none',borderRadius:'12px',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'15px',cursor:form.title&&form.price?'pointer':'not-allowed'}}>Post Gig 🚀</button>
      </div>
    </div>
  )
}
