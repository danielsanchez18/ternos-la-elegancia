import { ProductCard } from './ProductCard';

export const ProductsList = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
      <ProductCard />
    </div>
  )
}
