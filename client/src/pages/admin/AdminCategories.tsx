import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
} from "lucide-react";

import { ADMIN_SIDEBAR } from "../../constants/sidebar";

export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
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
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/api/categories/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/categories`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        setEditingId(null);
        fetchCategories();
      }
    } catch (err) {}
  };

  const handleStartEdit = (cat: any) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {}
    }
  };

  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Quản lý danh mục"
      role="Admin"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        </h3>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Mô tả
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-4 py-2 rounded-lg flex items-center h-[42px] whitespace-nowrap"
            >
              {editingId ? (
                <>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Cập nhật
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Thêm
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 px-4 py-2 rounded-lg flex items-center h-[42px] whitespace-nowrap"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">
                Tên
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">
                Mô tả
              </th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{cat.name}</td>
                <td className="p-4 text-sm text-gray-500">{cat.description}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                      title="Sửa danh mục"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Xóa danh mục"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
