import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord, FaHeart } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="w-full px-4 sm:px-8 lg:px-16 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-black text-white mb-4">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                Parşomen
                            </span>
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                            Kitapların büyülü dünyasına hoş geldiniz. Binlerce kitabı keşfedin,
                            koleksiyonlar oluşturun ve okuma yolculuğunuzda ilerleyin.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                <FaTwitter />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                <FaDiscord />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                <FaGithub />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Hızlı Linkler</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/store" className="text-gray-400 hover:text-white transition-colors">Mağaza</Link></li>
                            <li><Link href="/library" className="text-gray-400 hover:text-white transition-colors">Kütüphanem</Link></li>
                            <li><Link href="/store/editor-choice" className="text-gray-400 hover:text-white transition-colors">Editörün Seçimi</Link></li>
                            <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Sıralama</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Yasal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Kullanım Şartları</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">İletişim</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Parşomen. Tüm hakları saklıdır.
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        Made with <FaHeart className="text-red-500" /> in Turkey
                    </p>
                </div>
            </div>
        </footer>
    );
}
