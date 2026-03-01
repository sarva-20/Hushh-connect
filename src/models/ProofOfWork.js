import mongoose from 'mongoose'

const ProofOfWorkSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillUsed: { type: String, required: true },
  gigTitle: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.models.ProofOfWork || mongoose.model('ProofOfWork', ProofOfWorkSchema)
