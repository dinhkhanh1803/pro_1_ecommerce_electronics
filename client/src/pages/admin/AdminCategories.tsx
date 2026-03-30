import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  ActivityIcon,
  PlusIcon,
  Trash2Icon,
  FolderOpenIcon } from 'lucide-react';

const ADMIN_SIDEBAR = [
  { icon: ActivityIcon, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: UsersIcon, label: 'Users', path: '/admin/users' },
  { icon: FolderOpenIcon, label: 'Categories', path: '/admin/categories' },
  { icon: PackageIcon, label: 'Products', path: '/admin/products' },
  { icon: ShoppingBagIcon, label: 'Orders', path: '/admin/orders' },
  { icon: DollarSignIcon, label: 'Finance', path: '/admin/finance' },
  { icon: LayoutTemplateIcon, label: 'CMS', path: '/admin/cms' },
];

export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {}
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete category?")) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
      } catch (err) {}
    }
  };

  return (
    <DashboardLayout sidebarItems={ADMIN_SIDEBAR} title="Category Management" role="Admin">
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2 rounded-lg flex items-center h-[42px]">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add
          </button>
        </form>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map(cat => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{cat.name}</td>
                <td className="p-4 text-sm text-gray-500">{cat.description}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteCategory(cat._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
