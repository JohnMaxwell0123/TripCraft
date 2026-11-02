import { Navbar } from '@/components/common/Navbar';
import { Hero } from '@/components/home/Hero';
import { FilmStage } from '@/components/film/FilmStage';
import { AgencyStage } from '@/components/stage/AgencyStage';
import { BentoGrid } from '@/components/home/BentoGrid';
import { CustomerStories } from '@/components/home/CustomerStories';
import { TechFoundation } from '@/components/home/TechFoundation';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFFFF9] text-[#241E20] w-full overflow-x-clip selection:bg-[#241E20] selection:text-[#FFFFF9]">
      <Navbar />
      <Hero />
      {/* C 端：旅客端演示片「一根线」（一句话 → 两条路 → 全家同一个版本 → 交给车机导航） */}
      <FilmStage />
      {/* B 端：旅行社线路工作室，独立的一段场景动画 */}
      <AgencyStage />
      <BentoGrid />
      <CustomerStories />
      <TechFoundation />
      <Footer />
    </main>
  );
}
