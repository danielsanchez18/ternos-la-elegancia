import {
  getAdminSectionByPath,
  getAdminSubrouteByPath,
} from "@/lib/admin-dashboard";

export type AdminPageContext = {
  eyebrow: string;
  title: string;
  description: string;
};

const DASHBOARD_PAGE_CONTEXT: AdminPageContext = {
  eyebrow: "Centro de control",
  title: "Dashboard",
  description:
    "Vista transversal del negocio, sus modulos y las relaciones de operacion.",
};

const FALLBACK_PAGE_CONTEXT: AdminPageContext = {
  eyebrow: "Panel administrativo",
  title: "Modulo",
  description: "Explora las herramientas internas del sistema.",
};

export function getAdminPageContext(pathname: string): AdminPageContext {
  if (pathname === "/admin") {
    return DASHBOARD_PAGE_CONTEXT;
  }

  const currentSection = getAdminSectionByPath(pathname);
  if (!currentSection) {
    return FALLBACK_PAGE_CONTEXT;
  }

  const currentSubroute = getAdminSubrouteByPath(pathname);
  if (!currentSubroute) {
    return {
      eyebrow: "Modulo",
      title: currentSection.label,
      description: currentSection.description,
    };
  }

  return {
    eyebrow: currentSection.label,
    title: currentSubroute.label,
    description: currentSubroute.description,
  };
}
