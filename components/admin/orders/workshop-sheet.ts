/* eslint-disable @typescript-eslint/no-explicit-any */

export function getWorkshopSelectionValue(selection: any): string {
  if (selection.optionLabelSnapshot) {
    return selection.optionLabelSnapshot;
  }

  if (selection.valueText) {
    return selection.valueText;
  }

  if (selection.valueNumber) {
    return String(selection.valueNumber);
  }

  return selection.valueBoolean ? "Sí" : "No";
}


export function formatWorkshopDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-PE");
}

export function formatWorkshopDateTime(value: Date | string): string {
  return new Date(value).toLocaleString();
}

export function formatWorkshopGarmentType(value: string): string {
  return value.replace(/_/g, " ");
}

export function formatWorkshopWorkModeLabel(value: string): string {
  return value === "A_TODO_COSTO" ? "A TODO COSTO" : "HECHURA";
}

export function printWorkshopSheet(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}
export const workshopSheetPrintStyles = `
  @media print {
    html, body {
      background: white !important;
      color: black !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    aside, header, nav, .print\\:hidden {
      display: none !important;
    }

    main {
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }

    .min-h-screen {
      background: white !important;
      padding: 0 !important;
      display: block !important;
    }

    .max-w-4xl {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }

    .ficha-container {
      width: 100%;
    }
  }
`;

