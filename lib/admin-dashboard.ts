export type AdminSubroute = {
  slug: string;
  label: string;
  description: string;
  href: string;
  models: string[];
};

export type AdminSection = {
  slug: string;
  label: string;
  description: string;
  href: string;
  models: string[];
  highlights: string[];
  subroutes: AdminSubroute[];
};

export const adminDashboardSections: AdminSection[] = [
  {
    slug: "clientes",
    label: "Clientes",
    description:
      "Centro operativo de clientes, expedientes, mediciones y seguimiento relacional.",
    href: "/admin/clientes",
    models: [
      "Customer",
      "CustomerNote",
      "CustomerFile",
      "MeasurementProfile",
      "MeasurementProfileGarment",
      "MeasurementValue",
      "Notification",
    ],
    highlights: [
      "Customer es el nodo principal para notas, archivos, medidas, pagos y comprobantes.",
      "Las citas y todos los tipos de orden se originan desde el cliente.",
    ],
    subroutes: [
      {
        slug: "listado",
        label: "Listado",
        description: "Vista de clientes, estado y actividad comercial.",
        href: "/admin/clientes/listado",
        models: ["Customer"],
      },
      {
        slug: "medidas",
        label: "Medidas",
        description:
          "Perfiles de medicion y valores historicos por cliente.",
        href: "/admin/clientes/medidas",
        models: ["MeasurementProfile", "MeasurementProfileGarment", "MeasurementValue"],
      },
      {
        slug: "expedientes",
        label: "Expedientes",
        description: "Archivos y notas internas vinculadas al historial del cliente.",
        href: "/admin/clientes/expedientes",
        models: ["CustomerFile", "CustomerNote"],
      },
      {
        slug: "comunicaciones",
        label: "Comunicaciones",
        description: "Historial de mensajes y notificaciones salientes.",
        href: "/admin/clientes/comunicaciones",
        models: ["Notification"],
      },
    ],
  },
  {
    slug: "citas",
    label: "Citas",
    description:
      "Agenda operativa para reservas, tomas de medidas, entregas y seguimientos.",
    href: "/admin/citas",
    models: ["Appointment", "AppointmentStatusHistory", "BusinessHour", "SpecialSchedule"],
    highlights: [
      "Appointment puede vincularse a venta, orden personalizada, renta o alteracion.",
      "BusinessHour y SpecialSchedule controlan la disponibilidad real del taller o tienda.",
    ],
    subroutes: [
      {
        slug: "agenda",
        label: "Agenda",
        description: "Calendario de citas por tipo, estado y orden relacionada.",
        href: "/admin/citas/agenda",
        models: ["Appointment", "AppointmentStatusHistory"],
      },
      {
        slug: "horarios",
        label: "Horarios",
        description: "Configuracion de horario regular por dia de semana.",
        href: "/admin/citas/horarios",
        models: ["BusinessHour"],
      },
      {
        slug: "fechas-especiales",
        label: "Fechas especiales",
        description: "Excepciones operativas como cierres, feriados u horarios extendidos.",
        href: "/admin/citas/fechas-especiales",
        models: ["SpecialSchedule"],
      },
    ],
  },
  {
    slug: "catalogo",
    label: "Catalogo",
    description:
      "Gestion del surtido vendible y alquilable: productos, bundles, marcas y reglas de configuracion.",
    href: "/admin/catalogo",
    models: [
      "Brand",
      "Product",
      "ProductImage",
      "ProductVariant",
      "CatalogAttributeDefinition",
      "CatalogAttributeOption",
      "ProductAttributeValue",
      "VariantAttributeValue",
      "ProductComponent",
      "Bundle",
      "BundleItem",
      "BundleVariantItem",
      "CustomizationDefinition",
      "CustomizationOption",
    ],
    highlights: [
      "Product concentra imagenes, variantes, atributos, componentes y targets de promociones.",
      "Bundle combina productos o variantes para venta y puede recibir cupones dedicados.",
    ],
    subroutes: [
      {
        slug: "productos",
        label: "Productos",
        description: "ABM de productos, variantes, imagenes y componentes.",
        href: "/admin/catalogo/productos",
        models: ["Product", "ProductImage", "ProductVariant", "ProductComponent"],
      },
      {
        slug: "bundles",
        label: "Bundles",
        description: "Paquetes comerciales compuestos por productos o variantes.",
        href: "/admin/catalogo/bundles",
        models: ["Bundle", "BundleItem", "BundleVariantItem"],
      },
      {
        slug: "atributos",
        label: "Atributos",
        description: "Definiciones y opciones para atributos de catalogo.",
        href: "/admin/catalogo/atributos",
        models: ["CatalogAttributeDefinition", "CatalogAttributeOption"],
      },
      {
        slug: "personalizaciones",
        label: "Personalizaciones",
        description: "Opciones de configuracion aplicables a prendas a medida.",
        href: "/admin/catalogo/personalizaciones",
        models: ["CustomizationDefinition", "CustomizationOption"],
      },
      {
        slug: "marcas",
        label: "Marcas",
        description: "Gestion de marcas y taxonomia comercial del catalogo.",
        href: "/admin/catalogo/marcas",
        models: ["Brand"],
      },
    ],
  },
  {
    slug: "inventario",
    label: "Inventario",
    description:
      "Control de stock, unidades de alquiler, telas y movimientos de inventario.",
    href: "/admin/inventario",
    models: [
      "ProductVariant",
      "ProductStockMovement",
      "RentalUnit",
      "RentalUnitMovement",
      "Fabric",
      "FabricMovement",
    ],
    highlights: [
      "Las variantes manejan stock vendible y las rental units gestionan piezas individualizadas de alquiler.",
      "Fabric abastece partes de ordenes personalizadas y lleva su propio kardex.",
    ],
    subroutes: [
      {
        slug: "stock",
        label: "Stock",
        description: "Disponibilidad por variante y movimientos de inventario.",
        href: "/admin/inventario/stock",
        models: ["ProductVariant", "ProductStockMovement"],
      },
      {
        slug: "unidades-renta",
        label: "Unidades de renta",
        description: "Piezas fisicas, estado operativo y trazabilidad de alquiler.",
        href: "/admin/inventario/unidades-renta",
        models: ["RentalUnit", "RentalUnitMovement"],
      },
      {
        slug: "telas",
        label: "Telas",
        description: "Materiales, costo, stock en metros y proveedores.",
        href: "/admin/inventario/telas",
        models: ["Fabric", "FabricMovement"],
      },
      {
        slug: "movimientos",
        label: "Movimientos",
        description: "Bitacora consolidada de entradas, salidas y ajustes.",
        href: "/admin/inventario/movimientos",
        models: ["ProductStockMovement", "RentalUnitMovement", "FabricMovement"],
      },
    ],
  },
  {
    slug: "ordenes",
    label: "Ordenes",
    description:
      "Operacion comercial segmentada por tipo: venta, confeccion, alquiler y alteraciones.",
    href: "/admin/ordenes",
    models: [
      "SaleOrder",
      "SaleOrderItem",
      "SaleOrderItemComponent",
      "CustomOrder",
      "CustomOrderItem",
      "CustomOrderItemPart",
      "CustomOrderItemPartSelection",
      "RentalOrder",
      "RentalOrderItem",
      "AlterationOrder",
      "AlterationService",
    ],
    highlights: [
      "Los cuatro tipos de orden convergen en pagos, comprobantes, cupones y citas.",
      "CustomOrder añade partes, telas y medidas; RentalOrder depende de RentalUnit; AlterationOrder depende de AlterationService.",
    ],
    subroutes: [
      {
        slug: "venta",
        label: "Ventas",
        description: "Pedidos de venta de productos y bundles.",
        href: "/admin/ordenes/venta",
        models: ["SaleOrder", "SaleOrderItem", "SaleOrderItemComponent"],
      },
      {
        slug: "personalizadas",
        label: "Personalizadas",
        description: "Ordenes a medida con partes, telas y selecciones de customizacion.",
        href: "/admin/ordenes/personalizadas",
        models: ["CustomOrder", "CustomOrderItem", "CustomOrderItemPart"],
      },
      {
        slug: "rentas",
        label: "Rentas",
        description: "Reservas y retornos ligados a unidades de alquiler.",
        href: "/admin/ordenes/rentas",
        models: ["RentalOrder", "RentalOrderItem", "RentalUnit"],
      },
      {
        slug: "alteraciones",
        label: "Alteraciones",
        description: "Trabajos de ajuste, compostura y entrega.",
        href: "/admin/ordenes/alteraciones",
        models: ["AlterationOrder"],
      },
      {
        slug: "servicios",
        label: "Servicios",
        description: "Catalogo de servicios base para alteraciones.",
        href: "/admin/ordenes/servicios",
        models: ["AlterationService"],
      },
    ],
  },
  {
    slug: "comercial",
    label: "Comercial",
    description:
      "Promociones, cupones, cobros y comprobantes que cruzan todo el funnel.",
    href: "/admin/comercial",
    models: [
      "Promotion",
      "PromotionProductTarget",
      "Coupon",
      "OrderCouponUse",
      "Payment",
      "Comprobante",
    ],
    highlights: [
      "Promotion se orienta a productos y Coupon puede apuntar a promociones o bundles.",
      "Payment y Comprobante pueden asociarse a cualquiera de los cuatro tipos de orden.",
    ],
    subroutes: [
      {
        slug: "promociones",
        label: "Promociones",
        description: "Campanas, ventanas de vigencia y targets de producto.",
        href: "/admin/comercial/promociones",
        models: ["Promotion", "PromotionProductTarget"],
      },
      {
        slug: "cupones",
        label: "Cupones",
        description: "Codigos promocionales, limites y seguimiento de uso.",
        href: "/admin/comercial/cupones",
        models: ["Coupon", "OrderCouponUse"],
      },
      {
        slug: "pagos",
        label: "Pagos",
        description: "Cobros por metodo, estado y orden vinculada.",
        href: "/admin/comercial/pagos",
        models: ["Payment"],
      },
      {
        slug: "comprobantes",
        label: "Comprobantes",
        description: "Documentos fiscales o internos emitidos desde las ordenes.",
        href: "/admin/comercial/comprobantes",
        models: ["Comprobante"],
      },
    ],
  },
  {
    slug: "notificaciones",
    label: "Notificaciones",
    description:
      "Seguimiento de envios, recordatorios y estado de las comunicaciones al cliente.",
    href: "/admin/notificaciones",
    models: ["Notification", "Appointment"],
    highlights: [
      "Notification guarda canal, estado, asunto, mensaje y relatedCode.",
      "Las citas ya contemplan el reminder de 24 horas como parte del flujo interno.",
    ],
    subroutes: [
      {
        slug: "bandeja",
        label: "Bandeja",
        description: "Historial de mensajes emitidos y su estado de entrega.",
        href: "/admin/notificaciones/bandeja",
        models: ["Notification"],
      },
      {
        slug: "recordatorios",
        label: "Recordatorios",
        description: "Operativa de recordatorios de cita y seguimiento.",
        href: "/admin/notificaciones/recordatorios",
        models: ["Notification", "Appointment"],
      },
    ],
  },
  {
    slug: "reportes",
    label: "Reportes",
    description:
      "Lectura ejecutiva de ventas, operacion, alquileres, alteraciones y cobranza.",
    href: "/admin/reportes",
    models: ["SaleOrder", "CustomOrder", "RentalOrder", "AlterationOrder", "Payment"],
    highlights: [
      "El modulo reports ya existe en backend y deberia consolidar KPI transversales.",
      "Es la mejor capa para comparar tipo de orden, ticket medio, mora y eficiencia.",
    ],
    subroutes: [
      {
        slug: "resumen",
        label: "Resumen",
        description: "KPIs diarios, semanales y mensuales para la operacion completa.",
        href: "/admin/reportes/resumen",
        models: ["SaleOrder", "CustomOrder", "RentalOrder", "AlterationOrder", "Payment"],
      },
      {
        slug: "ventas",
        label: "Ventas",
        description: "Desempeno comercial por producto, bundle y canal de cobro.",
        href: "/admin/reportes/ventas",
        models: ["SaleOrder", "Payment", "Coupon"],
      },
      {
        slug: "operacion",
        label: "Operacion",
        description: "Carga de trabajo, tiempos de entrega y salud del inventario.",
        href: "/admin/reportes/operacion",
        models: ["Appointment", "RentalUnit", "Fabric", "AlterationOrder"],
      },
    ],
  },
  {
    slug: "configuracion",
    label: "Configuracion",
    description:
      "Usuarios internos, parametros operativos y reglas base del panel.",
    href: "/admin/configuracion",
    models: ["AdminUser", "User", "BusinessHour", "SpecialSchedule"],
    highlights: [
      "AdminUser registra trazabilidad sobre cambios de estado y notas internas.",
      "User centraliza el acceso con Better Auth y define el inicio de sesion real.",
    ],
    subroutes: [
      {
        slug: "usuarios",
        label: "Usuarios",
        description: "Gestion de accesos internos y cuentas con privilegios.",
        href: "/admin/configuracion/usuarios",
        models: ["AdminUser", "User"],
      },
      {
        slug: "disponibilidad",
        label: "Disponibilidad",
        description: "Parametros base de agenda y operacion.",
        href: "/admin/configuracion/disponibilidad",
        models: ["BusinessHour", "SpecialSchedule"],
      },
      {
        slug: "sistema",
        label: "Sistema",
        description: "Variables tecnicas, integraciones y estado de infraestructura.",
        href: "/admin/configuracion/sistema",
        models: ["User"],
      },
    ],
  },
];

export const adminSidebarItems = [
  { label: "Dashboard", href: "/admin", slug: "dashboard" },
  ...adminDashboardSections.map((section) => ({
    label: section.label,
    href: section.href,
    slug: section.slug,
  })),
];

export function getAdminSection(slug: string) {
  return adminDashboardSections.find((section) => section.slug === slug);
}

export function getAdminSubroute(sectionSlug: string, subrouteSlug: string) {
  return getAdminSection(sectionSlug)?.subroutes.find(
    (subroute) => subroute.slug === subrouteSlug
  );
}

export function getAdminSectionByPath(pathname: string) {
  return adminDashboardSections.find((section) =>
    pathname.startsWith(section.href)
  );
}

export function getAdminSubrouteByPath(pathname: string) {
  const currentSection = getAdminSectionByPath(pathname);
  if (!currentSection) {
    return undefined;
  }

  return currentSection.subroutes.find((subroute) =>
    pathname.startsWith(subroute.href)
  );
}
