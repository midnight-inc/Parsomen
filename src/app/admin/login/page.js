"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Check role
                if (data.user?.role !== 'ADMIN') {
                    toast.error('Yetkisiz erişim. Sadece adminler girebilir.');
                    setLoading(false);
                    return;
                }
                toast.success('Admin girişi başarılı');
                router.push('/admin');
            } else {
                toast.error(data.error || 'Giriş başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <FaUserShield className="text-5xl text-indigo-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
                    <p className="text-gray-500 text-sm">Sadece yetkili personel içindir.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs font-bold ml-1 mb-1 block">E-POSTA</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs font-bold ml-1 mb-1 block">ŞİFRE</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {loading && <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                        <FaLock /> Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}
