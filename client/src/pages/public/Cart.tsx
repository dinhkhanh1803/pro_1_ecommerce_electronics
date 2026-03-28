import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, TagIcon } from 'lucide-react';
export function Cart() {
  const [couponCode, setCouponCode] = useState('');
  const [cartItems, setCartItems] = useState([
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    quantity: 1,
    image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    color: 'Black',
    size: 'One Size'
  },
  {
    id: '2',
    name: 'Smart Watch Series 5',
    price: 299.99,
    quantity: 1,
    image:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    color: 'Silver',
    size: '42mm'
  },
  {
    id: '3',
    name: 'Premium Leather Backpack',
    price: 89.99,
    quantity: 2,
    image:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
    color: 'Brown',
    size: 'Medium'
  }]
  );
  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
    items.map((item) =>
    item.id === id ?
    {
      ...item,
      quantity: Math.max(1, item.quantity + change)
    } :
    item
    )
    );
  };
  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const discount = 0;
  const total = subtotal + shipping - discount;
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
              {cartItems.map((item) =>
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-6">
              
                  <div className="flex items-center space-x-6">
                    <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg" />
                

                    <div className="flex-1">
                      <Link
                    to={`/product/${item.id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                    
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Color: {item.color} | Size: {item.size}
                      </p>
                      <p className="text-lg font-bold text-indigo-600 mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                    
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                    
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 transition-colors mt-2 flex items-center space-x-1">
                    
                        <TrashIcon className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
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
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
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
                className="block w-full bg-indigo-500 text-white text-center px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                
                  Proceed to Checkout
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