import { Metadata } from 'next';
import AdminPanelClient from './AdminPanelClient';

export const metadata: Metadata = {
  title: 'Admin Panel | Wedding Vendor Chronicles',
  description: 'Admin dashboard for vendor management and approval',
};

export default function AdminPage() {
  return <AdminPanelClient />;
}
