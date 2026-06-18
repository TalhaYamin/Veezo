import { useState } from 'react';
import { apiFormRequest, apiRequest } from '../../lib/api';
import { imageUrl } from '../../lib/images';
import type { Category, Product } from '../../types';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  stock: string;
  badge: string;
  status: string;
  sizes: string;
  featured: boolean;
  collectionId: string;
};

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  oldPrice: '',
  stock: '10',
  badge: 'New',
  status: 'Active',
  sizes: 'S, M, L',
  featured: false,
  collectionId: '',
};

type Props = {
  categories: Category[];
  products: Product[];
  onRefresh: () => Promise<void>;
  onNotify: (message: string) => void;
  onError: (message: string) => void;
};

export default function AdminProducts({ categories, products, onRefresh, onNotify, onError }: Props) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Product['images']>([]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setExistingImages([]);
  };

  const editProduct = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      stock: String(product.stock),
      badge: product.badge,
      status: product.status,
      sizes: product.sizes.join(', '),
      featured: product.featured,
      collectionId: product.collectionId,
    });
    setExistingImages(product.images);
    setImageFiles([]);
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.collectionId) return onError('Select a collection for this product.');
    if (!editingProductId && imageFiles.length === 0) return onError('Upload at least one product image.');

    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    if (form.oldPrice) data.append('oldPrice', form.oldPrice);
    data.append('stock', form.stock);
    data.append('badge', form.badge);
    data.append('status', form.status);
    data.append('sizes', form.sizes);
    data.append('featured', String(form.featured));
    data.append('collectionId', form.collectionId);
    imageFiles.forEach((file) => data.append('imageFiles', file));
    if (editingProductId && existingImages.length) data.append('images', JSON.stringify(existingImages));

    try {
      if (editingProductId) {
        await apiFormRequest(`/admin/products/${editingProductId}`, data, 'PUT');
        onNotify('Product updated');
      } else {
        await apiFormRequest('/admin/products', data, 'POST');
        onNotify('Product created');
      }
      resetProductForm();
      await onRefresh();
    } catch (err: any) {
      onError(err.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      if (editingProductId === id) resetProductForm();
      await onRefresh();
      onNotify('Product deleted');
    } catch (err: any) {
      onError(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Product Management</h3>

      <form onSubmit={saveProduct} className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h4 className="text-lg font-semibold">{editingProductId ? 'Edit product' : 'Add product'}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <select required value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none">
            <option value="">Select collection</option>
            {categories.flatMap((cat) =>
              (cat.collections || []).map((col) => (
                <option key={col.id} value={col.id}>{cat.name} / {col.name}</option>
              ))
            )}
          </select>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} placeholder="Old price" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none">
            {['Active', 'New Arrival', 'Limited', 'Best Seller'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured on homepage
        </label>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="mt-4 w-full text-sm text-zinc-400" />
        {existingImages.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {existingImages.map((img, index) => (
              <div key={`${img.url}-${index}`} className="relative">
                <img src={imageUrl(img.url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button type="button" onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== index))} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">×</button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex gap-3">
          <button type="submit" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black">{editingProductId ? 'Update' : 'Create'}</button>
          {editingProductId ? <button type="button" onClick={resetProductForm} className="rounded-full border border-white/10 px-5 py-2 text-sm">Cancel</button> : null}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Product</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {product.image ? <img src={imageUrl(product.image)} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null}
                    <span className="font-medium text-white">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">{product.category?.name || '—'}</td>
                <td className="py-3 pr-4">${product.price}</td>
                <td className="py-3 pr-4">{product.stock}</td>
                <td className="py-3 pr-4">{product.status}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editProduct(product)} className="text-amber-200">Edit</button>
                    <button type="button" onClick={() => deleteProduct(product.id)} className="text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
