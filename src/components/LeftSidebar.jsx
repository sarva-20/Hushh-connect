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
