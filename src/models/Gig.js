import mongoose from 'mongoose'

const GigSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skillTags: { type: [String], default: [] },
  category: { type: String, enum: ['Tech', 'Creative', 'Academic'], required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['fixed', 'negotiable'], default: 'fixed' },
  deadline: { type: Date },
  visibility: { type: String, enum: ['all', 'department', 'year'], default: 'all' },
  status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isAlumniEligible: { type: Boolean, default: false },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema)
