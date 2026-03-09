import { StepCard } from "./StepCard";

const steps = [
  {
    stepNumber: 1,
    title: "Consulta Personalizada",
    description:
      "Nos reunimos contigo para entender tu estilo, preferencias y necesidades.",
    image: "/images/step-consulta.avif",
  },
  {
    stepNumber: 2,
    title: "Toma de Medidas",
    description:
      "Mediciones precisas con técnicas profesionales para el ajuste perfecto.",
    image: "/images/step-medida.jpg",
  },
  {
    stepNumber: 3,
    title: "Confección Artesanal",
    description:
      "Nuestros maestros sastres crean tu traje con materiales de primera calidad.",
    image: "/images/step-confeccion.png",
  },
  {
    stepNumber: 4,
    title: "Ajustes y Entrega",
    description:
      "Pruebas finales y ajustes para asegurar la perfección absoluta.",
    image: "/images/step-entrega.webp",
  },
];

export const Process = () => {
  return (
    <div className="space-y-15">
      <div className="space-y-4">
        <h2 className="text-5xl font-oswald font-medium uppercase">
          Nuestro Proceso
        </h2>
        <p className="text-neutral-700 text-balance text-lg">
          De la consulta a la perfección: cómo creamos tu traje ideal.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {steps.map((step) => (
          <StepCard
            key={step.stepNumber}
            stepNumber={step.stepNumber}
            title={step.title}
            description={step.description}
            image={step.image}
          />
        ))}
      </div>

      <div className="w-fit m-auto">
        <button className="btn-primary">Explora Más</button>
      </div>
    </div>
  );
};
