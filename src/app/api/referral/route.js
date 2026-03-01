import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req) {
  try {
    await connectDB()
    const { referralCode, newUserId } = await req.json()
    const referrer = await User.findOne({ referralCode })
    if (!referrer) return Response.json({ error: 'Invalid code' }, { status: 404 })
    await User.findByIdAndUpdate(newUserId, { referredBy: referralCode })
    referrer.referralCount += 1
    referrer.jobReadinessScore = Math.min(referrer.jobReadinessScore + 2, 100)
    await referrer.save()
    return Response.json({ success: true, referrerName: referrer.name })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
