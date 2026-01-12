import { Metadata } from 'next';
import ListBusinessClient from './ListBusinessClient';

export const metadata: Metadata = {
  title: 'List Your Business | Wedding Vendor Chronicles',
  description: 'Add your wedding vendor business to our directory and connect with couples planning their special day',
};

export default function ListBusinessPage() {
  return <ListBusinessClient />;
}
