import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, Lock, Mail, Building, User, ArrowRight, Sparkles, Key, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const DEFAULT_USERS: Array<UserProfile & { password: string }> = [
  {
    id: 'usr_admin',
    name: 'Sarah Chen',
    email: 'admin@enterprise.com',
    company: 'Apex Global Capital',
    role: 'Enterprise Administrator',
    password: 'admin123',
    avatar: 'SC'
  },
  {
    id: 'usr_client',
    name: 'Marcus Vance',
    email: 'client@business.com',
    company: 'Vanguard Retail Systems',
    role: 'Executive Client',
    password: 'client123',
    avatar: 'MV'
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

  // Load custom registered users
  const getUsers = (): Array<UserProfile & { password: string }> => {
    try {
      const stored = localStorage.getItem('narrative_users');
      if (stored) {
        return [...DEFAULT_USERS, ...JSON.parse(stored)];
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS;
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      setError('Client account not found. Please register or use a Demo Profile.');
      return;
    }

    if (found.password !== password) {
      setError('Invalid password. Check credentials and retry.');
      return;
    }

    const { password: _, ...profile } = found;
    onLogin(profile);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !company.trim() || !email.trim() || !password.trim()) {
      setError('All corporate registration fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters for security compliance.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('An enterprise account with this email address already exists.');
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

    setSuccessMsg('Account registered successfully! You can now log in.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top corporate navigation bar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-white text-sm">
            NA
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Narrative Analytics <span className="text-indigo-400 font-light text-xs uppercase px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60">Enterprise</span>
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> 256-Bit TLS Secured
          </span>
          <span className="text-slate-700">|</span>
          <span>Access Restricted to Verified Clients</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-[28px] p-8 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-800/40 rounded-full text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mb-4">
              <Lock className="w-3 h-3" /> Client Authentication Gateway
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isRegistering ? 'Register Client Portal' : 'Business Client Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-normal leading-relaxed">
              {isRegistering
                ? 'Create a secure enterprise workspace for your organization.'
                : 'Enter corporate credentials to access the 4-tier decision support engine.'}
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Organization / Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Corp"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRegistering ? 'Complete Corporate Registration' : 'Authenticate & Open Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Register and Sign In */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
            >
              {isRegistering
                ? '← Already have corporate credentials? Sign In'
                : 'Need client access? Register new business account →'}
            </button>
          </div>

          {/* Quick Demo Credentials Panel */}
          {!isRegistering && (
            <div className="mt-6 pt-5 border-t border-slate-800/60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" /> One-Click Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loginWithDemo('admin@enterprise.com', 'admin123')}
                  className="px-3 py-2 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Admin Demo</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@enterprise.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => loginWithDemo('client@business.com', 'client123')}
                  className="px-3 py-2 bg-slate-950/90 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Client Demo</p>
                  <p className="text-[10px] text-slate-400 truncate">client@business.com</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer security guarantee */}
      <footer className="py-4 border-t border-slate-900 text-center text-slate-400 text-xs z-10">
        <p>
          &copy; 2026 Narrative Analytics Inc. &bull; Compliant with SOC-2, HIPAA &amp; GDPR Enterprise Standards.
        </p>
      </footer>
    </div>
  );
};
