import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import type { Category } from '../../types';

type Props = {
  categories: Category[];
  onRefresh: () => Promise<void>;
  onNotify: (message: string) => void;
  onError: (message: string) => void;
};

export default function AdminCategories({ categories, onRefresh, onNotify, onError }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await apiRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryName.trim(), description: categoryDescription.trim() }),
      });
      setCategoryName('');
      setCategoryDescription('');
      await onRefresh();
      onNotify('Category created');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const addCollection = async () => {
    if (!collectionName.trim() || !selectedCategory?.id) return;
    try {
      await apiRequest('/admin/collections', {
        method: 'POST',
        body: JSON.stringify({
          name: collectionName.trim(),
          description: collectionDescription.trim(),
          categoryId: selectedCategory.id,
        }),
      });
      setCollectionName('');
      setCollectionDescription('');
      await onRefresh();
      onNotify('Collection created');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category and nested collections/products?')) return;
    try {
      await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
      await onRefresh();
      onNotify('Category deleted');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const deleteCollection = async (id: string) => {
    if (!window.confirm('Delete this collection and its products?')) return;
    try {
      await apiRequest(`/admin/collections/${id}`, { method: 'DELETE' });
      await onRefresh();
      onNotify('Collection deleted');
    } catch (err: any) {
      onError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-amber-100">Category Management</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h4 className="font-semibold text-white">Categories</h4>
          <div className="mt-4 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                <button type="button" onClick={() => setSelectedCategoryId(category.id)} className="text-left text-sm text-zinc-200">
                  {category.name}
                </button>
                <button type="button" onClick={() => deleteCategory(category.id)} className="text-xs text-red-300">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="New category" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            <input value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Description" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            <button type="button" onClick={addCategory} className="w-full rounded-full bg-amber-400 py-2 text-sm font-semibold text-black">Add category</button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h4 className="font-semibold text-white">Collections {selectedCategory ? `in ${selectedCategory.name}` : ''}</h4>
          <div className="mt-4 space-y-2">
            {selectedCategory?.collections?.map((collection) => (
              <div key={collection.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                <span>{collection.name} ({collection.productCount || 0})</span>
                <button type="button" onClick={() => deleteCollection(collection.id)} className="text-xs text-red-300">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <input value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="New collection" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            <input value={collectionDescription} onChange={(e) => setCollectionDescription(e.target.value)} placeholder="Description" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            <button type="button" onClick={addCollection} className="w-full rounded-full border border-amber-400/40 py-2 text-sm text-amber-100">Add collection</button>
          </div>
        </section>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Collections</th>
              <th className="py-2">Products</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-white/10 text-zinc-300">
                <td className="py-3 pr-4 text-white">{category.name}</td>
                <td className="py-3 pr-4">{category.collections?.length || 0}</td>
                <td className="py-3">{category.productCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
