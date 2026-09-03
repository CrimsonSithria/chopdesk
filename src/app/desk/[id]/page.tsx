import { AppShell } from "@/components/app-shell";
import { CaseView } from "@/components/case-view";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <CaseView id={id} />
    </AppShell>
  );
}
