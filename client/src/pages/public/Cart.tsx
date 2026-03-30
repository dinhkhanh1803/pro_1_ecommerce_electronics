import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MinusIcon, PlusIcon, TagIcon, Trash2Icon, ArrowRightIcon } from 'lucide-react';

export function Cart() {
  const { cartItems, updateQuantity, removeItem, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  
  const discount = 0;
  const shipping = cartItems.length > 0 ? 15.00 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ?
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
            to="/products"
            className="inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
            
              Continue Shopping
            </Link>
          </div> :

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length > 0 ? cartItems.map((item) => (
              <div key={`${item.id}-${item.color}-${item.size}`} className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-24 h-24 rounded-2xl"
                />
                
                <div className="flex-1 w-full sm:ml-6 mt-4 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Color: {item.color || 'N/A'} • Size: {item.size || 'N/A'}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-2 sm:mt-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-3 bg-slate-50 border border-gray-200 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 font-semibold text-center text-gray-900">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="flex items-center space-x-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Trash2Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                Your cart is currently empty.
                <div className="mt-4">
                  <Link to="/" className="text-indigo-600 font-semibold hover:underline">Continue Shopping</Link>
                </div>
              </div>
            )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                      <TagIcon className="h-4 w-4" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 &&
                <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                }
                </div>

                <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Link
                to="/checkout"
                className={`flex items-center justify-center space-x-2 w-full text-center px-6 py-4 rounded-xl font-bold text-lg transition-colors ${cartItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                
                  <span>Proceed to Checkout</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>

                <Link
                to="/products"
                className="block w-full text-center text-indigo-600 hover:text-indigo-700 font-medium mt-4">
                
                  Continue Shopping
                </Link>

                {shipping > 0 &&
              <p className="text-sm text-gray-600 mt-4 text-center">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
              }
              </div>
            </div>
          </div>
        }
      </div>

      <Footer />
    </div>);

}