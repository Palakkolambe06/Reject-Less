import React, { useState } from 'react';
import { UserRole, DemoUser, DEMO_USERS } from '../../types/user';
import { storageService } from '../../services/storageService';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Leaf,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: DemoUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('palak.kolambe@mitadt.edu.in');
  const [signInPassword, setSignInPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('generator');
  const [organization, setOrganization] = useState('');

  // Field errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validateSignIn = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!signInEmail || !signInEmail.includes('@')) {
      errs.signInEmail = 'Valid work or institutional email is required.';
    }
    if (!signInPassword || signInPassword.length < 6) {
      errs.signInPassword = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignUp = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!name || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateSignIn()) return;

    setLoading(true);
    try {
      const res = await storageService.signIn(signInEmail, signInPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setGeneralError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setGeneralError('Network or local session error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateSignUp()) return;

    setLoading(true);
    try {
      const res = await storageService.signUp(name, email, role, organization);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setGeneralError(res.error || 'Registration failed.');
      }
    } catch {
      setGeneralError('Registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (user: DemoUser) => {
    setSignInEmail(user.email || 'palak.kolambe@mitadt.edu.in');
    setSignInPassword('demo1234');
    setErrors({});
    setGeneralError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {mode === 'signin' ? 'Sign In to RejectLess' : 'Create RejectLess Account'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === 'signin'
                    ? 'Enter your credentials or choose a demo role'
                    : 'Join the circular waste recovery network'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              aria-label="Close authentication modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setGeneralError(null);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setGeneralError(null);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {generalError && (
            <div className="m-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="p-6 space-y-4">
              {/* Quick Demo Account Selector */}
              <div className="space-y-1.5 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Instant Demo Workspace Access:
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoUser(DEMO_USERS[0])}
                    className={`px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                      signInEmail === DEMO_USERS[0].email
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">Generator</div>
                    <div className="text-xs truncate font-semibold">Palak (MIT)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoUser(DEMO_USERS[1])}
                    className={`px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                      signInEmail === DEMO_USERS[1].email
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">Recipient</div>
                    <div className="text-xs truncate font-semibold">Hadapsar Mill</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoUser(DEMO_USERS[5])}
                    className={`px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                      signInEmail === DEMO_USERS[5].email
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">Collector</div>
                    <div className="text-xs truncate font-semibold">Vikram (Fleet)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.signInEmail ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.signInEmail && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.signInEmail}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    demo: demo1234
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.signInPassword ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.signInPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.signInPassword}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password recovery flow: In this local prototype, use any demo account or register a new user.')}
                  className="text-emerald-800 hover:text-emerald-950 font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                >
                  Sign In to Workspace
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.name ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@company.org"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.email ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              {/* Role Selection (Waste Generator, Recipient/Recycler, Collector/Operator) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Operational Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('generator')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'generator'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-1">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold leading-tight">Generator</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Sorts & Offers</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recipient')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'recipient'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-2 ring-teal-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold leading-tight">Recipient</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Intake & Recycler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'operator'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800 mb-1">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold leading-tight">Collector</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Logistics Driver</div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Note: System Administrator access is restricted and cannot be created via public registration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Facility Name (Optional)
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Pune Central MRF / Eco Sort Hub"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.password ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                  {errors.password && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                      errors.confirmPassword ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                >
                  Create Account & Enter Workspace
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Footer Transparency Disclosure */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Prototype Security Notice: </strong> User profiles and demo authentication are managed in browser local storage. For enterprise production, integrate with Firebase Authentication or OAuth providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
