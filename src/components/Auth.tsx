import React, { useState } from 'react';
import { useStore } from '../store';
import { Layout, AlertCircle } from 'lucide-react';
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
        // --- LOGIC ĐĂNG NHẬP ---
        if (!email || !password) {
          setLoginError('Please enter both email and password.');
          return;
        }
        await login(email, password);
        // Nếu thành công, Store sẽ tự cập nhật currentUser -> App sẽ tự chuyển sang Workspace
      } else {
        // --- LOGIC ĐĂNG KÝ ---
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

        // Nếu đăng ký thành công mà không auto-login (tùy logic store), 
        // bạn có thể muốn tự chuyển về trang login:
        // setIsLogin(true);
        // setLoginError('Account created! Please log in.');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      // Hiển thị message lỗi từ Backend hoặc Store ném ra
      setLoginError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
      >
        {/* Header Logo */}
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4 relative z-10"
          >
            <Layout className="w-8 h-8 text-white" />
          </motion.div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Mini-Jira</h1>
            <p className="text-blue-100">Project management simplified.</p>
          </div>
          {/* Decorative circles in header */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {loginError && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
                  </motion.div>
                )}

                {isLogin ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center mt-6 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer ml-1 hover:underline"
                onClick={toggleMode}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};