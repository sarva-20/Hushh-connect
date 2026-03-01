#!/bin/bash

cat > src/components/Navbar.jsx << 'EOF'
'use client'
import { useState } from 'react'
export default function Navbar({ onPostGig }) {
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(10,10,10,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(245,197,24,0.15)', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'32px', height:'32px', background:'#F5C518', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#0A0A0A', fontSize:'14px', fontFamily:'Syne,sans-serif' }}>HC</div>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'18px', color:'#F5F5F0' }}>Hushh<span style={{ color:'#F5C518' }}>Connect</span></span>
        <span style={{ fontSize:'10px', background:'rgba(245,197,24,0.15)', color:'#F5C518', padding:'2px 8px', borderRadius:'20px', fontWeight:600 }}>KPRIET</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={onPostGig} style={{ background:'#F5C518', color:'#0A0A0A', border:'none', borderRadius:'10px', padding:'8px 18px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>+ Post a Gig</button>
        <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#F5C518,#C9A000)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#0A0A0A', fontSize:'14px', fontFamily:'Syne,sans-serif', cursor:'pointer' }}>S</div>
      </div>
    </nav>
  )
}
EOF

cat > src/components/GigCard.jsx << 'EOF'
'use client'
const catStyle = { Tech:{color:'#4F8EF7',bg:'rgba(79,142,247,0.1)'}, Creative:{color:'#B57BFF',bg:'rgba(181,123,255,0.1)'}, Academic:{color:'#4FD1A0',bg:'rgba(79,209,160,0.1)'} }
const statStyle = { open:{label:'OPEN',color:'#4FD1A0'}, in_progress:{label:'IN PROGRESS',color:'#F5C518'}, completed:{label:'COMPLETED',color:'#A0A0A0'} }
function days(d) { const diff=Math.ceil((new Date(d)-new Date())/(1000*60*60*24)); return diff<=0?'Today':`${diff}d left` }
export default function GigCard({ gig, index=0 }) {
  const cat=catStyle[gig.category]||catStyle.Tech
  const stat=statStyle[gig.status]||statStyle.open
  const dl=days(gig.deadline)
  return (
    <div style={{ background:'#111111', border:'1px solid rgba(245,197,24,0.08)', borderRadius:'16px', padding:'20px', transition:'transform 0.2s', cursor:'pointer' }}
      onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <div style={{ display:'flex', gap:'8px' }}>
          <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:cat.color, background:cat.bg, fontFamily:'Syne,sans-serif' }}>{gig.category?.toUpperCase()}</span>
          <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', color:stat.color, background:`${stat.color}20`, fontFamily:'Syne,sans-serif' }}>{stat.label}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'20px', color:'#F5C518' }}>₹{gig.price}</div>
          <div style={{ fontSize:'11px', color:'#A0A0A0' }}>{gig.priceType}</div>
        </div>
      </div>
      <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'16px', color:'#F5F5F0', marginBottom:'6px' }}>{gig.title}</h3>
      <p style={{ fontSize:'13px', color:'#A0A0A0', lineHeight:1.6, marginBottom:'12px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{gig.description}</p>
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
        {gig.skillTags?.map(t=><span key={t} style={{ fontSize:'11px', padding:'3px 10px', background:'#1A1A1A', border:'1px solid rgba(245,197,24,0.15)', borderRadius:'6px', color:'#A0A0A0' }}>#{t}</span>)}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#F5C518,#C9A000)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'12px', color:'#0A0A0A' }}>{gig.postedBy?.name?.[0]||'U'}</div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#F5F5F0' }}>{gig.postedBy?.name||'Student'}</div>
            <div style={{ fontSize:'11px', color:'#F5C518' }}>{'★'.repeat(Math.round(gig.postedBy?.rating||4.5))} {gig.postedBy?.rating}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'6px', color:'#A0A0A0', background:'#1A1A1A' }}>⏰ {dl}</span>
          {gig.status==='open'&&<button style={{ background:'#F5C518', color:'#0A0A0A', border:'none', borderRadius:'8px', padding:'6px 16px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>Connect</button>}
        </div>
      </div>
    </div>
  )
}
EOF

cat > src/components/LeftSidebar.jsx << 'EOF'
'use client'
const LB=[{r:1,n:'Sarvatarshan S',d:'CSBS',s:92,e:'🥇'},{r:2,n:'Priya M',d:'CSE',s:88,e:'🥈'},{r:3,n:'Karthik R',d:'ECE',s:81,e:'🥉'},{r:4,n:'Arun K',d:'CSBS',s:74,e:'4️⃣'},{r:5,n:'Divya S',d:'MECH',s:68,e:'5️⃣'}]
function Gauge({score}){
  const r=36,c=2*Math.PI*r,o=c-(score/100)*c
  const col=score>=70?'#4FD1A0':score>=40?'#F5C518':'#FF5C5C'
  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'16px 0'}}>
    <div style={{position:'relative',width:'90px',height:'90px'}}>
      <svg width="90" height="90" style={{transform:'rotate(-90deg)'}}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={col} strokeWidth="8" strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round"/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'22px',color:col}}>{score}</span>
        <span style={{fontSize:'9px',color:'#A0A0A0'}}>/100</span>
      </div>
    </div>
    <span style={{fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'11px',color:'#A0A0A0',marginTop:'8px',letterSpacing:'0.05em'}}>JOB READINESS</span>
  </div>
}
export default function LeftSidebar(){
  return <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
    <div style={{background:'#111111',border:'1px solid rgba(245,197,24,0.1)',borderRadius:'16px',padding:'20px',textAlign:'center'}}>
      <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'linear-gradient(135deg,#F5C518,#C9A000)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'22px',color:'#0A0A0A',boxShadow:'0 0 20px rgba(245,197,24,0.3)'}}>S</div>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'15px',color:'#F5F5F0'}}>Sarvatarshan</div>
      <div style={{fontSize:'12px',color:'#A0A0A0',marginTop:'2px'}}>CSBS • 3rd Year</div>
      <div style={{display:'flex',gap:'6px',justifyContent:'center',marginTop:'10px',flexWrap:'wrap'}}>
        {['Python','ML','React'].map(s=><span key={s} style={{fontSize:'10px',padding:'2px 8px',background:'rgba(245,197,24,0.1)',color:'#F5C518',borderRadius:'20px'}}>{s}</span>)}
      </div>
      <Gauge score={78}/>
      <div style={{display:'flex',justifyContent:'space-around',marginTop:'4px'}}>
        {[['5','Gigs'],['4.8','Rating'],['₹2.4k','Earned']].map(([v,l])=><div key={l} style={{textAlign:'center'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'18px',color:'#F5C518'}}>{v}</div>
          <div style={{fontSize:'10px',color:'#A0A0A0'}}>{l}</div>
        </div>)}
      </div>
    </div>
    <div style={{background:'#111111',border:'1px solid rgba(245,197,24,0.1)',borderRadius:'16px',padding:'16px'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'13px',color:'#F5F5F0',marginBottom:'14px',letterSpacing:'0.05em'}}>🏆 LEADERBOARD</div>
      {LB.map((u,i)=><div key={u.r} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<4?'1px solid rgba(255,255,255,0.04)':'none'}}>
        <span style={{fontSize:'14px',minWidth:'20px'}}>{u.e}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:'12px',fontWeight:600,color:'#F5F5F0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.n}</div>
          <div style={{fontSize:'10px',color:'#A0A0A0'}}>{u.d}</div>
        </div>
        <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'13px',color:u.r===1?'#F5C518':'#A0A0A0'}}>{u.s}</span>
      </div>)}
    </div>
  </div>
}
EOF

cat > src/components/RightSidebar.jsx << 'EOF'
'use client'
const PROVIDERS=[{n:'Priya M',d:'CSE',skills:['React','UI/UX'],r:4.9,g:12},{n:'Karthik R',d:'ECE',skills:['MATLAB','IoT'],r:4.7,g:8},{n:'Arun K',d:'CSBS',skills:['Python','ML'],r:4.6,g:7}]
const SKILLS=[{s:'React',c:14,cat:'Tech'},{s:'Video Edit',c:11,cat:'Creative'},{s:'DSA Help',c:9,cat:'Academic'},{s:'ML Models',c:8,cat:'Tech'},{s:'Figma',c:6,cat:'Creative'}]
const CC={Tech:'#4F8EF7',Creative:'#B57BFF',Academic:'#4FD1A0'}
export default function RightSidebar(){
  return <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
    <div style={{background:'#111111',border:'1px solid rgba(245,197,24,0.1)',borderRadius:'16px',padding:'16px'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'13px',color:'#F5F5F0',marginBottom:'14px',letterSpacing:'0.05em'}}>⚡ TOP PROVIDERS</div>
      {PROVIDERS.map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:i<2?'1px solid rgba(255,255,255,0.04)':'none'}}>
        <div style={{width:'36px',height:'36px',borderRadius:'50%',flexShrink:0,background:`linear-gradient(135deg,${['#F5C518','#4F8EF7','#B57BFF'][i]},${['#C9A000','#2563EB','#7C3AED'][i]})`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',color:'#fff'}}>{p.n[0]}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:'13px',fontWeight:600,color:'#F5F5F0'}}>{p.n}</div>
          <div style={{display:'flex',gap:'4px',marginTop:'3px',flexWrap:'wrap'}}>
            {p.skills.map(s=><span key={s} style={{fontSize:'10px',color:'#A0A0A0',background:'#1A1A1A',padding:'1px 6px',borderRadius:'4px'}}>{s}</span>)}
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:'12px',color:'#F5C518',fontWeight:600}}>★ {p.r}</div>
          <div style={{fontSize:'10px',color:'#A0A0A0'}}>{p.g} gigs</div>
        </div>
      </div>)}
    </div>
    <div style={{background:'#111111',border:'1px solid rgba(245,197,24,0.1)',borderRadius:'16px',padding:'16px'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'13px',color:'#F5F5F0',marginBottom:'14px',letterSpacing:'0.05em'}}>🔥 TRENDING SKILLS</div>
      {SKILLS.map((t,i)=><div key={i} style={{marginBottom:'10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
          <span style={{fontSize:'12px',color:'#F5F5F0'}}>{t.s}</span>
          <span style={{fontSize:'11px',color:CC[t.cat]}}>{t.c} gigs</span>
        </div>
        <div style={{height:'4px',background:'#1A1A1A',borderRadius:'2px',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:'2px',background:CC[t.cat],width:`${(t.c/14)*100}%`}}/>
        </div>
      </div>)}
    </div>
    <div style={{background:'linear-gradient(135deg,rgba(245,197,24,0.15),rgba(245,197,24,0.05))',border:'1px solid rgba(245,197,24,0.25)',borderRadius:'16px',padding:'16px',textAlign:'center'}}>
      <div style={{fontSize:'24px',marginBottom:'8px'}}>🎁</div>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'13px',color:'#F5C518',marginBottom:'6px'}}>INVITE & EARN</div>
      <div style={{fontSize:'12px',color:'#A0A0A0',lineHeight:1.5,marginBottom:'12px'}}>Invite a classmate. Both get +5 Job Readiness points.</div>
      <button style={{background:'#F5C518',color:'#0A0A0A',border:'none',borderRadius:'8px',padding:'8px 20px',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'12px',cursor:'pointer',width:'100%'}}>Share Referral Link</button>
    </div>
  </div>
}
EOF

cat > src/components/PostGigModal.jsx << 'EOF'
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
EOF

echo "ALL COMPONENTS WRITTEN ✓"
