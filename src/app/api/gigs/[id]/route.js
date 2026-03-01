import { connectDB } from '@/lib/mongodb'
import Gig from '@/models/Gig'
import User from '@/models/User'
import ProofOfWork from '@/models/ProofOfWork'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, { params }) {
  try {
    await connectDB()
    const gig = await Gig.findById(params.id).populate('postedBy', 'name photo rating department skills').populate('assignedTo', 'name photo rating')
    if (!gig) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(gig)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const body = await req.json()
    const gig = await Gig.findById(params.id)
    if (!gig) return Response.json({ error: 'Not found' }, { status: 404 })
    if (body.status === 'completed' && gig.status !== 'completed') {
      gig.status = 'completed'
      await gig.save()
      if (body.rating && gig.assignedTo) {
        await ProofOfWork.create({ gigId: gig._id, provider: gig.assignedTo, requester: gig.postedBy, skillUsed: gig.skillTags?.[0] || gig.category, gigTitle: gig.title, rating: body.rating, review: body.review || '' })
        const provider = await User.findById(gig.assignedTo)
        if (provider) {
          provider.totalGigsCompleted += 1
          provider.totalEarnings += gig.price
          const newCount = provider.ratingCount + 1
          provider.rating = ((provider.rating * provider.ratingCount) + body.rating) / newCount
          provider.ratingCount = newCount
          provider.jobReadinessScore = Math.min(Math.round((provider.totalGigsCompleted * 20) + ((provider.rating/5)*30) + (provider.skills.length*3) + (provider.referralCount*2)), 100)
          await provider.save()
        }
      }
      return Response.json(gig)
    }
    if (body.action === 'apply') {
      if (!gig.applicants.includes(session.user.id)) { gig.applicants.push(session.user.id); await gig.save() }
      return Response.json(gig)
    }
    Object.assign(gig, body)
    await gig.save()
    return Response.json(gig)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
