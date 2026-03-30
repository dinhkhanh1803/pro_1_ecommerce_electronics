import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "../../components/CustomerLayout"; // Giả sử bạn có layout này
import { CameraIcon } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    dob?: string;
    role?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      gender: parsedUser.gender || "",
      dob: parsedUser.dob || "",
    });
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const updatedUser = {
      ...user,
      ...formData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goToRoleDashboard = () => {
    if (!user?.role) return;
    switch (user.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "shipper":
        navigate("/deliveries");
        break;
      default:
        break;
    }
  };

  return (
    <CustomerLayout title="Personal Information">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff&size=128`}
              className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-sm"
            />
            {isEditing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 text-white transition-colors bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Profile Picture
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 appearance-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label
              htmlFor="dob"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end pt-4 space-x-4 border-t border-gray-100">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}

          {/* Role-based Dashboard Button */}
          {user?.role && (
            <button
              type="button"
              onClick={goToRoleDashboard}
              className={`px-6 py-2 font-medium text-white transition-colors bg-green-600 rounded-xl hover:bg-green-700 ${user.role === 'customer' ? 'hidden' : ''}`}
            >
              {user.role === "admin"
                ? "Admin Dashboard"
                : user.role === "seller"
                  ? "Seller Dashboard"
                  : user.role === "shipper"
                    ? "Deliveries"
                    : ""}
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-6 py-2 font-medium text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </form>
    </CustomerLayout>
  );
}
