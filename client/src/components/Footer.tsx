import React from 'react';
import { Link } from 'react-router-dom';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  MailIcon } from
'lucide-react';
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              About ShopHub
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted marketplace for quality products from verified
              sellers worldwide.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="hover:text-white transition-colors">
                  
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-white transition-colors">
                  
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-white transition-colors">
                  
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors">
                  
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors">
                  
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors">
                  
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/seller-policy"
                  className="hover:text-white transition-colors">
                  
                  Seller Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/payment-security"
                  className="hover:text-white transition-colors">
                  
                  Payment Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
              
              <button className="bg-indigo-500 px-4 py-2 rounded-r-xl hover:bg-indigo-600 transition-colors">
                <MailIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>);

}