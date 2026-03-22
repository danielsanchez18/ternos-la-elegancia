import { Hero } from "@/components/customer/about/Hero";
import { Mission } from '@/components/customer/about/Mission';
import { Features } from "@/components/customer/about/Features";
import { Testimonials } from "@/components/customer/home/Testimonials";
import { Team } from '@/components/customer/about/Team';
import { VisitUs } from "@/components/customer/home/VisitUs";

export default function CustomerAbout() {
  return (
    <div>
      <Hero />
      <div className="min-h-dvh py-20 max-w-350 mx-auto max-xl:px-4 flex flex-col gap-y-40">
        <div className="grid gap-5">
          <Mission />
          <Features />
        </div>
        <Team />
        <Testimonials />
        <VisitUs />
      </div>
    </div>
  );
}
