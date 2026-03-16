import {
  MinimumReportsFilters,
  MinimumReportsResult,
  ReportsDateRange,
} from "@/src/modules/reports/domain/report.types";
import { ReportValidationError } from "@/src/modules/reports/domain/report.errors";
import { ReportRepository } from "@/src/modules/reports/infrastructure/report.repository";

const DEFAULT_DAYS_WINDOW = 30;
const DEFAULT_TOP_RENTED_LIMIT = 10;
const DEFAULT_RECURRENT_MIN_ORDERS = 2;
const DEFAULT_STOCK_LIMIT = 50;

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getMinimumReports(filters: MinimumReportsFilters): Promise<MinimumReportsResult> {
    const range = this.resolveRange(filters.from, filters.to);
    const topRentedLimit = filters.topRentedLimit ?? DEFAULT_TOP_RENTED_LIMIT;
    const recurrentMinOrders =
      filters.recurrentMinOrders ?? DEFAULT_RECURRENT_MIN_ORDERS;
    const stockLimit = filters.stockLimit ?? DEFAULT_STOCK_LIMIT;

    const [
      salesByPeriod,
      activeRentals,
      topRentedProducts,
      recurrentCustomers,
      measurementReservations,
      lowStock,
      newCustomersMeasurementRisk,
    ] = await Promise.all([
      this.reportRepository.getSalesByPeriod(range),
      this.reportRepository.getActiveRentalsSnapshot(),
      this.reportRepository.getTopRentedProducts(topRentedLimit),
      this.reportRepository.getRecurrentCustomers(recurrentMinOrders),
      this.reportRepository.getMeasurementReservations(range),
      this.reportRepository.getLowStockVariants(stockLimit),
      this.reportRepository.getNewCustomersMeasurementRisk(range, new Date()),
    ]);

    return {
      generatedAt: new Date(),
      salesByPeriod,
      activeRentals,
      topRentedProducts,
      recurrentCustomers,
      measurementReservations,
      lowStock,
      newCustomersMeasurementRisk,
    };
  }

  private resolveRange(from?: Date, to?: Date): ReportsDateRange {
    if (from && to && from > to) {
      throw new ReportValidationError("from must be less than or equal to to");
    }

    if (from && to) {
      return { from, to };
    }

    if (from && !to) {
      return { from, to: new Date() };
    }

    if (!from && to) {
      return {
        from: new Date(to.getTime() - DEFAULT_DAYS_WINDOW * 24 * 60 * 60 * 1000),
        to,
      };
    }

    const now = new Date();
    return {
      from: new Date(now.getTime() - DEFAULT_DAYS_WINDOW * 24 * 60 * 60 * 1000),
      to: now,
    };
  }
}

export const reportService = new ReportService(new ReportRepository());
