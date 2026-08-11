import { getServerSession } from "next-auth";

/**
 * Helper to get the current user's session in server actions.
 * Returns { userId, email, name } or throws if unauthenticated.
 */
export async function getAuthSession() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    userId: (session.user as any).id || session.user.email,
    email: session.user.email,
    name: session.user.name,
  };
}
