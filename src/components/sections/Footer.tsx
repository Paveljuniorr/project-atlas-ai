import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold">Project Atlas AI</div>
            <div className="mt-2 text-sm text-white/65">
              AI automation systems that help businesses save time, capture more opportunities, and scale efficiently.
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">AI Automation Solutions</div>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>
                <Link href="#services" className="hover:text-white transition">
                  Lead Response Automation
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white transition">
                  Customer Support Agents
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white transition">
                  Workflow Automation
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white transition">
                  Business Assistants
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Contact</div>
            <div className="mt-3 space-y-2 text-sm text-white/65">
              <div>
                Email:{' '}
                <a className="hover:text-white transition" href="mailto:juniordouontio@gmail.com">
                  juniordouontio@gmail.com
                </a>
              </div>
              <div>
                Phone:{' '}
                <a className="hover:text-white transition" href="tel:+237672347508">
                  +237 672347508
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-white/10 pt-6">
          <div className="text-sm text-white/55">© 2026 Project Atlas AI. All rights reserved.</div>
          <div className="text-xs text-white/45">Built with Next.js • Tailwind • Ready for Vercel</div>
        </div>
      </div>
    </footer>
  );
}

