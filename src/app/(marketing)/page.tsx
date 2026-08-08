import Hero from '@/components/sections/Hero';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/site/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main id="main" className="relative">
        <Hero />
      </main>

      <Footer />
    </div>
  );
}


