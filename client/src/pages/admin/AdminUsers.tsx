import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  LockIcon,
  UnlockIcon,
  MoreVerticalIcon,
  ShieldIcon } from
'lucide-react';
const ADMIN_SIDEBAR = [
{
  icon: ActivityIcon,
  label: 'Dashboard',
  path: '/admin/dashboard'
},
{
  icon: UsersIcon,
  label: 'Users',
  path: '/admin/users'
},
{
  icon: PackageIcon,
  label: 'Categories',
  path: '/admin/categories'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/admin/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/admin/orders'
},
{
  icon: DollarSignIcon,
  label: 'Finance',
  path: '/admin/finance'
},
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

// Mock Data
const MOCK_USERS = [
{
  id: 'USR-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar:
  'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
  role: 'customer',
  status: 'active',
  joinDate: 'Oct 24, 2023',
  orders: 12
},
{
  id: 'USR-002',
  name: 'TechGadgets Official',
  email: 'contact@techgadgets.com',
  avatar:
  'https://ui-avatars.com/api/?name=Tech+Gadgets&background=ec4899&color=fff',
  role: 'seller',
  status: 'active',
  joinDate: 'Jan 15, 2023',
  orders: 1450
},
{
  id: 'USR-003',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  avatar:
  'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff',
  role: 'customer',
  status: 'locked',
  joinDate: 'Sep 10, 2023',
  orders: 0
},
{
  id: 'USR-004',
  name: 'Fashion Boutique',
  email: 'hello@fashionboutique.com',
  avatar:
  'https://ui-avatars.com/api/?name=Fashion+Boutique&background=f59e0b&color=fff',
  role: 'seller',
  status: 'active',
  joinDate: 'Mar 22, 2023',
  orders: 890
},
{
  id: 'USR-005',
  name: 'Admin User',
  email: 'admin@shophub.com',
  avatar:
  'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
  role: 'admin',
  status: 'active',
  joinDate: 'Jan 01, 2023',
  orders: 0
}];

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [usersList, setUsersList] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users?role=${roleFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleToggleLock = async (userId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/users/${userId}/lock`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error("Error toggling lock", error);
    }
  };
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="User Management"
      role="Admin">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
            <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto">
          Export Users
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Orders/Sales
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ?
              filteredUsers.map((user) =>
              <tr
                key={user._id}
                className="hover:bg-gray-50 transition-colors group">
                
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    
                        {user.role === 'admin' &&
                    <ShieldIcon className="h-3 w-3 mr-1" />
                    }
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {user.orders}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role !== 'admin' &&
                    <button
                      onClick={() =>
                      handleToggleLock(user._id, user.status)
                      }
                      className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-red-500 hover:text-green-600 hover:bg-green-50'}`}
                      title={
                      user.status === 'active' ?
                      'Lock User' :
                      'Unlock User'
                      }>
                      
                            {user.status === 'active' ?
                      <LockIcon className="h-4 w-4" /> :

                      <UnlockIcon className="h-4 w-4" />
                      }
                          </button>
                    }
                        <button
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="More Options">
                      
                          <MoreVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No users found matching the selected criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 &&
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">1</span> to{' '}
              <span className="font-medium text-gray-900">
                {filteredUsers.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredUsers.length}
              </span>{' '}
              results
            </p>
            <div className="flex space-x-2">
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>
              
                Previous
              </button>
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>
              
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </DashboardLayout>);

}