import { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
    title: { default: 'Admin', template: '%s | Admin · aihealz' },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
