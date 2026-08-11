'use client';

import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

const steps = [
  {
    title: 'Analyze your business workflow',
    description:
      'We map repetitive tasks, customer journeys, and operational bottlenecks to identify the highest-impact automation opportunities.'
  },
  {
    title: 'Design the AI automation system',
    description:
      'We define the AI agent behavior, approval flows, and response strategies so automation stays accurate and aligned with your brand.'
  },
  {
    title: 'Integrate AI tools and workflows',
    description:
      'We connect your stack—CRM, messaging, helpdesk, forms, and internal systems—to keep data and actions consistent.'
  },
  {
    title: 'Launch and optimize',
    description:
      'We deploy quickly, monitor performance, and continuously improve lead handling, support quality, and operational efficiency.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From workflow → automation that performs"
            subtitle="A clear 4-step process designed for fast deployment and measurable results."
          />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="lg:pr-8">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-electricBlue/60 via-purple-500/50 to-cyan-400/40" />
              <div className="space-y-5">
                {steps.map((step, i) => (
                  <Reveal key={step.title} delayMs={90 * i}>
                    <div className="relative flex gap-4 rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur p-5">
                      <div className="relative z-10 mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                        <div className="text-sm font-semibold">{i + 1}</div>
                      </div>
                      <div>
                        <div className="font-semibold">{step.title}</div>
                        <div className="mt-1 text-sm text-white/70 leading-relaxed">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <Reveal delayMs={180}>
            <div className="rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur p-6 md:p-8 shadow-glow">
              <div className="text-sm font-semibold">What you get</div>
              <div className="mt-4 grid gap-3">
                {[
                  { k: 'Lead capture', v: 'Respond instantly and qualify automatically.' },
                  { k: 'Support automation', v: '24/7 answers with consistent tone.' },
                  { k: 'Ops efficiency', v: 'Reduce manual work across your stack.' },
                  { k: 'Continuous improvements', v: 'Optimize with real usage data.' }
                ].map((x) => (
                  <div key={x.k} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
                    <div>
                      <div className="text-sm font-semibold">{x.k}</div>
                      <div className="mt-1 text-sm text-white/65">{x.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

