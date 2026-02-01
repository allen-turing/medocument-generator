import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Check if approval is required and user is approved
        if (!user.isApproved) {
          // We can check SystemSettings here if we want to be strict, but storing the state on user is enough.
          // If feature flag is on, user.isApproved would be false initially.
          // If feature flag is off, user.isApproved would be true initially.
          // So just checking user.isApproved covers both cases (validation at registration time).

          // However, if we Toggled the flag ON later, existing users might be approved.
          // But if we toggle OFF, we might want to allow even unapproved users? 
          // The prompt said: "when toogle is on then all the user who sign up they have to wait"
          // It implies the check is: "If (FeatureEnabled AND !UserApproved) -> Block".

          // Let's first fetch the feature flag.
          // We need to fetch it dynamically.
          const settings = await prisma.systemSettings.findUnique({
            where: { key: 'require_approval' }
          });

          const requireApproval = settings?.value === 'true';

          if (requireApproval && user.isApproved === false) {
            throw new Error("Your account is pending approval. Please contact the administrator.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
