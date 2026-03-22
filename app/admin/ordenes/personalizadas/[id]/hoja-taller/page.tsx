import { notFound } from "next/navigation";
import { getAdminWorkshopSheetData } from "@/lib/admin-orders";
import { Scissors, Ruler, User, Calendar, MapPin, Package, CheckCircle2, Info } from "lucide-react";
import AdminWorkshopSheetPrintButton from "@/components/admin/AdminWorkshopSheetPrintButton";

export default async function WorkshopSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const order = await getAdminWorkshopSheetData(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 p-8 md:p-12 print:p-0">
      {/* Container for Print */}
      <div className="max-w-4xl mx-auto border border-stone-100 shadow-sm print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="p-8 border-b-2 border-stone-800 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900 mb-1">
              La Elegancia
            </h1>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
              Sastrería & Taller de Alta Costura
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-stone-900 text-white px-4 py-1 text-sm font-bold skew-x-[-12deg] mb-2">
              <span className="skew-x-[12deg] inline-block">FICHA DE PRODUCCIÓN</span>
            </div>
            <p className="text-xl font-mono font-bold text-stone-800">{order.code}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-0 border-b border-stone-200">
          <div className="p-6 border-r border-stone-200">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="size-3" /> Información del Cliente
            </h3>
            <p className="text-lg font-bold">{order.customer.nombres} {order.customer.apellidos}</p>
            <p className="text-sm text-stone-600 mt-1">DNI: {order.customer.dni}</p>
            <p className="text-sm text-stone-600">Tel: {order.customer.celular}</p>
          </div>
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar className="size-3" /> Cronograma
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Fecha Pedido:</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("es-PE")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-bold text-rose-600">ENTREGA PROMETIDA:</span>
                <span className="font-bold text-rose-600">
                  {order.promisedDeliveryAt ? new Date(order.promisedDeliveryAt).toLocaleDateString("es-PE") : "No definida"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          {order.items.map((item: any, idx: number) => (
            <div key={item.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm">
                  {idx + 1}
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">{item.itemNameSnapshot}</h2>
                <div className="h-px flex-1 bg-stone-100"></div>
                <span className="text-sm font-bold text-stone-400">CANT: {item.quantity}</span>
              </div>

              {item.parts.map((part: any) => (
                <div key={part.id} className="ml-12 border-l-2 border-stone-100 pl-8 pb-8 last:pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-stone-800">{part.label}</h3>
                    <div className="bg-stone-50 border border-stone-200 rounded px-3 py-1 text-[10px] font-bold text-stone-600 uppercase">
                      {part.garmentType.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Fabric & Customization */}
                    <div className="space-y-6">
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Package className="size-3" /> Tela Seleccionada
                        </h4>
                        <p className="text-sm font-bold text-stone-800 leading-tight">
                          {part.fabricNameSnapshot || "No especificada"}
                        </p>
                        {part.fabricCodeSnapshot && (
                          <p className="text-xs text-stone-500 font-mono mt-1">CÓDIGO: {part.fabricCodeSnapshot}</p>
                        )}
                        <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase">
                          {part.workMode === 'A_TODO_COSTO' ? 'A TODO COSTO' : 'HECHURA'}
                        </p>
                      </div>

                      {part.selections && part.selections.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Scissors className="size-3" /> Configuraciones
                          </h4>
                          <div className="grid grid-cols-1 gap-1">
                            {part.selections.map((s: any) => (
                              <div key={s.id} className="flex justify-between text-xs py-1 border-b border-stone-50">
                                <span className="text-stone-500">{s.definitionLabelSnapshot}</span>
                                <span className="font-bold">
                                  {s.optionLabelSnapshot || s.valueText || s.valueNumber || (s.valueBoolean ? "Sí" : "No")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Measurements */}
                    <div>
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Ruler className="size-3" /> Medidas Técnicas
                      </h4>
                      {part.measurements ? (
                        <div className="grid grid-cols-2 gap-x-4 border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                          {part.measurements.map((m: any, mIdx: number) => (
                            <div key={mIdx} className="flex justify-between items-center p-2 text-xs border-b border-stone-100 last:border-b-0 even:border-l even:bg-stone-50/30">
                              <span className="text-stone-500">{m.label}</span>
                              <span className="font-black text-stone-900">{m.value}{m.unit}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-32 rounded-xl border-2 border-dashed border-stone-100 flex flex-col items-center justify-center text-stone-300">
                          <Info className="size-6 mb-2" />
                          <p className="text-[10px] uppercase font-bold">Medidas no vinculadas</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {part.notes && (
                    <div className="mt-6 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Nota Taller:</p>
                      <p className="text-xs text-stone-700 italic">"{part.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Global Notes */}
        {order.notes && (
          <div className="p-8 border-t border-stone-200 bg-stone-50/50">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Notas Generales de la Orden</h3>
            <p className="text-sm text-stone-700 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-8 border-t-2 border-stone-200 flex justify-between items-center bg-white">
          <div className="text-[10px] text-stone-400 font-mono">
            Generado por Sistema de Gestión - La Elegancia | {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Print Controls (Hidden on Print) */}
      <AdminWorkshopSheetPrintButton />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Restore pure white background */
          html, body { 
            background: white !important; 
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide ALL layout elements from AdminShell */
          aside, header, nav, .print\\:hidden { 
            display: none !important; 
          }

          /* Reset main container spacing */
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          /* Reset page container */
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }

          /* Make the ficha take full width */
          .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Scale adjustments if needed */
          .ficha-container {
            width: 100%;
          }
        }
      ` }} />
    </div>
  );
}
