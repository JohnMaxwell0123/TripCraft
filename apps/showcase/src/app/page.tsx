import { Navbar } from '@/components/common/Navbar';
import { Hero } from '@/components/home/Hero';
import { ScrollyStage } from '@/components/stage/ScrollyStage';
import { BentoGrid } from '@/components/home/BentoGrid';
import { TechFoundation } from '@/components/home/TechFoundation';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand text-ink w-full overflow-x-clip">
      <Navbar />
      <Hero />
      <ScrollyStage />
      <BentoGrid />
      <TechFoundation />
      <Footer />
    </main>
  );
}
