import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FaTimes, FaSave } from 'react-icons/fa';
import Button from '../ui/Button';

export default function EditProfileModal({ user, onClose, onUpdate }) {
    const { reloadUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            username: user?.username || '',
            bio: user?.bio || '',
            avatar: user?.avatar || '',
            theme: user?.theme || 'dark', // 'dark' | 'light'
            font: user?.font || 'inter'   // 'inter' | 'montserrat'
        }
    });

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || 'Güncelleme başarısız');
                return;
            }

            toast.success('Profil güncellendi!');
            await reloadUser(); // Refresh auth context
            if (onUpdate) onUpdate(); // Refresh parent page data if needed
            onClose();
            // Force reload to apply theme/font if changed
            if (data.theme !== user.theme || data.font !== user.font) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1b2838] border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-[#1b2838] p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg">Profili Düzenle</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                        <input
                            {...register('username', { required: 'Kullanıcı adı zorunludur', minLength: { value: 3, message: 'En az 3 karakter' } })}
                            className="w-full bg-[#171a21] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Hakkında</label>
                        <textarea
                            {...register('bio', { maxLength: { value: 160, message: 'Maksimum 160 karakter' } })}
                            rows="3"
                            className="w-full bg-[#171a21] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Kendinden bahset..."
                        />
                        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Avatar URL</label>
                        <input
                            {...register('avatar')}
                            className="w-full bg-[#171a21] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Theme Preference */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tema</label>
                            <select {...register('theme')} className="w-full bg-[#171a21] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none">
                                <option value="dark">Karanlık (Varsayılan)</option>
                                <option value="light">Aydınlık</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Yazı Tipi</label>
                            <select {...register('font')} className="w-full bg-[#171a21] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none">
                                <option value="inter">Inter (Modern)</option>
                                <option value="montserrat">Montserrat (Karakterli)</option>
                            </select>
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 bg-[#171a21] flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        loading={saving}
                        variant="primary"
                        icon={<FaSave />}
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>

            </div>
        </div>
    );
}
