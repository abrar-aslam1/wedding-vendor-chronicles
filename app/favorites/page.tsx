import { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'My Favorite Vendors | Wedding Vendor Chronicles',
  description: 'View and manage your saved wedding vendors',
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
