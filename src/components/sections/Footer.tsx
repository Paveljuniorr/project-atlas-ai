import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-lg font-bold text-slate-900">Project Atlas AI</div>
            <div className="mt-2 text-sm text-slate-500">
              Enterprise AI lead acquisition, workflow automation, and autonomous CRM systems.
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Platform</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/dashboard" className="hover:text-indigo-600 transition">Revenue Dashboard</Link></li>
              <li><Link href="/leads" className="hover:text-indigo-600 transition">Lead Pipeline CRM</Link></li>
              <li><Link href="/inbox" className="hover:text-indigo-600 transition">AI Agent Inbox</Link></li>
              <li><Link href="/settings" className="hover:text-indigo-600 transition">Workspace Settings</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Contact</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div>Email: <a className="hover:text-indigo-600 transition font-medium" href="mailto:juniordouontio@gmail.com">juniordouontio@gmail.com</a></div>
              <div>Phone: <a className="hover:text-indigo-600 transition font-medium" href="tel:+237672347508">+237 672347508</a></div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-slate-200 pt-6">
          <div className="text-sm text-slate-500">© 2026 Project Atlas AI. All rights reserved.</div>
          <div className="text-xs text-slate-400">Enterprise SaaS Platform</div>
        </div>
      </div>
    </footer>
  );
}


