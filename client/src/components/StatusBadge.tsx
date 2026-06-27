import React from 'react';

interface StatusBadgeProps {
  status:
    | 'delivered'
    | 'pending'
    | 'processing'
    | 'shipping'
    | 'shipped'
    | 'cancelled'
    | 'rejected'
    | 'draft'
    | 'active'
    | 'returned';
  text?: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const styles = {
    delivered: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipping: 'bg-blue-100 text-blue-700',
    shipped: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
    returned: 'bg-purple-100 text-purple-700'
  };

  const labels: Record<string, string> = {
    delivered: 'Đã giao',
    active: 'Hoạt động',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    shipped: 'Đang giao hàng',
    cancelled: 'Đã hủy',
    rejected: 'Từ chối',
    draft: 'Nháp',
    returned: 'Trả hàng'
  };

  const displayText = text || labels[status?.toLowerCase()] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {displayText}
    </span>
  );
}