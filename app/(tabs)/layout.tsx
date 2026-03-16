import { Navbar } from "@/components/customer/shared/Navbar";
import { Footer } from "@/components/customer/shared/Footer";
import { ArrowUp } from "@/components/customer/shared/ArrowUp";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="h-dvh overflow-y-auto w-full bg-white text-black font-google-sans scrollbar-hide relative">
        <div id="navbar" className="mb-20">
          <Navbar />
        </div>
        {children}
        <Footer />
      </main>
      <div className="fixed flex justify-end w-fit items-center bottom-4 right-4">
        <ArrowUp />
      </div>
    </>
  )
}