import { AdminConfigurationSection, AdminConfigurationSubroute } from "@/components/admin/AdminConfigurationModule";
import { AdminCustomersSection, AdminCustomersSubroute } from "@/components/admin/AdminCustomersModule";
import { AdminAppointmentsSection, AdminAppointmentsSubroute } from "@/components/admin/AdminAppointmentsModule";
import { AdminCatalogSection, AdminCatalogSubroute } from "@/components/admin/AdminCatalogModule";
import { AdminInventorySection, AdminInventorySubroute } from "@/components/admin/AdminInventoryModule";
import { AdminOrdersSection, AdminOrdersSubroute } from "@/components/admin/AdminOrdersModule";

export function renderAdminSectionRoute(section: string) {
  if (section === "clientes") {
    return <AdminCustomersSection />;
  }
  if (section === "citas") {
    return <AdminAppointmentsSection />;
  }
  if (section === "catalogo") {
    return <AdminCatalogSection />;
  }
  if (section === "configuracion") {
    return <AdminConfigurationSection />;
  }
  if (section === "inventario") {
    return <AdminInventorySection />;
  }
  if (section === "ordenes") {
    return <AdminOrdersSection />;
  }

  return null;
}

export function renderAdminSubrouteRoute(section: string, subroute: string) {
  if (section === "clientes") {
    return <AdminCustomersSubroute subroute={subroute} />;
  }
  if (section === "citas") {
    return <AdminAppointmentsSubroute subroute={subroute} />;
  }
  if (section === "catalogo") {
    return <AdminCatalogSubroute subroute={subroute} />;
  }
  if (section === "configuracion") {
    return <AdminConfigurationSubroute subroute={subroute} />;
  }
  if (section === "inventario") {
    return <AdminInventorySubroute subroute={subroute} />;
  }
  if (section === "ordenes") {
    return <AdminOrdersSubroute subroute={subroute} />;
  }

  return null;
}
