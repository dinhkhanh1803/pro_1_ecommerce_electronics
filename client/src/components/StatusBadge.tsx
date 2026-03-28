import React from 'react';
interface StatusBadgeProps {
  status:
  'delivered' |
  'pending' |
  'processing' |
  'shipping' |
  'cancelled' |
  'rejected' |
  'draft' |
  'active';
  text?: string;
}
export function StatusBadge({ status, text }: StatusBadgeProps) {
  const styles = {
    delivered: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipping: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700'
  };
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      
      {displayText}
    </span>);

}