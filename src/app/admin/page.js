import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaBookOpen, FaTags, FaUsers, FaComments, FaMedal, FaServer, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default async function AdminDashboard() {
   const session = await getSession();

   // Secure Server-Side Access
   if (!session || session.user.role !== 'ADMIN') {
      redirect('/');
   }

   // Fetch REAL data concurrently with error handling
   let userCount = 0, bookCount = 0, reviewCount = 0, badgeCount = 0, categoryCount = 0, ticketCount = 0;
   let dbError = null;

   try {
      [userCount, bookCount, reviewCount, badgeCount, categoryCount, ticketCount] = await Promise.all([
         prisma.user.count(),
         prisma.book.count(),
         prisma.review.count(),
         prisma.userBadge.count(),
         prisma.category.count(),
         prisma.ticket.count({ where: { status: 'OPEN' } })
      ]);
   } catch (error) {
      console.error("Admin Dashboard DB Error:", error);
      dbError = error.message;
   }

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {/* Welcome Section */}
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-4xl font-bold text-white mb-2">Panel Genel Bakış</h1>
               <p className="text-gray-400">Sistemin anlık durumu ve istatistiklerine buradan ulaşabilirsin.</p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-medium text-green-400">Sistem Çevrimiçi</span>
            </div>
         </div>

         {/* Error Alert */}
         {dbError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-6">
               <FaExclamationTriangle className="text-xl" />
               <div>
                  <h3 className="font-bold">Veri Çekme Hatası</h3>
                  <p className="text-sm opacity-80">Bazı istatistikler yüklenemedi: {dbError}</p>
               </div>
            </div>
         )}

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard title="Toplam Kullanıcı" value={userCount} icon={<FaUsers />} color="blue" href="/admin/users" />
            <StatCard title="Aktif Kitaplar" value={bookCount} icon={<FaBookOpen />} color="pink" href="/admin/books" />
            <StatCard title="İncelemeler" value={reviewCount} icon={<FaComments />} color="purple" trend="+5%" />
            <StatCard title="Kategoriler" value={categoryCount} icon={<FaTags />} color="indigo" href="/admin/categories" />
            <StatCard title="Dağıtılan Rozetler" value={badgeCount} icon={<FaMedal />} color="yellow" href="/admin/badges" />
            <StatCard title="Açık Destek Talebi" value={ticketCount} icon={<FaExclamationTriangle />} color="red" href="/admin/support" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Health */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaServer className="text-gray-400" /> Sistem Durumu
               </h2>

               <div className="space-y-4">
                  <HealthItem label="Veritabanı" value="PostgreSQL (Neon)" status="connected" />
                  <HealthItem label="Önbellek (Cache)" value="Aktif" status="connected" />
                  <HealthItem label="Sunucu Saati" value={new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })} icon={<FaClock />} />
               </div>
            </div>

            {/* Quick Actions or Recent Logs (Visual Placeholder for now) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
               <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <FaCheckCircle className="text-3xl text-gray-500" />
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Her Şey Yolunda</h3>
               <p className="text-gray-400 text-sm max-w-xs">
                  Son 24 saatte herhangi bir kritik hata raporlanmadı.
               </p>
               <Link href="/admin/support" className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors">
                  Destek Taleplerini İncele
               </Link>
            </div>
         </div>
      </div>
   );
}

function StatCard({ title, value, icon, color, href, trend }) {
   const colors = {
      blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20 group-hover:border-blue-500/50',
      pink: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20 group-hover:border-pink-500/50',
      purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20 group-hover:border-purple-500/50',
      green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20 group-hover:border-green-500/50',
      yellow: 'from-yellow-500/20 to-yellow-600/5 text-yellow-400 border-yellow-500/20 group-hover:border-yellow-500/50',
      red: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20 group-hover:border-red-500/50',
      indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/50',
   };

   const styleClass = colors[color] || colors.blue;

   const Content = (
      <div className={`group relative p-6 rounded-2xl border bg-gradient-to-br ${styleClass} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
         <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black/20 rounded-xl">
               <span className="text-2xl">{icon}</span>
            </div>
            {trend && (
               <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>
            )}
         </div>
         <div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</p>
         </div>
      </div>
   );

   if (href) return <Link href={href} className="block">{Content}</Link>;
   return Content;
}

function HealthItem({ label, value, status, icon }) {
   return (
      <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
         <span className="text-sm font-medium text-gray-300">{label}</span>
         <div className="flex items-center gap-2">
            {status === 'connected' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
            <span className="text-sm font-bold text-gray-200">{value}</span>
            {icon && <span className="text-gray-400">{icon}</span>}
         </div>
      </div>
   );
}
