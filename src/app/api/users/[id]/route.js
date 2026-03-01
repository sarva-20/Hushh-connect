import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, { params }) {
  try {
    await connectDB()
    const user = await User.findById(params.id).select('-__v')
    if (!user) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(user)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.id !== params.id) return Response.json({ error: 'Forbidden' }, { status: 403 })
    await connectDB()
    const body = await req.json()
    delete body.email
    delete body.name
    if (body.department && body.skills) {
      body.onboardingComplete = true
      body.jobReadinessScore = Math.min(body.skills.length * 5, 30)
    }
    const updated = await User.findByIdAndUpdate(params.id, body, { new: true })
    return Response.json(updated)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
