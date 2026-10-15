import { Navbar } from '@/components/common/Navbar';
import { Hero } from '@/components/home/Hero';
import { ScrollyStage } from '@/components/stage/ScrollyStage';
import { BentoGrid } from '@/components/home/BentoGrid';
import { CustomerStories } from '@/components/home/CustomerStories';
import { TechFoundation } from '@/components/home/TechFoundation';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFFFF9] text-[#241E20] w-full overflow-x-clip selection:bg-[#241E20] selection:text-[#FFFFF9]">
      <Navbar />
      <Hero />
      <ScrollyStage />
      <BentoGrid />
      <CustomerStories />
      <TechFoundation />
      <Footer />
    </main>
  );
}
