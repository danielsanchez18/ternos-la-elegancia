import { About } from "@/components/customer/home/About";
import { Collections } from "@/components/customer/home/Collections";
import { Hero } from "@/components/customer/home/Hero";
import { Offer } from "@/components/customer/home/Offer";
import { Process } from "@/components/customer/home/Process";
import { Products } from "@/components/customer/home/Products";
import { Testimonials } from "@/components/customer/home/Testimonials";
import { VisitUs } from "@/components/customer/home/VisitUs";

export default function CustomerHome() {
  return (
    <div className="">
      <Hero />
      <div className="max-w-350 mx-auto py-40 space-y-40 max-xl:px-4">
        <Products />
        <Collections />
      </div>
      <Offer />
      <div className="max-w-350 mx-auto py-40 space-y-40 max-xl:px-4">
        <Process />
        <About />
        <Testimonials />
        <VisitUs />
      </div>
    </div>
  );
}
