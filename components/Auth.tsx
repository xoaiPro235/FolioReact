
import React, { useState } from 'react';
import { useStore } from '../store';
import { Layout, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, isLoading } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Login State
  const [email, setEmail] = useState('alice@minijira.app');
  const [password, setPassword] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isLogin) {
      if (!email || !password) {
        setLoginError('Email and password are required');
        return;
      }
      await login(email, password);
    } else {
      // Mock Hash
      const hashedPassword = btoa(regPassword).split('').reverse().join('');
      register({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: hashedPassword
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4">
            <Layout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mini-Jira</h1>
          <p className="text-blue-100">Project management simplified.</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer ml-1 hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
            {isLogin && (
              <div className="mt-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                Demo Accounts (password: password123):<br />
                alice@minijira.app (Owner)<br />
                bob@minijira.app (Member)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};