import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: Number, default: 1 },
  isAlumni: { type: Boolean, default: false },
  skills: { type: [String], default: [] },
  description: { type: String, default: '' },
  jobReadinessScore: { type: Number, default: 0 },
  totalGigsCompleted: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: '' },
  referralCount: { type: Number, default: 0 },
  onboardingComplete: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
