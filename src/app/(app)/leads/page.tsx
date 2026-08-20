import { getLeads } from "@/actions/leads";
import { PipelineBoard } from "@/components/pipeline-board";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();

  return <PipelineBoard initialLeads={leads} />;
}
