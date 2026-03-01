import { connectDB } from '@/lib/mongodb'
import Gig from '@/models/Gig'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    await connectDB()
    const gigs = await Gig.find().populate('postedBy', 'name photo rating department').sort({ createdAt: -1 })
    return Response.json(gigs)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const gig = await Gig.create({ ...body, postedBy: session.user.id, status: 'open', isAlumniEligible: false })
    const populated = await gig.populate('postedBy', 'name photo rating department')
    return Response.json(populated, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
