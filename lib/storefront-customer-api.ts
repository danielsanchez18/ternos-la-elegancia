/* ------------------------------------------------------------------ */
/*  Storefront Customer API                                            */
/*  Client-side fetch helpers for the logged-in customer portal.       */
/* ------------------------------------------------------------------ */

export type CustomerOrder = {
  id: string;
  code: string;
  status: string;
  total: string | number;
  createdAt: string;
  items: Array<{
    id: string;
    garmentLabel: string;
  }>;
};

export type CustomerOrderListResponse = {
  items: CustomerOrder[];
  total: number;
};

export type CustomerRentalOrder = {
  id: string;
  code: string;
  status: string;
  total: string | number;
  pickupAt: string;
  dueBackAt: string;
  returnedAt: string | null;
  items: Array<{
    id: string;
    itemNameSnapshot: string;
    tierAtRental: string;
    unitPrice: string | number;
  }>;
};

export type CustomerRentalOrderListResponse = {
  items: CustomerRentalOrder[];
};

export type CustomerAppointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes: string | null;
};

export type CustomerMeasurementProfile = {
  id: string;
  isActive: boolean;
  createdAt: string;
  takenAt: string;
  garments: Array<{
    id: string;
    garmentType: string;
  }>;
};

export type CustomerMeasurementValue = {
  fieldId: string;
  fieldLabel: string;
  valueNumber: string | number | null;
  valueText: string | null;
  unit: string | null;
};

export type CustomerMeasurementGarmentValues = {
  garmentType: string;
  values: CustomerMeasurementValue[];
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getMyCustomOrders(
  customerId: string
): Promise<CustomerOrder[]> {
  const result = await getJson<CustomerOrderListResponse>(
    `/api/custom-orders?customerId=${encodeURIComponent(customerId)}&page=1&pageSize=20&orderBy=createdAt&order=desc`
  );
  return Array.isArray(result.items) ? result.items : [];
}

export async function getMyRentalOrders(
  customerId: string
): Promise<CustomerRentalOrder[]> {
  const result = await getJson<CustomerRentalOrderListResponse>(
    `/api/rental-orders?customerId=${encodeURIComponent(customerId)}&page=1&pageSize=20&orderBy=createdAt&order=desc`
  );
  return Array.isArray(result.items) ? result.items : [];
}

export async function getMyAppointments(
  customerId: string
): Promise<CustomerAppointment[]> {
  const result = await getJson<CustomerAppointment[]>(
    `/api/appointments?customerId=${encodeURIComponent(customerId)}`
  );
  return Array.isArray(result) ? result : [];
}

export async function getMyMeasurementProfiles(
  customerId: string
): Promise<CustomerMeasurementProfile[]> {
  const result = await getJson<CustomerMeasurementProfile[]>(
    `/api/customers/${encodeURIComponent(customerId)}/measurement-profiles`
  );
  return Array.isArray(result) ? result : [];
}

export async function getMyMeasurementProfileValues(
  profileId: string,
  garmentType: string
): Promise<CustomerMeasurementGarmentValues> {
  const result = await getJson<CustomerMeasurementGarmentValues>(
    `/api/measurement-profiles/${encodeURIComponent(profileId)}/values?garmentType=${encodeURIComponent(garmentType)}`
  );
  return result;
}
