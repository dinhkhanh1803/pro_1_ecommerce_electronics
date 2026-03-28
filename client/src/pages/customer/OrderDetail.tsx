import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/CustomerLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  ChevronLeftIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
  AlertCircleIcon,
  XIcon,
  StarIcon } from
'lucide-react';
// Mock Data
const MOCK_ORDER = {
  id: 'ORD-2023-1042',
  date: 'Oct 24, 2023, 10:30 AM',
  status: 'processing',
  total: 129.99,
  subtotal: 119.99,
  shipping: 10.0,
  discount: 0,
  paymentMethod: 'Credit Card (Visa ending in 4242)',
  shippingAddress: {
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States'
  },
  items: [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones Pro',
    price: 99.99,
    qty: 1,
    image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80'
  },
  {
    id: '2',
    name: 'Premium Leather Case',
    price: 20.0,
    qty: 1,
    image:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80'
  }],

  timeline: [
  {
    status: 'pending',
    date: 'Oct 24, 2023, 10:30 AM',
    description: 'Order Placed'
  },
  {
    status: 'processing',
    date: 'Oct 24, 2023, 11:15 AM',
    description: 'Order Confirmed'
  },
  {
    status: 'shipping',
    date: null,
    description: 'Shipped'
  },
  {
    status: 'delivered',
    date: null,
    description: 'Delivered'
  }]

};
export function OrderDetail() {
  const { id } = useParams();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const order = MOCK_ORDER; // In real app, fetch order by id
  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const statuses = ['pending', 'processing', 'shipping', 'delivered'];
    const stepIndex = statuses.indexOf(stepStatus);
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };
  const StepIcon = ({ status, state }: {status: string;state: string;}) => {
    const icons = {
      pending: ClockIcon,
      processing: PackageIcon,
      shipping: TruckIcon,
      delivered: CheckCircleIcon
    };
    const Icon = icons[status as keyof typeof icons] || ClockIcon;
    let colorClass = 'text-gray-400 bg-gray-100 border-gray-300';
    if (state === 'completed')
    colorClass = 'text-white bg-indigo-600 border-indigo-600';
    if (state === 'current')
    colorClass =
    'text-indigo-600 bg-white border-indigo-600 ring-4 ring-indigo-50';
    if (state === 'cancelled')
    colorClass = 'text-white bg-red-500 border-red-500';
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 relative ${colorClass}`}>
        
        <Icon className="h-5 w-5" />
      </div>);

  };
  return (
    <CustomerLayout title="Order Details">
      <div className="mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              Order #{order.id}
            </h2>
            <StatusBadge status={order.status as any} />
          </div>
          <p className="text-sm text-gray-500">Placed on {order.date}</p>
        </div>

        <div className="flex items-center space-x-3">
          {['pending', 'processing'].includes(order.status) &&
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium text-sm">
            
              Cancel Order
            </button>
          }
          {order.status === 'delivered' &&
          <button
            onClick={() => setIsRateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm">
            
              Rate Product
            </button>
          }
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' &&
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-8">
            Order Status
          </h3>
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 hidden md:block" />

            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative">
              {order.timeline.map((step, index) => {
              const state = getStepStatus(step.status, order.status);
              return (
                <div
                  key={index}
                  className="flex md:flex-col items-start md:items-center relative z-10 w-full md:w-1/4">
                  
                    {/* Mobile Connecting Line */}
                    {index < order.timeline.length - 1 &&
                  <div className="absolute top-10 left-5 bottom-[-2rem] w-0.5 bg-gray-200 md:hidden" />
                  }

                    <StepIcon status={step.status} state={state} />

                    <div className="ml-4 md:ml-0 md:mt-4 md:text-center">
                      <p
                      className={`font-medium ${state === 'upcoming' ? 'text-gray-500' : 'text-gray-900'}`}>
                      
                        {step.description}
                      </p>
                      {step.date &&
                    <p className="text-xs text-gray-500 mt-1">
                          {step.date}
                        </p>
                    }
                    </div>
                  </div>);

            })}
            </div>
          </div>
        </div>
      }

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Items ({order.items.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) =>
              <li key={item.id} className="p-6 flex items-center space-x-4">
                  <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0" />
                
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {item.qty}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-semibold text-gray-900">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Summary & Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              {order.discount > 0 &&
              <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              }
              <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
              Shipping Address
            </h3>
            <address className="not-italic text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2 text-gray-500">
                {order.shippingAddress.phone}
              </p>
            </address>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
              Payment Method
            </h3>
            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
            onClick={() => setIsCancelModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            
              <XIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4 text-red-600">
              <AlertCircleIcon className="h-6 w-6" />
              <h3 className="text-lg font-bold">Cancel Order</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
              
                Keep Order
              </button>
              <button
              onClick={() => {
                setIsCancelModalOpen(false);
                // Handle cancel logic
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">
              
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      }

      {/* Rate Modal */}
      {isRateModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
            onClick={() => setIsRateModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            
              <XIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Rate Product
            </h3>

            <div className="flex items-center justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) =>
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none">
              
                  <StarIcon
                className={`h-8 w-8 transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              
                </button>
            )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a review (optional)
              </label>
              <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="What did you like or dislike about this product?" />
            
            </div>

            <div className="flex justify-end space-x-3">
              <button
              onClick={() => setIsRateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
              
                Cancel
              </button>
              <button
              onClick={() => {
                setIsRateModalOpen(false);
                // Handle submit logic
              }}
              disabled={rating === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              
                Submit Review
              </button>
            </div>
          </div>
        </div>
      }
    </CustomerLayout>);

}