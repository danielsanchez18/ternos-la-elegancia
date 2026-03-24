import { notFound } from "next/navigation";
import { getAdminCustomerMeasurements } from "@/lib/admin-customers";
import AdminCustomerMeasurementsView from "@/components/admin/AdminCustomerMeasurementsView";

export default async function CustomerMeasurementsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { customerId, customerName, profiles } = await getAdminCustomerMeasurements(
    resolvedParams.id
  );

  if (!customerName || !customerId) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AdminCustomerMeasurementsView 
        customerId={customerId as unknown as number} 
        customerName={customerName} 
        profiles={profiles} 
      />
    </div>
  );
}
