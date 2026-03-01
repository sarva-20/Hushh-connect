'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import GigCard from '@/components/GigCard'
import LeftSidebar from '@/components/LeftSidebar'
import RightSidebar from '@/components/RightSidebar'
import PostGigModal from '@/components/PostGigModal'

const MOCK_GIGS = [
  { _id: '1', title: 'Need DSA mentor for placement prep', description: 'Looking for someone to help me crack DSA in 2 weeks. Need daily 1-hour sessions covering arrays, trees, and graphs.', category: 'Tech', price: 500, priceType: 'negotiable', skillTags: ['DSA', 'Java', 'LeetCode'], status: 'open', deadline: new Date(Date.now() + 3 * 86400000).toISOString(), postedBy: { name: 'Arun K', rating: 4.5 } },
  { _id: '2', title: 'Logo + social media kit design', description: 'Need a complete brand kit for our college club — logo, Instagram post templates, and WhatsApp stickers.', category: 'Creative', price: 800, priceType: 'fixed', skillTags: ['Figma', 'Illustrator', 'Branding'], status: 'open', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), postedBy: { name: 'Priya M', rating: 4.9 } },
  { _id: '3', title: 'React project code review', description: 'My final year project has bugs I cannot fix. Need an experienced React dev to review within 24 hours.', category: 'Tech', price: 400, priceType: 'fixed', skillTags: ['React', 'JavaScript'], status: 'in_progress', deadline: new Date(Date.now() + 1 * 86400000).toISOString(), postedBy: { name: 'Karthik R', rating: 4.2 } },
  { _id: '4', title: 'DBMS exam prep partner', description: 'Semester exams in 4 days. Looking for someone strong in DBMS for a study session.', category: 'Academic', price: 200, priceType: 'negotiable', skillTags: ['DBMS', 'SQL'], status: 'open', deadline: new Date(Date.now() + 4 * 86400000).toISOString(), postedBy: { name: 'Divya S', rating: 4.7 } },
  { _id: '5', title: 'Video editing for hackathon demo', description: 'Need a 2-min project demo video edited professionally. Have raw footage, need cuts and transitions.', category: 'Creative', price: 600, priceType: 'fixed', skillTags: ['Premiere Pro', 'Video'], status: 'open', deadline: new Date(Date.now() + 2 * 86400000).toISOString(), postedBy: { name: 'Rahul T', rating: 4.3 } },
]

const FILTERS = ['All', 'Tech', 'Creative', 'Academic', 'Open']

function Doodle({ type, style }) {
  const d = {
    star: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="#F5C518" strokeWidth="1.5" fill="none" opacity="0.6"/></svg>,
    lightning: <svg width="20" height="28" viewBox="0 0 20 28" fill="none"><path d="M12 2L2 16h8l-2 10 10-14h-8l2-10z" stroke="#F5C518" strokeWidth="1.5" fill="none" opacity="0.5"/></svg>,
    circle: <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="16" stroke="#F5C518" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3"/></svg>,
  }
  return <div style={{ position: 'absolute', pointerEvents: 'none', ...style }}>{d[type]}</div>
}

export default function Home() {
  const [gigs, setGigs] = useState(MOCK_GIGS)
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [signups] = useState(24)

  const filtered = gigs.filter(g => {
    if (filter === 'All') return true
    if (filter === 'Open') return g.status === 'open'
    return g.category === filter
  })

  function handlePostGig(form) {
    setGigs(g => [{ ...form, _id: Date.now().toString(), status: 'open', postedBy: { name: 'Sarvatarshan S', rating: 4.8 } }, ...g])
    setShowModal(false)
  }

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar onPostGig={() => setShowModal(true)} />

      <div style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, transparent 60%)', borderBottom: '1px solid rgba(245,197,24,0.08)', padding: '90px 24px 32px', position: 'relative', overflow: 'hidden' }}>
        <Doodle type="star" style={{ top: '20px', right: '10%' }} />
        <Doodle type="lightning" style={{ top: '30px', right: '20%' }} />
        <Doodle type="star" style={{ top: '60px', left: '5%' }} />
        <Doodle type="circle" style={{ top: '10px', left: '30%' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
            {[{ label: 'Students', val: signups }, { label: 'Gigs Live', val: gigs.length }].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F5C518', display: 'inline-block' }} />
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F5C518' }}>{m.val}</span>
                <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{m.label}</span>
              </div>
            ))}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', color: '#F5F5F0', lineHeight: 1.1, marginBottom: '12px' }}>
            Got a skill?<br /><span style={{ color: '#F5C518' }}>Get paid.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#A0A0A0', maxWidth: '480px', lineHeight: 1.6, marginBottom: '20px' }}>
            KPRIET's peer gig marketplace. Post what you need, find who can help — verified with college email.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowModal(true)} style={{ background: '#F5C518', color: '#0A0A0A', border: 'none', borderRadius: '12px', padding: '12px 24px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Post a Gig →</button>
            <button style={{ background: 'transparent', color: '#F5F5F0', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '12px', padding: '12px 24px', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>Browse Skills</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 220px', gap: '24px' }}>
        <LeftSidebar />
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', border: `1px solid ${filter === f ? '#F5C518' : 'rgba(255,255,255,0.08)'}`, background: filter === f ? 'rgba(245,197,24,0.12)' : 'transparent', color: filter === f ? '#F5C518' : '#A0A0A0', transition: 'all 0.2s' }}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((gig, i) => <GigCard key={gig._id} gig={gig} index={i} />)}
          </div>
        </div>
        <RightSidebar />
      </div>

      <button onClick={() => setShowModal(true)} style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: '#F5C518', color: '#0A0A0A', border: 'none', fontSize: '26px', cursor: 'pointer', zIndex: 100, boxShadow: '0 4px 24px rgba(245,197,24,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>

      {showModal && <PostGigModal onClose={() => setShowModal(false)} onSubmit={handlePostGig} />}
    </div>
  )
}
