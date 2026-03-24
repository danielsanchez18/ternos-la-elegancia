import type { MeasurementGarmentType } from "@/components/admin/customers/measurement-garments";

export type FieldData = {
  id: number;
  garmentType: MeasurementGarmentType;
  code: string;
  label: string;
  unit: string | null;
  sortOrder: number;
};

export type ValueData = {
  fieldId: number;
  valueNumber: number | null;
  valueText: string | null;
};

export type ValuesResponse = {
  profileId: number;
  garmentId: number;
  garmentType: MeasurementGarmentType;
  values: Array<{
    id: number;
    fieldId: number;
    fieldCode: string;
    fieldLabel: string;
    unit: string | null;
    valueNumber: string | number | null;
    valueText: string | null;
  }>;
};

export type MeasurementFormValues = Record<
  number,
  {
    num: string;
    txt: string;
  }
>;

export function buildInitialMeasurementValues(valuesData: ValuesResponse) {
  const initialValues: MeasurementFormValues = {};

  for (const item of valuesData.values) {
    initialValues[item.fieldId] = {
      num: item.valueNumber?.toString() ?? "",
      txt: item.valueText ?? "",
    };
  }

  return initialValues;
}

export function buildMeasurementPayloadValues(
  fields: FieldData[],
  values: MeasurementFormValues
): { payload: ValueData[]; hasInvalidNumber: boolean } {
  const payload: ValueData[] = [];

  for (const field of fields) {
    const value = values[field.id];

    if (!value) {
      continue;
    }

    const numberValue = value.num.trim();
    const textValue = value.txt.trim();

    if (numberValue === "" && textValue === "") {
      continue;
    }

    let parsedNumber: number | null = null;
    if (numberValue) {
      parsedNumber = Number.parseFloat(numberValue);
      if (Number.isNaN(parsedNumber)) {
        return { payload: [], hasInvalidNumber: true };
      }
    }

    payload.push({
      fieldId: field.id,
      valueNumber: parsedNumber,
      valueText: textValue || null,
    });
  }

  return { payload, hasInvalidNumber: false };
}
