import React, { useState } from 'react';
import { useStore } from '../store';
import { Layout, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth: React.FC = () => {
  const { login, register, isLoading } = useStore();

  // State quản lý tab (Đăng nhập / Đăng ký)
  const [isLogin, setIsLogin] = useState(true);

  // State thông báo lỗi
  const [loginError, setLoginError] = useState('');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Hàm chuyển đổi tab (Xóa dữ liệu cũ cho sạch)
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setLoginError('');
    // Reset form
    setEmail(''); setPassword('');
    setRegFirstName(''); setRegLastName(''); setRegEmail(''); setRegPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Xóa lỗi cũ

    try {
      if (isLogin) {
        if (!email || !password) {
          setLoginError('Please enter both email and password.');
          return;
        }
        await login(email, password);
      } else {
        if (!regFirstName || !regLastName || !regEmail || !regPassword) {
          setLoginError('Please fill in all fields.');
          return;
        }

        await register({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword
        });
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setLoginError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">

      {/* LEFT PANEL: Immersive Brand & Decorative Patterns (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 group">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 animate-gradient-xy"></div>

        {/* Abstract Patterns (Họa tiết) */}
        <div className="absolute inset-0 opacity-40">
          <svg className="absolute top-0 right-0 w-full h-full text-white/5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Content Column */}
        <div className="relative z-10 w-full flex flex-col justify-center px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 p-2 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-blue-200 text-sm font-bold mb-8 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Future of Work
            </div>

            <h2 className="text-5xl xl:text-7xl font-black text-white leading-tight mb-8">
              Your vision, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">perfectly organized.</span>
            </h2>

            <p className="text-xl text-slate-300 max-w-lg leading-relaxed mb-12">
              Join the world's most innovative teams using Folio to build, ship, and scale their most ambitious projects.
            </p>
          </motion.div>
        </div>

        {/* Floating Brand Logo in corner */}
        <div className="absolute top-10 left-10 flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">Folio</span>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-950">
        {/* Mobile-only background pops */}
        <div className="lg:hidden absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[460px] z-10"
        >
          {/* Logo Brand (Mobile only) */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
              <Layout className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Folio</h2>
          </div>

          <div className="glass-effect dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 overflow-hidden border border-white dark:border-slate-800/80 backdrop-blur-3xl min-h-[600px] flex flex-col">
            <div className="flex-1 p-8 sm:p-10">
              <div className="mb-10 text-center lg:text-left">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {isLogin ? 'Enter your details to manage your projects' : 'Create an account to join the community'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{loginError}</p>
                      </motion.div>
                    )}

                    {isLogin ? (
                      <div className="space-y-5">
                        <div className="group">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1 transition-colors group-focus-within:text-blue-600">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="name@company.com"
                            required
                          />
                        </div>
                        <div className="group">
                          <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors group-focus-within:text-blue-600">Password</label>
                            <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Forgot password?</button>
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">First Name</label>
                            <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="John" required />
                          </div>
                          <div className="group">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Last Name</label>
                            <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Doe" required />
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Work Email</label>
                          <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="john@company.com" required />
                        </div>
                        <div className="group">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Create Password</label>
                          <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" required />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-5 px-4 rounded-2xl transition-all flex items-center justify-center mt-10 shadow-2xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 group"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center gap-3">
                          {isLogin ? 'Sign In' : 'Join Folio'}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </button>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-8 sm:p-10 bg-slate-100/30 dark:bg-slate-800/30 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-bold">
                {isLogin ? "New to the platform?" : "Already part of the team?"}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 font-black ml-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Create free account' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;