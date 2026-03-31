import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/CustomerLayout";
import { CameraIcon } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");

  // User Data
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: ""
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob ? data.dob.split('T')[0] : "",
        address: data.addresses?.[0] || ""
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        alert("Cập nhật thông tin thành công!");
        fetchProfile();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message || "Không thể cập nhật thông tin"}`);
      }
    } catch (err) { 
      console.error(err); 
      alert("Có lỗi xảy ra khi kết nối tới máy chủ.");
    }
    setLoading(false);
  };

  return (
    <CustomerLayout title="Thông tin cá nhân">
      <div className="max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <img
                src={`https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff&size=200`}
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl group-hover:opacity-80 transition-opacity"
              />
              <button className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                <CameraIcon className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 font-medium">{user?.email}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Member Since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mt-6 sm:mt-0">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                Quản trị viên
              </button>
            )}
            {user?.role === 'seller' && (
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Kênh người bán
              </button>
            )}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Họ và tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-60 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Địa chỉ Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl opacity-60 cursor-not-allowed font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Chưa cập nhật"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-60 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Ngày sinh</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                disabled={!isEditing}
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-60 font-medium"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Địa chỉ giao hàng</label>
              <textarea
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                rows={3}
                placeholder="Nhập địa chỉ của bạn để thanh toán nhanh hơn"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-60 font-medium resize-none"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-3.5 border border-gray-300 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </form>
      </div>
    </CustomerLayout>
  );
}
