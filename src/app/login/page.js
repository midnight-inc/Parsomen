"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/lib/validations/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { reloadUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    });

    async function onSubmit(data) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Giriş başarılı! Yönlendiriliyorsunuz... 🎉');
                await reloadUser();
                router.push('/store');
                router.refresh();
            } else {
                toast.error(result.message || 'Giriş başarısız.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Bir hata oluştu.');
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519681393798-38e43269d877?auto=format&fit=crop&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 flex flex-col gap-6 animate-in zoom-in-95 duration-500 border border-white/10">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Parsomen</h1>
                    <p className="text-gray-400">Premium Kütüphane Platformu</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">E-Posta veya Kullanıcı Adı</label>
                        <input
                            {...register('identifier')}
                            type="text"
                            placeholder="Kullanıcı adı veya e-posta adresi"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.identifier ? 'border-red-500' : ''}`}
                        />
                        {errors.identifier && (
                            <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Şifre</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Şifreniz"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="glass-button bg-indigo-600 hover:bg-indigo-500 w-full text-center block shadow-lg shadow-indigo-500/20 disabled:opacity-50 h-12"
                    >
                        {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400">
                    Hesabın yok mu? <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
}
