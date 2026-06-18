import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import {
  AdminCustomersPanel,
  AdminFooterPanel,
  AdminInquiriesPanel,
  AdminInventoryPanel,
  AdminOrdersPanel,
  AdminSettingsPanel,
} from '../components/admin/AdminOperations';
import { apiRequest } from '../lib/api';
import type { AdminTab, DashboardData } from '../types/admin';
import type { Category, Product } from '../types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('veezo_admin_token')));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const notify = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const loadCatalog = async () => {
    const [tree, productList] = await Promise.all([
      apiRequest<Category[]>('/admin/categories'),
      apiRequest<Product[]>('/admin/products'),
    ]);
    setCategories(tree);
    setProducts(productList);
  };

  const loadDashboard = async () => {
    const data = await apiRequest<DashboardData>('/admin/dashboard');
    setDashboard(data);
  };

  const refresh = async () => {
    await Promise.all([loadDashboard(), loadCatalog()]);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    refresh().catch((err) => setError(err.message));
  }, [isAuthenticated]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await apiRequest<{ ok: boolean; token?: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (!result.ok) {
        setError('Invalid password.');
        return;
      }
      localStorage.setItem('veezo_admin_token', result.token || 'veezo-admin-token');
      localStorage.setItem('veezo_admin_password', password);
      setIsAuthenticated(true);
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('veezo_admin_token');
    localStorage.removeItem('veezo_admin_password');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-16">
        <form onSubmit={login} className="w-full rounded-[28px] border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Admin</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">VEEZO Dashboard</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400/40"
          />
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          <button type="submit" className="mt-6 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">
            Sign in
          </button>
          <Link to="/" className="mt-4 block text-center text-sm text-zinc-400 hover:text-white">← Back to store</Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">VEEZO Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">Store management</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:text-white">View store</Link>
          <button type="button" onClick={logout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:text-white">Logout</button>
        </div>
      </div>

      {success ? <p className="mx-auto mt-4 max-w-7xl rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}
      {error ? <p className="mx-auto mt-4 max-w-7xl rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar active={activeTab} onChange={setActiveTab} onLogout={logout} />
        <section className="min-h-[70vh] rounded-[24px] border border-white/10 bg-white/5 p-6">
          {activeTab === 'dashboard' && dashboard ? <AdminDashboard data={dashboard} /> : null}
          {activeTab === 'products' ? (
            <AdminProducts categories={categories} products={products} onRefresh={refresh} onNotify={notify} onError={setError} />
          ) : null}
          {activeTab === 'categories' ? (
            <AdminCategories categories={categories} onRefresh={refresh} onNotify={notify} onError={setError} />
          ) : null}
          {activeTab === 'orders' ? <AdminOrdersPanel onError={setError} onNotify={notify} /> : null}
          {activeTab === 'customers' ? <AdminCustomersPanel onError={setError} /> : null}
          {activeTab === 'inventory' ? <AdminInventoryPanel onError={setError} /> : null}
          {activeTab === 'inquiries' ? <AdminInquiriesPanel onError={setError} onNotify={notify} /> : null}
          {activeTab === 'footer' ? <AdminFooterPanel onError={setError} onNotify={notify} /> : null}
          {activeTab === 'settings' ? <AdminSettingsPanel onError={setError} onNotify={notify} /> : null}
        </section>
      </div>
    </main>
  );
}
