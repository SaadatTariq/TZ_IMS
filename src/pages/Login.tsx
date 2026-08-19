import React, { useState } from 'react';
import { useStore } from '../store';

export const Login: React.FC = () => {
  const { users, setCurrentUser, addAuditLog } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
      (u.username?.toLowerCase() === username.trim().toLowerCase() || u.name.trim().toLowerCase() === username.trim().toLowerCase()) && 
      u.password === password
    );
    if (user) {
      setCurrentUser(user);
      addAuditLog({
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN',
        module: 'Auth',
        description: `User logged in successfully.`
      });
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2a4d7d] via-[#36609b] to-[#1e3a5f] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e3a5f] opacity-80" />
        
        <div className="relative z-10 flex items-center space-x-4">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <img src="/logo.png" alt="T&Z Logo" className="h-10 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <span className="text-2xl font-bold tracking-wider">T&Z DISTRIBUTION</span>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Enterprise <br/>
            Resource <br/>
            Planning
          </h1>
          <p className="text-lg text-blue-100 font-light leading-relaxed">
            Streamline your inventory, billing, and distribution workflows with intelligent automation and real-time insights.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-blue-200/60 font-medium">
          Developed by Mohammed Saadat Tariq
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:hidden mb-8">
              <div className="bg-white p-3 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60">
                <img src="/logo.png" alt="T&Z Logo" className="h-14 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please sign in to access your secure dashboard.
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 sm:rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#36609b]/50 focus:border-[#4097d0] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#36609b]/50 focus:border-[#4097d0] sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#36609b] hover:bg-[#367fae] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36609b] transition-all active:scale-[0.98]"
                >
                  Sign in
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-center lg:hidden mt-8">
            <p className="text-xs text-slate-400 font-medium">Developed by Mohammed Saadat Tariq</p>
          </div>
        </div>
      </div>
    </div>
  );
};
