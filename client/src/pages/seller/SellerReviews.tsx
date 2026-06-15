import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StarRating } from '../../components/StarRating';
import {
  SearchIcon,
  FilterIcon,
  ReplyIcon,
  MoreVerticalIcon } from
'lucide-react';
import { SELLER_SIDEBAR } from '../../constants/sidebar';

// MOCK_REVIEWS removed, fetching from API

export function SellerReviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, []);

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

  const filteredReviews = reviews.filter((review) => {
    const isReplied = !!review.reply;
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'replied' 
        ? isReplied 
        : !isReplied;
        
    const matchesSearch = 
      (review.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (review.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const handleReplySubmit = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}/reply`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(prev => prev.map(r => r._id === id ? updatedReview : r));
      }
    } catch (err) {
      console.error(err);
    }
    setReplyingTo(null);
    setReplyText('');
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
          {loading ? (
            <div className="p-8 text-center text-gray-500 hover:bg-transparent">Đang tải...</div>
          ) : filteredReviews.length > 0 ?
          filteredReviews.map((review) =>
          <div
            key={review._id}
            className="p-6 hover:bg-gray-50 transition-colors">
            
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Info */}
                  <div className="w-full md:w-64 shrink-0">
                    <div className="flex items-center space-x-3">
                      <img
                    src={review.product?.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={review.product?.name || "Product"}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                  
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {review.product?.name || "Sản phẩm đã bị xóa"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {review._id.substring(0,8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {review.customer?.name || "Khách hàng"}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!review.reply &&
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
                            {new Date(review.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div> :

                <div className="mt-4">
                        {replyingTo === review._id ?
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
                        onClick={() => handleReplySubmit(review._id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        
                                Submit Reply
                              </button>
                            </div>
                          </div> :

                  <button
                    onClick={() => {
                      setReplyingTo(review._id);
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