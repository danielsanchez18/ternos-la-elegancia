export function resolveCustomerId(
  initialCustomerId: number | undefined,
  customerIdInput: string
) {
  return initialCustomerId ?? Number(customerIdInput);
}

export function buildCreateMeasurementProfilePayload(input: {
  notes: string;
  takenAt: string;
  selectedGarments: string[];
}) {
  const body: Record<string, unknown> = {
    notes: input.notes.trim() || undefined,
    takenAt: new Date(input.takenAt).toISOString(),
  };

  if (input.selectedGarments.length > 0) {
    body.garmentTypes = input.selectedGarments;
  }

  return body;
}
