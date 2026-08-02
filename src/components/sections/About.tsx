import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

const bullets = [
  'AI-powered automation',
  'Faster customer response',
  'Reduced manual work',
  'Better business decisions'
];

export default function About() {
  return (
    <section id="about" className="relative py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <Reveal>
            <SectionHeading
              eyebrow="About Project Atlas AI"
              title="AI automation systems built for real operations"
              subtitle="Project Atlas AI helps companies integrate artificial intelligence into their daily operations through custom AI agents, automation workflows, and intelligent business systems."
            />
          </Reveal>

          <Reveal delayMs={120}>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 shadow-glow">
              <div className="grid gap-4 sm:grid-cols-2">
                {bullets.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex size-8 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                      <span className="size-2.5 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
                    </span>
                    <div>
                      <div className="font-semibold">{b}</div>
                      <div className="mt-1 text-sm text-white/65">
                        Built to increase speed, accuracy, and ROI.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-semibold">Outcome-driven delivery</div>
                <p className="mt-2 text-sm text-white/70">
                  We identify repetitive friction, design the AI workflow, integrate your
                  tools, and continuously optimize.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

