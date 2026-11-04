import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { brand } from '../../data/brand';
import { industryLinks, productGroups, resourceLinks, solutionLinks, storyByPath } from '../content';

const menus = [
  { id: 'product', label: 'Product', groups: productGroups.map((group) => ({ heading: group.heading, items: group.items })) },
  { id: 'solutions', label: 'Solutions', groups: [{ heading: 'By need', items: solutionLinks.map((item) => ({ to: item.to, label: item.label })) }] },
  { id: 'industries', label: 'Industries', groups: [{ heading: 'By workplace', items: industryLinks.map((item) => ({ to: item.to, label: item.label })) }] },
  { id: 'resources', label: 'Resources', groups: [{ heading: 'Learn', items: resourceLinks.map((item) => ({ to: item.to, label: item.label })) }] }
];

const titles: Record<string, string> = {
  '/': 'MzansiWork · Workforce time for South African businesses',
  '/pricing': 'Pricing · MzansiWork',
  '/product': 'Product · MzansiWork',
  '/solutions': 'Solutions · MzansiWork',
  '/industries': 'Industries · MzansiWork',
  '/faq': 'FAQs · MzansiWork',
  '/help': 'Help centre · MzansiWork',
  '/about': 'About · MzansiWork',
  '/contact': 'Contact · MzansiWork',
  '/tour': 'Product tour · MzansiWork',
  '/login': 'Log in · MzansiWork',
  '/get-started': 'Get started · MzansiWork'
};

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-300">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => <li key={`${title}-${link.label}`}><Link to={link.to} className="text-sm text-navy-100 hover:text-white">{link.label}</Link></li>)}
      </ul>
    </div>
  );
}

export function SiteFrame() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [cookies, setCookies] = useState<string | null>(() => localStorage.getItem('mzansi.cookies'));

  useEffect(() => {
    const story = storyByPath(pathname);
    document.title = titles[pathname] ?? (story ? `${story.title} · MzansiWork` : 'MzansiWork');
    setOpen(null);
    setDrawer(false);
    const frame = document.getElementById('site-scroll');
    if (frame) frame.scrollTo(0, 0);
  }, [pathname]);

  const chooseCookies = (value: 'all' | 'essential') => {
    localStorage.setItem('mzansi.cookies', value);
    setCookies(value);
  };

  return (
    <div id="site-scroll" className="h-full overflow-y-auto bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link to="/" aria-label="MzansiWork home"><Logo /></Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {menus.map((menu) =>
            <div key={menu.id} className="relative" onMouseLeave={() => setOpen(null)}>
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-hover"
                aria-expanded={open === menu.id}
                onMouseEnter={() => setOpen(menu.id)}
                onClick={() => setOpen(open === menu.id ? null : menu.id)}>
                {menu.label}
              </button>
              {open === menu.id &&
              <div className="absolute left-0 top-full z-50 w-[420px] rounded-2xl border border-line bg-surface p-4 shadow-pop">
                <div className="grid gap-4">
                  {menu.groups.map((group) =>
                  <div key={group.heading}>
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{group.heading}</p>
                    <ul className="mt-1">
                      {group.items.map((item) =>
                      <li key={`${group.heading}-${item.label}`}>
                        <Link to={item.to} className="block rounded-md px-2 py-1.5 text-sm text-ink hover:bg-hover" onClick={() => setOpen(null)}>{item.label}</Link>
                      </li>
                      )}
                    </ul>
                  </div>
                  )}
                </div>
              </div>
              }
            </div>
            )}
            <NavLink to="/pricing" className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'text-primary' : 'text-ink hover:bg-hover'}`}>Pricing</NavLink>
          </nav>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link to="/contact" className="px-3 text-sm font-medium text-ink">Contact</Link>
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-hover">Log in</Link>
            <Link to="/get-started" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Get started</Link>
          </div>
          <button type="button" className="ml-auto rounded-md p-2 lg:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}><MenuIcon className="h-5 w-5" /></button>
        </div>
      </header>

      {drawer &&
      <div className="fixed inset-0 z-50 bg-surface lg:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="rounded-md p-2"><XIcon className="h-5 w-5" /></button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto px-5 pb-10">
          {menus.map((menu) =>
          <details key={menu.id} className="border-b border-line py-3">
            <summary className="cursor-pointer text-sm font-semibold">{menu.label}</summary>
            <ul className="mt-2 space-y-1">
              {menu.groups.flatMap((group) => group.items).map((item) =>
              <li key={`${menu.id}-${item.label}`}><Link to={item.to} className="block py-1 text-sm text-muted" onClick={() => setDrawer(false)}>{item.label}</Link></li>
              )}
            </ul>
          </details>
          )}
          <Link to="/pricing" className="block border-b border-line py-3 text-sm font-semibold" onClick={() => setDrawer(false)}>Pricing</Link>
          <Link to="/contact" className="block border-b border-line py-3 text-sm font-semibold" onClick={() => setDrawer(false)}>Contact</Link>
          <div className="mt-4 grid gap-2">
            <Link to="/login" className="rounded-lg border border-line py-3 text-center text-sm font-semibold" onClick={() => setDrawer(false)}>Log in</Link>
            <Link to="/get-started" className="rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white" onClick={() => setDrawer(false)}>Get started</Link>
          </div>
        </div>
      </div>
      }

      <Outlet />

      <footer className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo tone="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-100">Workforce time, attendance and leave for South African businesses. Priced in rand.</p>
            <p className="mt-4 text-xs text-navy-300">Initial market: South Africa · {brand.supportEmail}</p>
          </div>
          <FooterColumn title="Product" links={[
            { to: '/product', label: 'Overview' },
            { to: '/product/employer-app', label: 'Employer mobile app' },
            { to: '/product/employee-app', label: 'Employee browser' },
            { to: '/product/desktop-agent', label: 'Windows desktop agent' },
            { to: '/resources/blog', label: 'Product notes' }
          ]} />
          <FooterColumn title="Solutions" links={solutionLinks.slice(0, 6).map((item) => ({ to: item.to, label: item.label }))} />
          <FooterColumn title="Company" links={[
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
            { to: '/privacy', label: 'Privacy' },
            { to: '/terms', label: 'Terms' },
            { to: '/tracking-policy', label: 'Tracking policy' },
            { to: '/login', label: 'Log in' },
            { to: '/get-started', label: 'Get started' }
          ]} />
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-navy-300 sm:px-8">
            <p>© {new Date().getFullYear()} MzansiWork. Paid plans only. The Windows agent download will appear here when a release build is published.</p>
            <div className="flex gap-4">
              <Link to="/cookies" className="hover:text-white">Cookies</Link>
              <Link to="/subscription-terms" className="hover:text-white">Subscription terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {cookies === null &&
      <div className="fixed bottom-4 left-1/2 z-50 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-line bg-surface p-4 shadow-pop">
        <p className="text-sm font-semibold">Cookies on this website</p>
        <p className="mt-1 text-sm text-muted">Essential storage remembers this choice. Analytics cookies are not loaded in this preview. Read the <Link to="/cookies" className="text-primary">cookie note</Link>.</p>
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white" onClick={() => chooseCookies('all')}>Accept</button>
          <button type="button" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => chooseCookies('essential')}>Essential only</button>
        </div>
      </div>
      }
    </div>
  );
}
