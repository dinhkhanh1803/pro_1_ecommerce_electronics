import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  CopyIcon,
  CheckIcon,
  XIcon,
  RefreshCwIcon,
} from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api`;

import { SELLER_SIDEBAR } from '../../constants/sidebar';

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrder: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  status: 'active',
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function SellerPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token');

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setFormError('Vui lòng nhập mã.'); return; }
    if (!form.value && form.type !== 'shipping') { setFormError('Vui lòng nhập giá trị giảm.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`${API}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          value: Number(form.value) || 0,
          minOrder: Number(form.minOrder) || 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message || 'Tạo thất bại'); return; }
      setPromotions(prev => [data, ...prev]);
      setIsModalOpen(false);
      setForm(emptyForm);
    } catch {
      setFormError('Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try {
      await fetch(`${API}/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = promotions.filter(p =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const discountLabel = (p: any) => {
    if (p.type === 'percentage') return `${p.value}% Giảm`;
    if (p.type === 'fixed') return `Giảm ${p.value.toLocaleString('vi-VN')}đ`;
    return 'Miễn phí ship';
  };

  return (
    <DashboardLayout sidebarItems={SELLER_SIDEBAR} title="Khuyến mãi" role="Seller">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã giảm giá..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setForm(emptyForm); setFormError(''); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo mã giảm giá
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Mã', 'Loại giảm', 'Đơn tối thiểu', 'Lượt dùng', 'Thời gian', 'Trạng thái', ''].map(h => (
                  <th key={h} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có mã giảm giá nào</td></tr>
              ) : filtered.map(promo => (
                <tr key={promo._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-sm">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => handleCopy(promo.code)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Copy"
                      >
                        {copiedCode === promo.code
                          ? <CheckIcon className="h-4 w-4 text-green-500" />
                          : <CopyIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                      promo.type === 'percentage' ? 'bg-purple-100 text-purple-700' :
                      promo.type === 'fixed' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {discountLabel(promo)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {promo.minOrder > 0 ? promo.minOrder.toLocaleString('vi-VN') + 'đ' : 'Không giới hạn'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''} lần
                      </span>
                      {promo.usageLimit && (
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(promo.usageCount / promo.usageLimit) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : '—'}
                    {promo.endDate && ` → ${new Date(promo.endDate).toLocaleDateString('vi-VN')}`}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={promo.status as any} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Tạo mã giảm giá</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá *</label>
                <div className="flex gap-2">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="VD: SUMMER20"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-mono uppercase text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, code: generateCode() }))}
                    className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
                  >
                    <RefreshCwIcon className="h-3.5 w-3.5" />
                    Tự động
                  </button>
                </div>
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="percentage">% Phần trăm</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                    <option value="shipping">Miễn phí ship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị {form.type === 'percentage' ? '(%)' : form.type === 'fixed' ? '(đ)' : '(bỏ qua)'}
                  </label>
                  <input
                    name="value"
                    type="number"
                    value={form.value}
                    onChange={handleFormChange}
                    disabled={form.type === 'shipping'}
                    placeholder={form.type === 'percentage' ? '20' : '50000'}
                    min="0"
                    max={form.type === 'percentage' ? '100' : undefined}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Min order + Usage limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (đ)</label>
                  <input
                    name="minOrder"
                    type="number"
                    value={form.minOrder}
                    onChange={handleFormChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lượt dùng</label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={form.usageLimit}
                    onChange={handleFormChange}
                    placeholder="Để trống = không giới hạn"
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="active">Kích hoạt</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>

              {formError && (
                <p className="text-red-500 text-sm">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 text-sm disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}