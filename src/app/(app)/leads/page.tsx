import { getLeads } from "@/actions/leads";
import { PipelineBoard } from "@/components/pipeline-board";

export default async function LeadsPage() {
  const leads = await getLeads();

  return <PipelineBoard initialLeads={leads} />;
}
