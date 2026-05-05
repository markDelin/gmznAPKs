import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, User, ArrowRight } from 'lucide-react';

export default function SellerLogin() {
    const [username, setUsername] = useState('');
    const [passkey, setPasskey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedSeller = localStorage.getItem('sellerData');
        if (storedSeller) {
            navigate('/seller/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/seller-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passkey })
            });
            
            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('sellerData', JSON.stringify(data.seller));
                navigate('/seller/dashboard');
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 relative overflow-hidden">
             {/* Background glow effects */}
             <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#ff6b44]/10 rounded-full blur-[100px] pointer-events-none" />
             
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[#1a1a1a] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Store className="w-10 h-10 text-[#ff6b44]" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Seller <span className="text-[#ff6b44]">Portal</span></h1>
                    <p className="text-gray-400 text-sm">Manage your products and orders securely.</p>
                </div>

                <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-[#ff6b44] focus:ring-1 focus:ring-[#ff6b44] outline-none transition-all placeholder-gray-600"
                                    placeholder="Enter your seller username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                             <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Passkey</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                                <input 
                                    type="password" 
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:border-[#ff6b44] focus:ring-1 focus:ring-[#ff6b44] outline-none transition-all placeholder-gray-600"
                                    placeholder="Enter your secure passkey"
                                    value={passkey}
                                    onChange={e => setPasskey(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-[#ff6b44] to-[#ff5528] hover:to-[#ff4010] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group mt-8 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]'}`}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Secure Login <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
