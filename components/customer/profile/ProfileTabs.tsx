"use client";

import { useState } from "react";
import ProfileDataSection from "./ProfileDataSection";
import ProfileOrdersSection from "./ProfileOrdersSection";
import ProfileAppointmentsSection from "./ProfileAppointmentsSection";
import ProfileMeasurementsSection from "./ProfileMeasurementsSection";

type TabValue = "datos" | "pedidos" | "citas" | "medidas";

interface ProfileTabsProps {
  customerId: string;
}

export default function ProfileTabs({ customerId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("datos");

  const tabs: { value: TabValue; label: string }[] = [
    { value: "datos", label: "Mis Datos" },
    { value: "pedidos", label: "Mis Pedidos" },
    { value: "citas", label: "Mis Citas" },
    { value: "medidas", label: "Mis Medidas" },
  ];

  return (
    <div className="w-full flex-1">
      {/* Navegación de pestañas (Sin bordes redondeados) */}
      <div className="flex w-full border-b border-black/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors outline-none
                ${isActive 
                  ? "border-b-2 border-primary text-primary bg-white" 
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido de la pestaña */}
      <div className="mt-8 min-h-[400px]">
        {activeTab === "datos" && <ProfileDataSection />}
        {activeTab === "pedidos" && <ProfileOrdersSection customerId={customerId} />}
        {activeTab === "citas" && <ProfileAppointmentsSection customerId={customerId} />}
        {activeTab === "medidas" && <ProfileMeasurementsSection customerId={customerId} />}
      </div>
    </div>
  );
}
