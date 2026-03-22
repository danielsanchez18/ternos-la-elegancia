import { BannerTitle } from '@/components/customer/collections/[id]/BannerTitle';
import { Filters } from '@/components/customer/collections/[id]/Filters';
import { SortBy } from '@/components/customer/collections/[id]/SortBy';
import { ProductsGrid } from '@/components/customer/collections/[id]/ProductsGrid';
import { Pagination } from '@/components/shared/Pagination';

export default function CustomerCollectionsId() {
  return (
    <div className="min-h-dvh flex flex-col w-full max-w-350 mx-auto max-xl:px-4 py-20 gap-y-10">
      
      <BannerTitle />

      <div className="grid grid-cols-[auto_1fr] gap-x-10">
        
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
