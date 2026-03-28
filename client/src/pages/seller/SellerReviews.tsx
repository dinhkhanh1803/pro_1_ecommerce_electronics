import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StarRating } from '../../components/StarRating';
import {
  PackageIcon,
  ShoppingBagIcon,
  BarChart2Icon,
  TagIcon,
  StarIcon,
  MessageSquareIcon,
  SearchIcon,
  FilterIcon,
  ReplyIcon,
  MoreVerticalIcon } from
'lucide-react';
const SELLER_SIDEBAR = [
{
  icon: BarChart2Icon,
  label: 'Dashboard',
  path: '/seller/dashboard'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/seller/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/seller/orders'
},
{
  icon: TagIcon,
  label: 'Promotions',
  path: '/seller/promotions'
},
{
  icon: StarIcon,
  label: 'Reviews',
  path: '/seller/reviews'
},
{
  icon: MessageSquareIcon,
  label: 'Messages',
  path: '/seller/messages'
}];

// Mock Data
const MOCK_REVIEWS = [
{
  id: 'REV-001',
  productName: 'Wireless Noise-Cancelling Headphones Pro',
  productImage:
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
  customerName: 'Alice Johnson',
  rating: 5,
  date: 'Oct 24, 2023',
  comment:
  'Absolutely love these headphones! The noise cancellation is top-notch and they are very comfortable to wear for long periods.',
  reply:
  'Thank you so much for your kind words, Alice! We are thrilled to hear you are enjoying the headphones.',
  status: 'replied'
},
{
  id: 'REV-002',
  productName: 'Smart Watch Series 7',
  productImage:
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&q=80',
  customerName: 'Bob Brown',
  rating: 3,
  date: 'Oct 22, 2023',
  comment:
  'The watch is okay, but the battery life could be better. I have to charge it every day.',
  reply: null,
  status: 'pending'
},
{
  id: 'REV-003',
  productName: 'Premium Leather Backpack',
  productImage:
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80',
  customerName: 'Charlie Davis',
  rating: 4,
  date: 'Oct 20, 2023',
  comment:
  'Great quality leather and very spacious. The only downside is that it is a bit heavy even when empty.',
  reply: null,
  status: 'pending'
},
{
  id: 'REV-004',
  productName: 'Minimalist Desk Lamp',
  productImage:
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&q=80',
  customerName: 'Diana Evans',
  rating: 5,
  date: 'Oct 18, 2023',
  comment:
  'Looks perfect on my desk. The adjustable brightness is a great feature.',
  reply: 'Hi Diana, we are glad you like the lamp! Thanks for the review.',
  status: 'replied'
}];

export function SellerReviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const tabs = [
  {
    id: 'all',
    label: 'All Reviews'
  },
  {
    id: 'pending',
    label: 'Needs Reply'
  },
  {
    id: 'replied',
    label: 'Replied'
  }];

  const filteredReviews =
  activeTab === 'all' ?
  MOCK_REVIEWS :
  MOCK_REVIEWS.filter((review) => review.status === activeTab);
  const handleReplySubmit = (id: string) => {
    console.log(`Submitting reply for review ${id}: ${replyText}`);
    setReplyingTo(null);
    setReplyText('');
    // In a real app, this would update the review status and add the reply
  };
  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title="Customer Reviews"
      role="Seller">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            
              {tab.label}
              {activeTab === tab.id &&
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            }
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200">
          {filteredReviews.length > 0 ?
          filteredReviews.map((review) =>
          <div
            key={review.id}
            className="p-6 hover:bg-gray-50 transition-colors">
            
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Info */}
                  <div className="w-full md:w-64 shrink-0">
                    <div className="flex items-center space-x-3">
                      <img
                    src={review.productImage}
                    alt={review.productName}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                  
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {review.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {review.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {review.customerName}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.status === 'pending' &&
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Needs Reply
                          </span>
                    }
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                          <MoreVerticalIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <StarRating rating={review.rating} />
                    </div>

                    <p className="text-gray-700 text-sm mb-4">
                      {review.comment}
                    </p>

                    {/* Reply Section */}
                    {review.reply ?
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 ml-4 relative">
                        <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 transform -rotate-45"></div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-sm text-indigo-600">
                            Your Reply
                          </span>
                          <span className="text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div> :

                <div className="mt-4">
                        {replyingTo === review.id ?
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                            <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-sm mb-3"
                      rows={3} />
                    
                            <div className="flex justify-end space-x-2">
                              <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        
                                Cancel
                              </button>
                              <button
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        
                                Submit Reply
                              </button>
                            </div>
                          </div> :

                  <button
                    onClick={() => {
                      setReplyingTo(review.id);
                      setReplyText('');
                    }}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    
                            <ReplyIcon className="h-4 w-4 mr-1.5" />
                            Reply to Review
                          </button>
                  }
                      </div>
                }
                  </div>
                </div>
              </div>
          ) :

          <div className="p-8 text-center text-gray-500">
              No reviews found matching the selected criteria.
            </div>
          }
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 &&
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">1</span> to{' '}
              <span className="font-medium text-gray-900">
                {filteredReviews.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredReviews.length}
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