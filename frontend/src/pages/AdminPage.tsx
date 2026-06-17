import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFormRequest, apiRequest } from '../lib/api';
import { imageUrl } from '../lib/images';
import type { Category, Collection, DashboardStats, Product } from '../types';

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('veezo_admin_token')));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Product['images']>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCollectionId) return products.filter((p) => p.collectionId === selectedCollectionId);
    if (selectedCategoryId) return products.filter((p) => p.categoryId === selectedCategoryId);
    return products;
  }, [products, selectedCategoryId, selectedCollectionId]);

  const notify = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = async () => {
    const [dashboard, tree, productList] = await Promise.all([
      apiRequest<DashboardStats>('/admin/dashboard'),
      apiRequest<Category[]>('/admin/categories'),
      apiRequest<Product[]>('/admin/products'),
    ]);
    setStats(dashboard);
    setCategories(tree);
    setProducts(productList);
    if (!selectedCategoryId && tree[0]) setSelectedCategoryId(tree[0].id);
    if (!selectedCollectionId && tree[0]?.collections?.[0]) setSelectedCollectionId(tree[0].collections[0].id);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    load().catch((err) => setError(err.message));
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

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    await apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: categoryName.trim(), description: categoryDescription.trim() }),
    });
    setCategoryName('');
    setCategoryDescription('');
    await load();
    notify('Category created');
  };

  const addCollection = async () => {
    if (!collectionName.trim() || !selectedCategoryId) return;
    await apiRequest('/admin/collections', {
      method: 'POST',
      body: JSON.stringify({
        name: collectionName.trim(),
        description: collectionDescription.trim(),
        categoryId: selectedCategoryId,
      }),
    });
    setCollectionName('');
    setCollectionDescription('');
    await load();
    notify('Collection created');
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category and all nested collections/products?')) return;
    await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
    setSelectedCategoryId('');
    setSelectedCollectionId('');
    await load();
    notify('Category deleted');
  };

  const deleteCollection = async (id: string) => {
    if (!window.confirm('Delete this collection and all its products?')) return;
    await apiRequest(`/admin/collections/${id}`, { method: 'DELETE' });
    setSelectedCollectionId('');
    await load();
    notify('Collection deleted');
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setForm({ ...emptyForm, collectionId: selectedCollectionId || '' });
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
    if (!form.collectionId) {
      setError('Select a collection for this product.');
      return;
    }
    if (!editingProductId && imageFiles.length === 0) {
      setError('Upload at least one product image.');
      return;
    }

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
    if (editingProductId && existingImages.length) {
      data.append('images', JSON.stringify(existingImages));
    }

    if (editingProductId) {
      await apiFormRequest(`/admin/products/${editingProductId}`, data, 'PUT');
      notify('Product updated');
    } else {
      await apiFormRequest('/admin/products', data, 'POST');
      notify('Product created');
    }

    resetProductForm();
    setError('');
    await load();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
    if (editingProductId === id) resetProductForm();
    await load();
    notify('Product deleted');
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Catalog management</h1>
          <p className="mt-2 text-sm text-zinc-400">Categories → Collections → Products</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:text-white">View store</Link>
          <button type="button" onClick={logout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:text-white">Logout</button>
        </div>
      </header>

      {success ? <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}
      {error ? <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      {stats ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Products', stats.totalProducts],
            ['Stock units', stats.totalStock],
            ['Low stock', stats.lowStock],
            ['Categories', stats.categories],
            ['Orders', stats.orders],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-amber-100">{value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Categories</h2>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  <div
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm ${selectedCategoryId === category.id ? 'bg-amber-400/20 text-amber-100' : 'text-zinc-300 hover:bg-white/5'}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setSelectedCollectionId(category.collections?.[0]?.id || '');
                        setForm((f) => ({ ...f, collectionId: category.collections?.[0]?.id || '' }));
                      }}
                      className="flex-1 text-left"
                    >
                      {category.name}
                    </button>
                    <button type="button" onClick={() => deleteCategory(category.id)} className="text-xs text-zinc-500 hover:text-red-300">×</button>
                  </div>
                  {selectedCategoryId === category.id ? (
                    <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {category.collections?.map((collection) => (
                        <button
                          key={collection.id}
                          type="button"
                          onClick={() => {
                            setSelectedCollectionId(collection.id);
                            setForm((f) => ({ ...f, collectionId: collection.id }));
                          }}
                          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs ${selectedCollectionId === collection.id ? 'bg-white/10 text-amber-100' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {collection.name} ({collection.productCount || 0})
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="New category" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <input value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Description" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <button type="button" onClick={addCategory} className="w-full rounded-full bg-amber-400 py-2 text-sm font-semibold text-black">Add category</button>
            </div>
          </section>

          {selectedCategory ? (
            <section className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Collections in {selectedCategory.name}</h2>
              <div className="mt-3 space-y-2">
                {selectedCategory.collections?.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                    <span>{collection.name}</span>
                    <button type="button" onClick={() => deleteCollection(collection.id)} className="text-xs text-zinc-500 hover:text-red-300">Delete</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <input value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="New collection" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
                <input value={collectionDescription} onChange={(e) => setCollectionDescription(e.target.value)} placeholder="Description" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
                <button type="button" onClick={addCollection} className="w-full rounded-full border border-amber-400/40 py-2 text-sm text-amber-100">Add collection</button>
              </div>
            </section>
          ) : null}
        </aside>

        <section className="space-y-6">
          <form onSubmit={saveProduct} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">{editingProductId ? 'Edit product' : 'Add product'}</h2>
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
              <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} placeholder="Old price (optional)" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes (comma separated)" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
              <input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="Status" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured on homepage
            </label>

            <div className="mt-4">
              <p className="text-sm text-zinc-400">Product images (multiple allowed)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="mt-2 w-full text-sm text-zinc-400"
              />
              {existingImages.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <div key={`${img.url}-${index}`} className="relative">
                      <img src={imageUrl(img.url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      <button type="button" onClick={() => removeExistingImage(index)} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">×</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black">
                {editingProductId ? 'Update product' : 'Create product'}
              </button>
              {editingProductId ? (
                <button type="button" onClick={resetProductForm} className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300">Cancel edit</button>
              ) : null}
            </div>
          </form>

          <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">
              Products {selectedCollectionId ? 'in selected collection' : selectedCategoryId ? 'in selected category' : ''}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <tr>
                    <th className="py-2 pr-4">Image</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Collection</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-white/10 text-zinc-300">
                      <td className="py-3 pr-4">
                        {product.image ? <img src={imageUrl(product.image)} alt="" className="h-12 w-12 rounded-lg object-cover" /> : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.images.length} image(s)</p>
                      </td>
                      <td className="py-3 pr-4">{product.collection?.name}</td>
                      <td className="py-3 pr-4">${product.price}</td>
                      <td className="py-3 pr-4">{product.stock}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => editProduct(product)} className="text-amber-200 hover:text-white">Edit</button>
                          <button type="button" onClick={() => deleteProduct(product.id)} className="text-red-300 hover:text-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredProducts.length ? <p className="mt-4 text-sm text-zinc-500">No products in this selection.</p> : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
