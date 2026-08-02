import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

const services = [
  {
    title: 'AI Lead Response Automation',
    description:
      'Automatically respond to customer inquiries instantly, qualify leads, and improve conversion rates.'
  },
  {
    title: 'AI Customer Support Agents',
    description:
      'Deploy intelligent assistants that answer customer questions 24/7.'
  },
  {
    title: 'Business Workflow Automation',
    description:
      'Connect tools and automate repetitive business processes.'
  },
  {
    title: 'AI Business Assistants',
    description:
      'Custom AI assistants designed around specific business needs.'
  }
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="AI solutions that turn conversations into outcomes"
            subtitle="Premium automation systems that help your team respond faster, capture more opportunities, and scale without extra workload."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, idx) => (
            <Reveal key={s.title} delayMs={80 * (idx + 1)}>
              <div className="group rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur p-6 shadow-glow transition hover:-translate-y-1 hover:bg-white/7">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/25 grid place-items-center">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="mt-4 text-xs text-white/60 group-hover:text-white/80 transition">
                  Learn more →
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

