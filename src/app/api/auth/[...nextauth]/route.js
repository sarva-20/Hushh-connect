import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { nanoid } from 'nanoid'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // ONLY allow KPRIET email
      if (!user.email.endsWith('@kpriet.ac.in')) {
        return '/signin?error=NotKPRIET'
      }

      await connectDB()

      // Create user if first time
      const existing = await User.findOne({ email: user.email })
      if (!existing) {
        await User.create({
          name: user.name,
          email: user.email,
          photo: user.image || '',
          referralCode: nanoid(8),
        })
      }
      return true
    },

    async session({ session }) {
      await connectDB()
      const dbUser = await User.findOne({ email: session.user.email })
      if (dbUser) {
        session.user.id = dbUser._id.toString()
        session.user.onboardingComplete = dbUser.onboardingComplete
        session.user.department = dbUser.department
        session.user.jobReadinessScore = dbUser.jobReadinessScore
        session.user.referralCode = dbUser.referralCode
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
