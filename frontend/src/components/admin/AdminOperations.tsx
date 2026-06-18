import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatPrice } from '../../lib/currency';
import type {
  AdminCustomer,
  AdminInquiry,
  AdminOrder,
  InventoryProduct,
  SiteSettings,
} from '../../types/admin';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-900/30 text-yellow-400',
    processing: 'bg-yellow-900/30 text-yellow-400',
    shipped: 'bg-blue-900/30 text-blue-400',
    delivered: 'bg-emerald-900/30 text-emerald-400',
    cancelled: 'bg-red-900/30 text-red-400',
  };
  return map[status] || 'bg-zinc-800 text-zinc-300';
}

const inputClass = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none';

export function AdminOrdersPanel({ onError, onNotify }: { onError: (m: string) => void; onNotify: (m: string) => void }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const load = async () => {
    const data = await apiRequest<AdminOrder[]>('/admin/orders');
    setOrders(data);
  };

  useEffect(() => {
    load().catch((err) => onError(err.message));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest(`/admin/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
      onNotify('Order status updated');
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Order Management</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4">#{order.id.slice(-8)}</td>
                <td className="py-3 pr-4">{order.customerName || 'Guest'}</td>
                <td className="py-3 pr-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3 pr-4 text-amber-100">{formatPrice(order.total)}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-3 py-1 text-xs capitalize ${statusClass(order.status)}`}>{order.status}</span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelected(order)} className="text-amber-200">View</button>
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && updateStatus(order.id, e.target.value)}
                      className="rounded border border-white/10 bg-black px-2 py-1 text-xs"
                    >
                      <option value="">Update</option>
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!orders.length ? (
              <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No orders yet</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {selected ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="flex items-start justify-between">
            <h4 className="text-lg font-semibold text-white">Order #{selected.id.slice(-8)}</h4>
            <button type="button" onClick={() => setSelected(null)} className="text-zinc-400">Close</button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-zinc-300">
            <p><span className="text-zinc-500">Customer:</span> {selected.customerName}</p>
            <p><span className="text-zinc-500">Phone:</span> {selected.customerPhone}</p>
            <p><span className="text-zinc-500">Email:</span> {selected.customerEmail || '—'}</p>
            <p><span className="text-zinc-500">Payment:</span> {selected.paymentMethod}</p>
            <p className="md:col-span-2"><span className="text-zinc-500">Address:</span> {selected.shippingAddress}</p>
          </div>
          <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            {selected.items.map((item, i) => (
              <li key={i} className="flex justify-between text-zinc-300">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-white/10 pt-2 text-zinc-400">
              <span>Subtotal</span>
              <span>{formatPrice(selected.subtotal ?? selected.total)}</span>
            </li>
            {(selected.deliveryCharge ?? 0) > 0 ? (
              <li className="flex justify-between text-zinc-400">
                <span>Delivery</span>
                <span>{formatPrice(selected.deliveryCharge ?? 0)}</span>
              </li>
            ) : (
              <li className="flex justify-between text-zinc-400">
                <span>Delivery</span>
                <span>Free</span>
              </li>
            )}
            <li className="flex justify-between font-medium text-amber-100">
              <span>Total</span>
              <span>{formatPrice(selected.total)}</span>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AdminCustomersPanel({ onError }: { onError: (m: string) => void }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  useEffect(() => {
    apiRequest<AdminCustomer[]>('/admin/customers').then(setCustomers).catch((err) => onError(err.message));
  }, []);
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Customers</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Orders</th>
              <th className="py-2">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4 text-white">{c.name}</td>
                <td className="py-3 pr-4">{c.email || '—'}</td>
                <td className="py-3 pr-4">{c.phone || '—'}</td>
                <td className="py-3 pr-4">{c.orders}</td>
                <td className="py-3 text-amber-100">{formatPrice(c.totalSpent)}</td>
              </tr>
            ))}
            {!customers.length ? <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No customers yet</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminInventoryPanel({ onError }: { onError: (m: string) => void }) {
  const [items, setItems] = useState<InventoryProduct[]>([]);
  useEffect(() => {
    apiRequest<InventoryProduct[]>('/admin/inventory').then(setItems).catch((err) => onError(err.message));
  }, []);
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Inventory Management</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Product</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Inventory</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4 text-white">{item.name}</td>
                <td className="py-3 pr-4">{item.stock}</td>
                <td className="py-3 pr-4">{item.status}</td>
                <td className="py-3 capitalize">{item.inventoryStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminInquiriesPanel({ onError, onNotify }: { onError: (m: string) => void; onNotify: (m: string) => void }) {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const load = async () => {
    const data = await apiRequest<AdminInquiry[]>('/admin/inquiries');
    setInquiries(data);
  };
  useEffect(() => {
    load().catch((err) => onError(err.message));
  }, []);
  const remove = async (id: string) => {
    await apiRequest(`/admin/inquiries/${id}`, { method: 'DELETE' });
    await load();
    onNotify('Inquiry removed');
  };
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Customer Inquiries</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4 text-white">{item.name}</td>
                <td className="py-3 pr-4">{item.email}</td>
                <td className="py-3 pr-4">{item.subject || '—'}</td>
                <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <button type="button" onClick={() => alert(`${item.message}`)} className="mr-3 text-amber-200">View</button>
                  <button type="button" onClick={() => remove(item.id)} className="text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {!inquiries.length ? <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No inquiries yet</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminFooterPanel({
  onError,
  onNotify,
}: {
  onError: (m: string) => void;
  onNotify: (m: string) => void;
}) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    apiRequest<SiteSettings>('/admin/settings').then(setSettings).catch((err) => onError(err.message));
  }, []);

  const save = async () => {
    if (!settings) return;
    try {
      await apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      onNotify('Footer settings saved');
    } catch (err: any) {
      onError(err.message);
    }
  };

  if (!settings) return <p className="text-zinc-500">Loading settings...</p>;

  const footer = settings.footer;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Footer Settings</h3>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
        <textarea value={footer.companyDescription} onChange={(e) => setSettings({ ...settings, footer: { ...footer, companyDescription: e.target.value } })} rows={3} className={inputClass} placeholder="Company description" />
        <input value={footer.contactInfo.phone} onChange={(e) => setSettings({ ...settings, footer: { ...footer, contactInfo: { ...footer.contactInfo, phone: e.target.value } } })} className={inputClass} placeholder="Phone" />
        <input value={footer.contactInfo.email} onChange={(e) => setSettings({ ...settings, footer: { ...footer, contactInfo: { ...footer.contactInfo, email: e.target.value } } })} className={inputClass} placeholder="Email" />
        <textarea value={footer.contactInfo.address} onChange={(e) => setSettings({ ...settings, footer: { ...footer, contactInfo: { ...footer.contactInfo, address: e.target.value } } })} rows={2} className={inputClass} placeholder="Address" />
        <input value={footer.socialLinks.instagram} onChange={(e) => setSettings({ ...settings, footer: { ...footer, socialLinks: { ...footer.socialLinks, instagram: e.target.value } } })} className={inputClass} placeholder="Instagram URL" />
        <input value={footer.socialLinks.facebook} onChange={(e) => setSettings({ ...settings, footer: { ...footer, socialLinks: { ...footer.socialLinks, facebook: e.target.value } } })} className={inputClass} placeholder="Facebook URL" />
        <input value={footer.socialLinks.whatsapp} onChange={(e) => setSettings({ ...settings, footer: { ...footer, socialLinks: { ...footer.socialLinks, whatsapp: e.target.value } } })} className={inputClass} placeholder="WhatsApp URL" />
        <input value={footer.copyright} onChange={(e) => setSettings({ ...settings, footer: { ...footer, copyright: e.target.value } })} className={inputClass} placeholder="Copyright text" />
        <button type="button" onClick={save} className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-black">Save footer settings</button>
      </div>
    </div>
  );
}

export function AdminSettingsPanel({ onError, onNotify }: { onError: (m: string) => void; onNotify: (m: string) => void }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [subscribers, setSubscribers] = useState<Array<{ email: string; createdAt: string }>>([]);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest<SiteSettings>('/admin/settings'),
      apiRequest<Array<{ email: string; createdAt: string }>>('/admin/newsletter'),
    ])
      .then(([s, subs]) => {
        setSettings(s);
        setSubscribers(subs);
      })
      .catch((err) => onError(err.message));
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    try {
      await apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      onNotify('Settings saved');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const savePassword = async () => {
    try {
      const result = await apiRequest<{ message: string }>('/admin/settings/password', {
        method: 'PUT',
        body: JSON.stringify({ password: adminPassword }),
      });
      onNotify(result.message);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const removeSubscriber = async (email: string) => {
    await apiRequest(`/admin/newsletter/${encodeURIComponent(email)}`, { method: 'DELETE' });
    setSubscribers((prev) => prev.filter((s) => s.email !== email));
    onNotify('Subscriber removed');
  };

  if (!settings) return <p className="text-zinc-500">Loading settings...</p>;

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-amber-100">Settings</h3>
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
        <h4 className="font-semibold text-white">Delivery charges</h4>
        <p className="text-sm text-zinc-400">
          Set how much customers pay for delivery. Orders at or above the free delivery threshold ship at no extra cost.
        </p>
        <label className="block text-sm text-zinc-400">
          Delivery charge (PKR)
          <input
            type="number"
            min="0"
            step="1"
            value={settings.shippingCost}
            onChange={(e) => setSettings({ ...settings, shippingCost: Number(e.target.value) })}
            className={inputClass}
            placeholder="e.g. 250"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Free delivery on orders over (PKR)
          <input
            type="number"
            min="0"
            step="1"
            value={settings.freeShippingThreshold}
            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
            className={inputClass}
            placeholder="e.g. 5000 — set 0 to always charge delivery"
          />
        </label>
      </section>
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
        <h4 className="font-semibold text-white">Store settings</h4>
        <input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} className={inputClass} placeholder="Store name" />
        <input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className={inputClass} placeholder="WhatsApp number / link" />
        <button type="button" onClick={saveSettings} className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-black">Save settings</button>
      </section>
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
        <h4 className="font-semibold text-white">Admin password</h4>
        <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className={inputClass} placeholder="New admin password" />
        <button type="button" onClick={savePassword} className="rounded-full border border-white/10 px-6 py-2 text-sm">Update password note</button>
      </section>
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h4 className="font-semibold text-white">Newsletter subscribers</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Date</th><th className="py-2">Actions</th></tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.email} className="border-t border-white/10 text-zinc-300">
                  <td className="py-3 pr-4">{sub.email}</td>
                  <td className="py-3 pr-4">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="py-3"><button type="button" onClick={() => removeSubscriber(sub.email)} className="text-red-300">Remove</button></td>
                </tr>
              ))}
              {!subscribers.length ? <tr><td colSpan={3} className="py-8 text-center text-zinc-500">No subscribers yet</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
