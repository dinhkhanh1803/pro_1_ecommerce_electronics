import React, { useState } from 'react';
import { CustomerLayout } from '../../components/CustomerLayout';
import { CameraIcon } from 'lucide-react';
export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    gender: 'male',
    dob: '1990-01-01'
  });
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Handle save logic here
  };
  return (
    <CustomerLayout title="Personal Information">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=128"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
            
            {isEditing &&
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors">
              
                <CameraIcon className="h-4 w-4" />
              </button>
            }
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Profile Picture
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500" />
            
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500" />
            
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500" />
            
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500" />
            
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 appearance-none">
              
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 mb-1">
              
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500" />
            
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          {isEditing ?
          <>
              <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              
                Cancel
              </button>
              <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              
                Save Changes
              </button>
            </> :

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            
              Edit Profile
            </button>
          }
        </div>
      </form>
    </CustomerLayout>);

}