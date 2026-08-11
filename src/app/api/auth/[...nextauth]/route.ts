import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerServiceClient } from "@/lib/supabase";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true;
      try {
        const supabase = createServerServiceClient();

        // 1. Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, organization_id")
          .eq("email", user.email)
          .maybeSingle();

        if (!existingUser) {
          // Create default workspace / organization
          const orgName = `${user.name || "User"}'s Workspace`;
          const { data: newOrg } = await supabase
            .from("organizations")
            .insert({
              name: orgName,
              slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              ai_settings: { tone: "professional" }
            })
            .select()
            .single();

          // Create user record linked to organization
          await supabase
            .from("users")
            .insert({
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              organization_id: newOrg?.id || null,
            });
        }
      } catch (err) {
        console.error("Error provisioning user workspace:", err);
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, always redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
