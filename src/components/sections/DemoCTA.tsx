import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';

export default function DemoCTA() {
  return (
    <section id="demo" className="py-16 md:py-20 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-electricBlue/10 via-purple-500/10 to-cyan-400/10 backdrop-blur p-7 md:p-10 shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%)]" />
            <div className="relative grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
                  Personalized onboarding
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                  See What AI Can Do For Your Business
                </h2>
                <p className="mt-3 text-white/70 text-base md:text-lg leading-relaxed">
                  Book a personalized demo and discover how Project Atlas AI can automate your workflow.
                </p>

                <div className="mt-6 text-sm text-white/75 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-2xl border border-white/10 bg-black/20 grid place-items-center">✉</span>
                    <a
                      className="hover:text-white transition"
                      href="mailto:juniordouontio@gmail.com"
                    >
                      juniordouontio@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-2xl border border-white/10 bg-black/20 grid place-items-center">☎</span>
                    <a className="hover:text-white transition" href="tel:+237672347508">
                      +237 672347508
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
                  <div className="text-sm font-semibold">Next step</div>
                  <p className="mt-2 text-sm text-white/65">
                    Request a demo and we’ll reach out with a quick plan tailored to your workflow.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-electricBlue via-purple-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black shadow-glow hover:brightness-110 transition"
                    >
                      Request Demo
                    </Link>
                    <Link
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                    >
                      Contact Us
                    </Link>
                  </div>
                  <div className="mt-5 text-xs text-white/55">
                    No backend required for this version—form submits on the frontend and is ready to connect to Formspree/Resend.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

