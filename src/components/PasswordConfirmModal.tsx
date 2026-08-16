import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

export const PasswordConfirmModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  const { currentUser } = useStore();
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPwd('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === currentUser?.password) {
      setPwd('');
      setError('');
      onConfirm();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Action</h3>
        <p className="text-sm text-slate-500 mb-6">Please enter your password to confirm this database operation.</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            autoFocus 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 text-slate-800 focus:border-[#36609b] focus:ring-4 focus:ring-[#36609b]/10 outline-none transition-all" 
            value={pwd} 
            onChange={e => { setPwd(e.target.value); setError(''); }} 
            placeholder="Your password"
          />
          {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-all font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-[#36609b] text-white shadow-md shadow-[#36609b]/20 hover:-translate-y-0.5 transition-all rounded-xl font-medium">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};
