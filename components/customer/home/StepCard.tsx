import Image from "next/image";

type StepCardProps = {
  stepNumber: number;
  title: string;
  description: string;
  image: string;
};

export const StepCard = ({
  stepNumber,
  title,
  description,
  image,
}: StepCardProps) => {
  return (
    <div className="h-100 w-full relative">

      <div className="size-full text-center flex flex-col space-y-5 items-center justify-center px-4 py-2 absolute z-10">
        <p className="text-6xl font-semibold bg-white rounded-full size-30 flex items-center justify-center font-oswald">
          {stepNumber}
        </p>

        <div className="space-y-2">
          <h3 className="text-2xl uppercase font-oswald font-semibold">{title}</h3>
          <p className="text-neutral-700">{description}</p>
        </div>
      </div>

      <div className="absolute bg-black/10 size-full inset-0 ">
        {/* <Image
          src={image}
          alt={title}
          width={120}
          height={120}
          className="object-cover"
        /> */}
      </div>
    </div>
  );
};
