import { SortBy } from "@/components/customer/collections/[id]/SortBy";
import { BoxSearch } from "@/components/customer/search/BoxSearch";
import { Filters } from "@/components/customer/search/Filters";
import { ProductsGrid } from "@/components/customer/search/ProductsGrid";
import { Title } from "@/components/customer/search/Title";
import { Pagination } from "@/components/shared/Pagination";

export default function CustomerSearch() {
  return (
    <div className="min-h-dvh flex flex-col w-full max-w-350 mx-auto max-xl:px-4 py-20 gap-y-10">
      <Title />
      <BoxSearch />

      <div className="grid grid-cols-[auto_1fr] mt-10 gap-x-10">  
        <div className='flex flex-col gap-y-10'>
          <Filters />
          <SortBy />
        </div>
        
        <div className='flex flex-col gap-y-10'>
          {/* Productos */}
          <ProductsGrid />
          <Pagination />
        </div>
      </div>

    </div>
  );
}
