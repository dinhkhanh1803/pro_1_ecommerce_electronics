import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  CreditCardIcon,
  WalletIcon,
  BanknoteIcon,
  MapPinIcon,
  TruckIcon } from
'lucide-react';
export function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedAddress, setSelectedAddress] = useState('new');
  const savedAddresses = [
  {
    id: '1',
    name: 'Home',
    fullName: 'John Doe',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  },
  {
    id: '2',
    name: 'Office',
    fullName: 'John Doe',
    phone: '+1 234 567 8900',
    address: '456 Business Ave, Suite 200',
    city: 'New York',
    state: 'NY',
    zip: '10002'
  }];

  const cartItems = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    quantity: 1,
    image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Smart Watch Series 5',
    price: 299.99,
    quantity: 1,
    image:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'
  }];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPinIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-3 mb-6">
                {savedAddresses.map((address) =>
                <label
                  key={address.id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress === address.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                    <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddress === address.id}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="sr-only" />
                  
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {address.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.fullName}
                        </p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {address.address}
                          <br />
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                      {selectedAddress === address.id &&
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Selected
                        </span>
                    }
                    </div>
                  </label>
                )}

                <label
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress === 'new' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  <input
                    type="radio"
                    name="address"
                    value="new"
                    checked={selectedAddress === 'new'}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="sr-only" />
                  
                  <p className="font-semibold text-gray-900">
                    + Add New Address
                  </p>
                </label>
              </div>

              {/* New Address Form */}
              {selectedAddress === 'new' &&
              <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TruckIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="delivery"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600" />
                    
                    <div>
                      <p className="font-semibold text-gray-900">
                        Standard Delivery
                      </p>
                      <p className="text-sm text-gray-600">3-5 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">Free</span>
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="delivery"
                      className="w-4 h-4 text-indigo-600" />
                    
                    <div>
                      <p className="font-semibold text-gray-900">
                        Express Delivery
                      </p>
                      <p className="text-sm text-gray-600">1-2 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">$9.99</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCardIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3" />
                  
                  <BanknoteIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">
                    Cash on Delivery
                  </span>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3" />
                  
                  <WalletIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">VNPay</span>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3" />
                  
                  <WalletIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">Momo</span>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3" />
                  
                  <CreditCardIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">
                    Credit/Debit Card
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) =>
                <div key={item.id} className="flex items-center space-x-3">
                    <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg" />
                  
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="w-full bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                Place Order
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>);

}