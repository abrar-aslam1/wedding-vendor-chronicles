import { Suspense } from 'react';
import VendorDetailClient from './VendorDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-wedding-light flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-primary"></div>
    </div>}>
      <VendorDetailClient vendorId={id} />
    </Suspense>
  );
}
