import { getConversations } from "@/actions/inbox";
import { InboxClient } from "@/components/inbox-client";

export default async function InboxPage() {
  const conversations = await getConversations();
  return <InboxClient initialConversations={conversations} />;
}
