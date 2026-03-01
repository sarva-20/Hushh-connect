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
