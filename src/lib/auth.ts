import { currentUser, auth } from "@clerk/nextjs/server";
import { getUserContext } from "./rbac";

/**
 * Server-side helper to get authenticated user session.
 */
export async function getAuthSession() {
  const user = await currentUser();
  if (!user || !user.emailAddresses?.[0]?.emailAddress) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const email = user.emailAddresses[0].emailAddress;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || email;

  return {
    userId: user.id,
    email,
    name,
    imageUrl: user.imageUrl,
  };
}

export { getUserContext };
