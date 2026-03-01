'use client'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function SignIn() {
  const params = useSearchParams()
  const error = params.get('error')

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#111111', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ width: '56px', height: '56px', background: '#F5C518', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '22px', color: '#0A0A0A' }}>HC</div>

        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '28px', color: '#F5F5F0', marginBottom: '8px' }}>
          Hushh<span style={{ color: '#F5C518' }}>Connect</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#A0A0A0', lineHeight: 1.6, marginBottom: '32px' }}>
          KPRIET's peer gig marketplace.<br />Sign in with your college email to continue.
        </p>

        {error === 'NotKPRIET' && (
          <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#FF5C5C' }}>
            ⚠️ Only @kpriet.ac.in emails are allowed.
          </div>
        )}

        {error && error !== 'NotKPRIET' && (
          <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#FF5C5C' }}>
            Something went wrong. Try again.
          </div>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
          style={{ width: '100%', padding: '14px', background: '#F5C518', color: '#0A0A0A', border: 'none', borderRadius: '12px', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#0A0A0A" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#0A0A0A" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#0A0A0A" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#0A0A0A" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>

        <p style={{ fontSize: '11px', color: '#A0A0A0', marginTop: '20px', lineHeight: 1.6 }}>
          Only @kpriet.ac.in email addresses are accepted.<br />
          Your data stays within KPRIET.
        </p>
      </div>
    </div>
  )
}
