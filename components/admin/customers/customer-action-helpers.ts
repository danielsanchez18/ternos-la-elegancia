export type CustomerActionData = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
};

export type EditCustomerFormState = {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  dni: string;
};

export type ChangeSummaryEntry = {
  field: string;
  from: string;
  to: string;
};

export function fullCustomerName(customer: CustomerActionData) {
  return `${customer.nombres} ${customer.apellidos}`.trim();
}

export function detectCustomerChanges(
  original: CustomerActionData,
  edited: EditCustomerFormState
): ChangeSummaryEntry[] {
  const changes: ChangeSummaryEntry[] = [];

  if (edited.nombres.trim() !== original.nombres) {
    changes.push({
      field: "Nombres",
      from: original.nombres,
      to: edited.nombres.trim(),
    });
  }

  if (edited.apellidos.trim() !== original.apellidos) {
    changes.push({
      field: "Apellidos",
      from: original.apellidos,
      to: edited.apellidos.trim(),
    });
  }

  if (edited.email.trim().toLowerCase() !== original.email) {
    changes.push({
      field: "Correo",
      from: original.email,
      to: edited.email.trim().toLowerCase(),
    });
  }

  const originalPhone = original.celular ?? "";
  if (edited.celular.trim() !== originalPhone) {
    changes.push({
      field: "Celular",
      from: originalPhone || "(vacío)",
      to: edited.celular.trim() || "(vacío)",
    });
  }

  if (edited.dni.trim() !== original.dni) {
    changes.push({
      field: "DNI",
      from: original.dni,
      to: edited.dni.trim(),
    });
  }

  return changes;
}

export function buildCustomerPatchPayload(
  changes: ChangeSummaryEntry[],
  form: EditCustomerFormState
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  for (const change of changes) {
    if (change.field === "Nombres") {
      body.nombres = form.nombres.trim();
    }
    if (change.field === "Apellidos") {
      body.apellidos = form.apellidos.trim();
    }
    if (change.field === "Correo") {
      body.email = form.email.trim().toLowerCase();
    }
    if (change.field === "Celular") {
      body.celular = form.celular.trim() || null;
    }
    if (change.field === "DNI") {
      body.dni = form.dni.trim();
    }
  }

  return body;
}
