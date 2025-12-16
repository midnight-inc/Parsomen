import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FaBookOpen, FaTags, FaUsers, FaComments, FaMedal } from 'react-icons/fa';

export default async function AdminDashboard() {
   const session = await getSession();

   // Secure Server-Side Access
   if (!session || session.user.role !== 'ADMIN') {
      redirect('/');
   }

   // Fetch REAL data
   const userCount = await prisma.user.count();
   const bookCount = await prisma.book.count();
   const reviewCount = await prisma.review.count();
   const badgeCount = await prisma.userBadge.count();
   const categoryCount = await prisma.category.count();

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Genel Bakış & İstatistikler</h1>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card title="Toplam Kullanıcı" value={userCount} icon={<FaUsers />} color="text-blue-500 bg-blue-500/10 border-blue-500/20" href="/admin/users" />
            <Card title="Aktif Kitaplar" value={bookCount} icon={<FaBookOpen />} color="text-green-500 bg-green-500/10 border-green-500/20" href="/admin/books" />
            <Card title="Kategoriler" value={categoryCount} icon={<FaTags />} color="text-pink-500 bg-pink-500/10 border-pink-500/20" href="/admin/categories" />
            <Card title="İncelemeler" value={reviewCount} icon={<FaComments />} color="text-purple-500 bg-purple-500/10 border-purple-500/20" />
            <Card title="Kazanılan Rozetler" value={badgeCount} icon={<FaMedal />} color="text-yellow-500 bg-yellow-500/10 border-yellow-500/20" href="/admin/badges" />
         </div>

         <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Sistem Sağlığı</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span>Veritabanı Motoru</span>
                  <span className="text-blue-400 font-bold flex items-center gap-2">● PostgreSQL (Neon)</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span>Sunucu Saati</span>
                  <span className="text-gray-400 font-mono">{new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}</span>
               </div>
            </div>
         </div>
      </div>
   );
}

// Link wrapper for cards
function Card({ title, value, icon, color, href }) {
   const Content = (
      <div className={`p-6 rounded-xl border ${color} backdrop-blur-sm flex flex-col justify-between h-32 hover:scale-105 transition-transform cursor-pointer`}>
         <div className="flex justify-between items-start">
            <div className="text-sm font-medium opacity-80">{title}</div>
            <div className="text-2xl opacity-80">{icon}</div>
         </div>
         <div className="text-3xl font-bold text-white">{value}</div>
      </div>
   );

   if (href) {
      return <a href={href}>{Content}</a>; // Using simple anchor for admin to force refresh if needed, or Link
      // Better use Link
   }

   return Content;
}
