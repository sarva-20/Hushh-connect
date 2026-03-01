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
