import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

const benefits = [
  'Save hundreds of hours',
  'Never lose potential customers',
  'Improve response speed',
  'Scale without increasing workload',
  'Use cutting-edge AI technology'
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Why choose Project Atlas AI"
            title="Premium automation that drives measurable growth"
            subtitle="A modern AI automation platform designed to help your business save time, capture more opportunities, and scale efficiently."
          />
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal delayMs={120}>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-7 shadow-glow">
              <div className="text-sm font-semibold">Key outcomes</div>
              <div className="mt-5 grid gap-3">
                {benefits.map((b, idx) => (
                  <div
                    key={b}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mt-1 h-8 w-8 rounded-xl border border-white/10 bg-white/5 grid place-items-center">
                      <div className="text-xs font-semibold text-white/80">{idx + 1}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{b}</div>
                      <div className="mt-1 text-sm text-white/65">
                        Designed to deliver faster decisions and fewer dropped leads.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur p-7 shadow-glow relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-2xl" />
              <div className="relative">
                <div className="text-sm font-semibold">Built for trust</div>
                <div className="mt-3 text-white/70 text-sm leading-relaxed">
                  Transparent automation logic, consistent customer experience, and a
                  deployment process that respects your operations.
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    { t: 'Quality responses', d: 'Agent prompts & guardrails for reliable output.' },
                    { t: 'Secure integrations', d: 'Connect tools while maintaining clean data flows.' },
                    { t: 'Optimization loop', d: 'Iterate using real interactions and performance metrics.' }
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-sm font-semibold">{x.t}</div>
                      <div className="mt-2 text-sm text-white/65">{x.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

