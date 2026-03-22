import { GridCollections } from "@/components/customer/collections/GridCollections";
import { Title } from "@/components/customer/collections/Title";
import { Pagination } from "@/components/shared/Pagination";

export default function CustomerCollections() {
  return (
    <div className="min-h-dvh flex flex-col w-full max-w-350 mx-auto max-xl:px-4 py-20 gap-y-15">
      <Title />
      <GridCollections />
      <Pagination />
    </div>
  );
}
