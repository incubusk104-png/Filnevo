import { VaultDashboard } from "@/components/vault/VaultDashboard";
import { getVaultData } from "@/lib/vault-queries";

export default async function Home() {
  const data = await getVaultData();
  return (
    <VaultDashboard
      metrics={data.metrics}
      ledger={data.ledger}
      tenant={data.tenant}
      quota={data.quota}
      tenantId={data.tenantId}
      email={data.email}
      live={data.live}
    />
  );
}
