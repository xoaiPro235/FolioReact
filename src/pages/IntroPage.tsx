import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Shield, Zap, Layout, Users } from 'lucide-react';

const IntroPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <main className="z-10 w-full max-w-6xl px-6 py-20 flex flex-col items-center text-center">
                {/* Logo/Icon */}
                <div className="mb-8 p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 animate-bounce-subtle">
                    <Box className="w-12 h-12 text-white" />
                </div>

                {/* Hero Section */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                    Manage Projects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Precision.</span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed">
                    Elevate your team's productivity with Folio. The all-in-one workspace for modern teams to collaborate, track, and deliver excellence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <button
                        onClick={() => navigate('/auth')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-105 flex items-center gap-2 group"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    <div className="glass-effect p-8 rounded-3xl text-left hover:translate-y-[-5px] transition-transform duration-300">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supersonic Speed</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Built with performance in mind. Experience lightning-fast updates and real-time collaboration.
                        </p>
                    </div>

                    <div className="glass-effect p-8 rounded-3xl text-left hover:translate-y-[-5px] transition-transform duration-300">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6">
                            <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visual Workflow</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Intuitive Kanban boards, calendars, and list views that adapt to how your team works.
                        </p>
                    </div>

                    <div className="glass-effect p-8 rounded-3xl text-left hover:translate-y-[-5px] transition-transform duration-300">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise Security</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Your data is safe with us. We use top-tier encryption and security best practices.
                        </p>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-24 flex flex-col items-center">
                    <div className="flex -space-x-3 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                        Trusted by over <span className="text-slate-900 dark:text-slate-200">2,000+</span> teams worldwide
                    </p>
                </div>
            </main>

            {/* Subtle floating shapes */}
            <div className="absolute top-1/4 right-[10%] w-64 h-64 bg-purple-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute bottom-1/4 left-[10%] w-64 h-64 bg-yellow-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
    );
};

export default IntroPage;
