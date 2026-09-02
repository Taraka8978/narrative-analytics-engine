import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { ArrowRight, Lock, Sparkles, CheckCircle2, User, Building, Mail, Key } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
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

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFF9F6] text-[#0E0E10] font-sans antialiased selection:bg-[#FF7448] selection:text-white relative overflow-hidden">
      {/* Floating Pill Top Bar */}
      <div className="pt-4 px-4 sm:px-6 w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] px-6 py-3.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2">
            <Logo size="sm" showWordmark={true} />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#71717A]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4ED] text-[#0E0E10]">
              <span className="w-2 h-2 rounded-full bg-[#FF7448]" /> Verified Client Access
            </span>
          </div>
        </div>
      </div>

      {/* Main Authentication Centerpiece */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header Typography */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0E0E10] leading-tight">
              {isRegistering ? 'Register Client Portal' : 'Sign in to your portal'}
            </h1>
            <p className="text-sm text-[#71717A] font-normal leading-relaxed max-w-sm mx-auto">
              {isRegistering
                ? 'Create a secure workspace to analyze datasets and generate executive presentations.'
                : 'Turn your raw datasets into decision-grade intelligence in 5 minutes.'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[32px] border border-black/[0.06] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative">
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-medium flex items-start gap-2">
                <span className="font-bold">Notice:</span> {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Corp"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRegistering ? 'Create Client Account' : 'Access Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/[0.06] text-center">
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
                  ? '← Already have credentials? Sign in'
                  : 'New client? Register business account →'}
              </button>
            </div>

            {/* Tactile Demo Chips */}
            {!isRegistering && (
              <div className="mt-6 pt-5 border-t border-black/[0.06] space-y-2.5">
                <p className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider text-center">
                  Instant Demo Profiles:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loginWithDemo('client@business.com', 'client123')}
                    className="p-3 rounded-2xl bg-[#FAF4ED] hover:bg-[#F2ECE3] border border-black/[0.04] text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448] transition-colors">Client Demo</p>
                    <p className="text-[10px] text-[#71717A] truncate">client@business.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginWithDemo('admin@enterprise.com', 'admin123')}
                    className="p-3 rounded-2xl bg-[#FAF4ED] hover:bg-[#F2ECE3] border border-black/[0.04] text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448] transition-colors">Admin Demo</p>
                    <p className="text-[10px] text-[#71717A] truncate">admin@enterprise.com</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#71717A]">
        &copy; 2026 narrative. decision suite &bull; Enterprise SOC-2 &amp; GDPR Compliant
      </footer>
    </div>
  );
};
