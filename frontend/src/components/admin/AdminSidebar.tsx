import type { AdminTab } from '../../types/admin';

const NAV: { id: AdminTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'footer', label: 'Footer Settings' },
  { id: 'settings', label: 'Settings' },
];

type Props = {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  onLogout: () => void;
};

export default function AdminSidebar({ active, onChange, onLogout }: Props) {
  return (
    <aside className="flex h-full flex-col rounded-[24px] border border-amber-400/20 bg-black p-5">
      <div className="mb-8 border-b border-amber-400/20 pb-6">
        <p className="text-xs uppercase tracking-[0.45em] text-amber-300">VEEZO</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Admin Panel</h2>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-xl px-4 py-3 text-left text-sm transition ${
              active === item.id ? 'bg-amber-400/20 text-amber-100' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 rounded-xl px-4 py-3 text-left text-sm text-red-400 hover:bg-red-400/10"
      >
        Logout
      </button>
    </aside>
  );
}
