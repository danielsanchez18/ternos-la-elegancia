export type DashboardHeroCardIcon = "customers" | "orders" | "revenue" | "agenda";

export type DashboardHeroCard = {
  title: string;
  value: string;
  detail: string;
  href: string;
  icon: DashboardHeroCardIcon;
};

export type DashboardFocusMetric = {
  title: string;
  value: string | number;
  detail: string;
};

export type DashboardOrderPipelineItem = {
  label: string;
  value: number;
  href: string;
};

export type DashboardAlertCard = {
  title: string;
  value: string | number;
  detail: string;
  href: string;
};

export type DashboardRecentAppointment = {
  id: number;
  customerName: string;
  typeLabel: string;
  code: string;
  scheduledAtLabel: string;
  statusLabel: string;
};

export type DashboardRecentPayment = {
  id: number;
  customerName: string;
  methodLabel: string;
  paidAtLabel: string;
  amountLabel: string;
  statusLabel: string;
};

export type DashboardExecutiveSummary = {
  operational: string;
  liquidity: string;
  serviceHealth: string;
};

export type AdminDashboardViewModel = {
  heroCards: DashboardHeroCard[];
  focusMetrics: DashboardFocusMetric[];
  orderPipeline: DashboardOrderPipelineItem[];
  totalOpenOrders: number;
  alertCards: DashboardAlertCard[];
  recentAppointments: DashboardRecentAppointment[];
  recentPayments: DashboardRecentPayment[];
  executiveSummary: DashboardExecutiveSummary;
};
