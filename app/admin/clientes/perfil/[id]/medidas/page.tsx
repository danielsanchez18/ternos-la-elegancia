import { notFound } from "next/navigation";
import { getAdminCustomerMeasurements } from "@/lib/admin-customers";
import AdminCustomerMeasurementsView from "@/components/admin/AdminCustomerMeasurementsView";

function parseCustomerId(rawId: string) {
  const parsedId = Number.parseInt(rawId, 10);
  return Number.isNaN(parsedId) ? null : parsedId;
}

export default async function CustomerMeasurementsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseCustomerId(resolvedParams.id);
  
  if (id === null) {
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
