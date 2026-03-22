import { notFound } from "next/navigation";
import { getAdminCustomerMeasurements } from "@/lib/admin-customers";
import AdminCustomerMeasurementsView from "@/components/admin/AdminCustomerMeasurementsView";

export default async function CustomerMeasurementsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const { customerName, profiles } = await getAdminCustomerMeasurements(id);

  if (!customerName) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AdminCustomerMeasurementsView 
        customerId={id} 
        customerName={customerName} 
        profiles={profiles} 
      />
    </div>
  );
}
