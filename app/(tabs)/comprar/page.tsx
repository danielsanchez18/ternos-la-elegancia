import { Empty } from "@/components/customer/cart/Empty";
import { ProductsList } from "@/components/customer/cart/ProductsList";
import { ProductsRelatedToBuy } from "@/components/customer/cart/ProductsRelatedToBuy";
import { Steeps } from "@/components/customer/cart/Steeps";
import { Summary } from "@/components/customer/cart/Summary";
import { Title } from "@/components/customer/cart/Title";

export default function CustomerBuy() {
  return (
    <div className="min-h-dvh py-20 max-w-350 mx-auto max-xl:px-4 flex flex-col gap-y-20">
      {/* <Steeps /> */}

      <Title />

      <div className="grid gap-10 xl:grid-cols-[2fr_1fr]">
        <ProductsList />
        <Summary />
      </div>

      <ProductsRelatedToBuy />

      {/* <div className="flex items-center justify-center flex-1">
        <Empty />
      </div> */}
    </div>
  );
}
