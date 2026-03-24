import {
  getAdminConfigurationAvailabilityData,
  getAdminConfigurationOverviewData,
  getAdminConfigurationSystemData,
  getAdminConfigurationUsersData,
} from "@/lib/admin-configuration";
import {
  ConfigurationAvailabilitySubrouteView,
  ConfigurationSectionView,
  ConfigurationSystemSubrouteView,
  ConfigurationUsersSubrouteView,
} from "@/components/admin/configuration/AdminConfigurationViews";

export async function AdminConfigurationSection() {
  const data = await getAdminConfigurationOverviewData();
  return <ConfigurationSectionView data={data} />;
}

export async function AdminConfigurationSubroute({
  subroute,
}: {
  subroute: string;
}) {
  if (subroute === "usuarios") {
    const data = await getAdminConfigurationUsersData();
    return <ConfigurationUsersSubrouteView data={data} />;
  }

  if (subroute === "disponibilidad") {
    const data = await getAdminConfigurationAvailabilityData();
    return <ConfigurationAvailabilitySubrouteView data={data} />;
  }

  if (subroute === "sistema") {
    const data = await getAdminConfigurationSystemData();
    return <ConfigurationSystemSubrouteView data={data} />;
  }

  return null;
}
