import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import HowItWorks from '@/components/sections/HowItWorks';
import WhyChoose from '@/components/sections/WhyChoose';
import DemoCTA from '@/components/sections/DemoCTA';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/site/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="relative">
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <WhyChoose />
        <DemoCTA />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

