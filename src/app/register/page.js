"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/lib/validations/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const { reloadUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    async function onSubmit(data) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Hesabınız oluşturuldu! Hoş geldiniz 🎉');
                await reloadUser();
                router.push('/store');
                router.refresh();
            } else {
                toast.error(result.message || 'Kayıt başarısız.');
            }
        } catch (err) {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1507842217153-e21f20109a5d?auto=format&fit=crop&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 flex flex-col gap-6 animate-in zoom-in-95 duration-500 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Aramıza Katıl</h1>
                    <p className="text-gray-400 text-sm">Parsomen dünyasını keşfetmeye başla.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Kullanıcı Adı</label>
                        <input
                            {...register('username')}
                            type="text"
                            placeholder="örn: parsomen_okuru"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.username ? 'border-red-500' : ''}`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">E-Posta</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="ornek@eposta.com"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Şifre</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Güçlü bir şifre (En az 6 karakter)"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Şifre Tekrar</label>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="Şifrenizi tekrar girin"
                            className={`glass-input placeholder-gray-600 focus:placeholder-gray-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="glass-button bg-indigo-600 hover:bg-indigo-500 w-full text-center block shadow-lg shadow-indigo-500/20 disabled:opacity-50 mt-6 h-12"
                    >
                        {isSubmitting ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Kayıt Ol'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400 border-t border-white/10 pt-4">
                    Zaten hesabın var mı? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}
