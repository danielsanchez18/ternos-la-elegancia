import { ProductDetails } from '@/components/customer/products/[id]/ProductDetails';
import { ProductImages } from '@/components/customer/products/[id]/ProductImages';
import { ProductInformation } from '@/components/customer/products/[id]/ProductInformation';
import { ProductsAccessories } from '@/components/customer/products/[id]/ProductsAccessories';
import { ProductsRelated } from '@/components/customer/products/[id]/ProductsRelated';

export default function CustomerProductsId() {
  return (
    <div className="min-h-dvh grid grid-cols-2 w-full max-w-350 mx-auto max-xl:px-4 py-20 gap-x-10 gap-y-20">
      
      <div className='relative'>
        <div className='sticky top-10'>
          <ProductImages />
        </div>
      </div>
      
      <div className='overflow-y-auto flex flex-col gap-y-10'>
        <ProductDetails />
        <ProductInformation />
      </div>

      <div className='col-span-2'>
        <ProductsRelated />
        <ProductsAccessories />
      </div>
    </div>

  );
}
