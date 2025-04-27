import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, KeyIcon, MailIcon } from 'lucide-react';

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Green accent header */}
        <div className="bg-emerald-800 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Change Password</h2>
          <p className="text-emerald-100 text-center mt-2">Update your password securely</p>
        </div>
        
        {/* Form content */}
        <div className="p-6">
          <form className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-300">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-10 p-2.5"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-emerald-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-10 p-2.5"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-emerald-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors duration-200"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;