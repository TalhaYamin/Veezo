import type { DashboardData } from '../../types/admin';

const statusRows = [
  { key: 'inStock', label: 'In Stock', color: 'bg-emerald-500' },
  { key: 'lowStock', label: 'Low Stock', color: 'bg-yellow-500' },
  { key: 'soldOut', label: 'Sold Out', color: 'bg-red-500' },
  { key: 'restocking', label: 'Restocking Soon', color: 'bg-blue-500' },
  { key: 'preorder', label: 'Pre-Order Available', color: 'bg-purple-500' },
  { key: 'newArrival', label: 'New Arrival', color: 'bg-amber-600' },
] as const;

function orderStatusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-900/30 text-yellow-400',
    processing: 'bg-yellow-900/30 text-yellow-400',
    shipped: 'bg-blue-900/30 text-blue-400',
    delivered: 'bg-emerald-900/30 text-emerald-400',
    cancelled: 'bg-red-900/30 text-red-400',
  };
  return map[status] || 'bg-zinc-800 text-zinc-300';
}

export default function AdminDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-amber-100">Dashboard Overview</h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`, 'From orders'],
          ['Total Orders', String(data.totalOrders), 'All time'],
          ['Total Products', String(data.totalProducts), 'In catalog'],
          ['Subscribers', String(data.newsletterCount), 'Newsletter'],
        ].map(([title, value, sub]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <p className="text-sm text-zinc-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h4 className="text-lg font-semibold text-amber-100">Inventory Status</h4>
          <div className="mt-4 space-y-3">
            {statusRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${row.color}`} />
                  <span className="text-sm text-zinc-300">{row.label}</span>
                </div>
                <span className="font-semibold text-white">{data.inventoryStatus[row.key]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h4 className="text-lg font-semibold text-amber-100">Inventory Alerts</h4>
          <div className="mt-4 space-y-3">
            {data.inventoryAlerts.length ? (
              data.inventoryAlerts.map((alert) => (
                <div
                  key={`${alert.name}-${alert.type}`}
                  className={`rounded-xl border-l-4 p-4 ${
                    alert.type === 'soldOut'
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-yellow-500 bg-yellow-900/20'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{alert.name}</p>
                  <p className="text-xs text-zinc-400">
                    {alert.type === 'soldOut' ? 'Out of stock' : `Only ${alert.stock} items left`}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No alerts</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h4 className="text-lg font-semibold text-amber-100">Recent Orders</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/10 text-zinc-300">
                  <td className="py-3 pr-4">#{order.id.slice(-8)}</td>
                  <td className="py-3 pr-4">{order.customerName || 'Guest'}</td>
                  <td className="py-3 pr-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-amber-100">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs capitalize ${orderStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!data.recentOrders.length ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No orders yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
