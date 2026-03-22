"use client";

import { Package } from "lucide-react";

export default function AdminWorkshopSheetPrintButton() {
  return (
    <div className="fixed bottom-8 right-8 print:hidden flex gap-4">
      <button 
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.print();
          }
        }}
        className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-stone-800 transition transform hover:scale-105 active:scale-95"
      >
        <Package className="size-4" /> Imprimir Hoja de Taller
      </button>
    </div>
  );
}
