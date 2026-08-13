import React, { useState } from 'react';
import { useStore } from '../store';

export const Login: React.FC = () => {
  const { users, setCurrentUser } = useStore();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
      u.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('Invalid name or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="T&Z Logo" className="h-24 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          T&Z Distribution ERP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4097d0] focus:border-[#4097d0] sm:text-sm"
                  placeholder="e.g. Md Masum"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4097d0] focus:border-[#4097d0] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4097d0] hover:bg-[#367fae] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4097d0]"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
