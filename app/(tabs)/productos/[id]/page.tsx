import { ProductDetails } from '@/components/customer/products/[id]/ProductDetails';
import { ProductImages } from '@/components/customer/products/[id]/ProductImages';
export default function CustomerProductsId() {
  return (
    <div className="min-h-dvh grid grid-cols-2 w-full max-w-350 mx-auto max-xl:px-4 py-20 gap-10">
      <ProductImages />
      <ProductDetails />
    </div>
  );
}
