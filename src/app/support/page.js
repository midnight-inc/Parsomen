"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaQuestionCircle, FaEnvelope, FaPaperPlane, FaChevronDown, FaCheck, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SupportPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        name: user?.username || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });

    // FAQ State
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "Parşomen tamamen ücretsiz mi?",
            a: "Evet, Parşomen'i kullanmak ve kütüphaneye erişmek tamamen ücretsizdir. Bazı özel kozmetik ürünler puan dükkanından alınabilir."
        },
        {
            q: "Kendi kitabımı nasıl yayınlayabilirim?",
            a: "Şu an için sadece onaylı yazarlar kitap yayınlayabilir. Başvuru için iletişim formunu kullanabilirsiniz."
        },
        {
            q: "Şifremi unuttum, ne yapmalıyım?",
            a: "Giriş ekranındaki 'Şifremi Unuttum' bağlantısını kullanarak e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz."
        },
        {
            q: "Mobil uygulama ne zaman çıkacak?",
            a: "iOS ve Android uygulamalarımız geliştirme aşamasında. Çok yakında mağazalarda yerini alacak!"
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setSent(true);
                toast.success('Mesajınız gönderildi!');
            } else {
                toast.error(data.error || 'Gönderilemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    Nasıl Yardımcı Olabiliriz?
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Sorularınız, önerileriniz veya yaşadığınız sorunlar için buradayız.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* FAQ Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                        <FaQuestionCircle className="text-2xl" />
                        <h2 className="text-2xl font-bold">Sıkça Sorulan Sorular</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-medium hover:bg-white/5 transition-colors"
                                >
                                    {faq.q}
                                    <FaChevronDown className={`transition-transform duration-300 text-gray-500 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                <div
                                    className={`px-6 text-gray-400 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 py-4 border-t border-gray-800' : 'max-h-0'}`}
                                >
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Info Card */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20">
                        <h3 className="font-bold text-white mb-2">Doğrudan İletişim</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Acil durumlar veya işbirliği teklifleri için bize e-posta yoluyla da ulaşabilirsiniz.
                        </p>
                        <a href="mailto:support@parsomen.com" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                            <FaEnvelope /> support@parsomen.com
                        </a>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative">
                        <div className="flex items-center gap-3 text-white mb-6">
                            <FaPaperPlane className="text-2xl text-pink-500" />
                            <h2 className="text-2xl font-bold">Bize Ulaşın</h2>
                        </div>

                        {sent ? (
                            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl">
                                    <FaCheck />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Mesaj Gönderildi!</h3>
                                <p className="text-gray-400 mb-8">
                                    Geri bildiriminiz için teşekkürler. En kısa sürede size dönüş yapacağız.
                                </p>
                                <button
                                    onClick={() => { setSent(false); setFormData({ ...formData, subject: '', message: '' }); }}
                                    className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-700 transition-colors"
                                >
                                    Yeni Mesaj Gönder
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">AD SOYAD</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            placeholder="Adınız"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">E-POSTA</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                            placeholder="ornek@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">KONU</label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled>Seçiniz...</option>
                                        <option value="Hata Bildirimi">Hata Bildirimi</option>
                                        <option value="Öneri">Öneri & İstek</option>
                                        <option value="Yazarlık Başvurusu">Yazarlık Başvurusu</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">MESAJINIZ</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full h-32 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                                        placeholder="Mesajınızı buraya yazın..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaPaperPlane />}
                                    Gönder
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
