import AdminClientLayout from './AdminClientLayout';

export const metadata = {
    title: 'Parşomen - Admin Panel',
    description: 'Yönetim paneli.',
};

export default function AdminLayout({ children }) {
    return <AdminClientLayout>{children}</AdminClientLayout>;
}
