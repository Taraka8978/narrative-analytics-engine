import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { ArrowRight, Lock, Sparkles, CheckCircle2, User, Building, Mail, Key, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

const DEFAULT_USERS: Array<UserProfile & { password: string }> = [
  {
    id: 'usr_client',
    name: 'Marcus Vance',
    email: 'client@business.com',
    company: 'Vanguard Retail Systems',
    role: 'Executive Client',
    password: 'client123',
    avatar: 'MV'
  },
  {
    id: 'usr_admin',
    name: 'Sarah Chen',
    email: 'admin@enterprise.com',
    company: 'Apex Global Capital',
    role: 'Enterprise Administrator',
    password: 'admin123',
    avatar: 'SC'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin,
  initialMode = 'login' 
}) => {
  const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lock body scroll and prevent background jumping when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getUsers = (): Array<UserProfile & { password: string }> => {
    try {
      const stored = localStorage.getItem('narrative_users');
      if (stored) {
        return [...DEFAULT_USERS, ...JSON.parse(stored)];
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS;
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      setError('No business account found for this email. Please register or use a Demo profile.');
      return;
    }

    if (found.password !== password) {
      setError('Invalid password. Please check your credentials.');
      return;
    }

    const { password: _, ...profile } = found;
    onLogin(profile);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !company.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all corporate registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters for compliance.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('An enterprise account with this email already exists.');
      return;
    }

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';
    const newUser: UserProfile & { password: string } = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      role: 'Executive Client',
      password: password,
      avatar: initials
    };

    try {
      const customUsers = JSON.parse(localStorage.getItem('narrative_users') || '[]');
      customUsers.push(newUser);
      localStorage.setItem('narrative_users', JSON.stringify(customUsers));
    } catch {
      // fallback
    }

    setSuccessMsg('Account registered! You can now log in.');
    setIsRegistering(false);
    setPassword('');
  };

  const loginWithDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    const users = getUsers();
    const found = users.find(u => u.email === demoEmail);
    if (found) {
      const { password: _, ...profile } = found;
      onLogin(profile);
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-[36px] border border-black/[0.08] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.25)] p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FAF4ED] hover:bg-black hover:text-white text-[#0E0E10] flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Logo */}
        <div className="space-y-3 pt-1">
          <Logo size="sm" showWordmark={true} />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">
              {isRegistering ? 'Register Client Workspace' : 'Client & Partner Sign In'}
            </h3>
            <p className="text-xs text-[#71717A] mt-1">
              {isRegistering 
                ? 'Create credentials to access the data engine and persist your analysis history.' 
                : 'Sign in to access your organization’s analytical workspace.'}
            </p>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-3 mt-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-[#0E0E10] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-2.5 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0E0E10] uppercase tracking-wider mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Corp"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-2.5 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#0E0E10] uppercase tracking-wider mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-2.5 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0E0E10] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-2.5 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="nomu-pill w-full mt-2 py-3 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRegistering ? 'Complete Registration' : 'Sign In to Workspace'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-black/[0.06] text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-[#71717A] hover:text-[#0E0E10] font-semibold transition-colors cursor-pointer"
          >
            {isRegistering
              ? '← Have credentials? Sign in'
              : 'New client? Register business account →'}
          </button>
        </div>

        {/* 1-Click Demo Profiles */}
        {!isRegistering && (
          <div className="mt-4 pt-3 border-t border-black/[0.06] space-y-2">
            <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider text-center">
              1-Click Demo Profiles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginWithDemo('client@business.com', 'client123')}
                className="p-2.5 rounded-2xl bg-[#FAF4ED] hover:bg-white border border-black/[0.04] text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448]">Client Demo</p>
                <p className="text-[10px] text-[#71717A] truncate">client@business.com</p>
              </button>

              <button
                type="button"
                onClick={() => loginWithDemo('admin@enterprise.com', 'admin123')}
                className="p-2.5 rounded-2xl bg-[#FAF4ED] hover:bg-white border border-black/[0.04] text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448]">Admin Demo</p>
                <p className="text-[10px] text-[#71717A] truncate">admin@enterprise.com</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
