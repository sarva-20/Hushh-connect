//GigCard.jsx
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
