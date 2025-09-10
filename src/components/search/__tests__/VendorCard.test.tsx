import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { VendorCard } from '../VendorCard';
import { SearchResult } from '@/types/search';
import { VendorSelectionProvider } from '@/contexts/VendorSelectionContext';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } }
      })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null })
    })
  }
}));

vi.mock('@/utils/vendorUtils', () => ({
  getPriceTier: vi.fn().mockReturnValue('$$'),
  getKeyDifferentiator: vi.fn().mockReturnValue('Quick Response'),
  getStyleTags: vi.fn().mockReturnValue(['Modern', 'Professional']),
  getPriceTierColor: vi.fn().mockReturnValue('bg-green-100 text-green-800'),
  trackVendorClick: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the AvailabilityModal component
vi.mock('@/components/vendor/AvailabilityModal', () => ({
  AvailabilityModal: ({ isOpen, onClose, vendor }: any) => (
    isOpen ? (
      <div data-testid="availability-modal">
        <h2>Check Availability for {vendor.title}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    ) : null
  )
}));

const mockVendor: SearchResult = {
  place_id: 'test-place-id',
  title: 'Test Wedding Photographer',
  description: 'Professional wedding photographer with 10+ years experience',
  address: '123 Main St, Test City, TX',
  phone: '+1-555-123-4567',
  url: 'https://testphotographer.com',
  main_image: 'https://example.com/image.jpg',
  rating: { value: 4.5, count: 100 },
  vendor_source: 'google'
};

const renderVendorCard = (props = {}) => {
  const defaultProps = {
    vendor: mockVendor,
    isFavorite: false,
    isLoading: false,
    onToggleFavorite: vi.fn(),
    ...props
  };

  return render(
    <BrowserRouter>
      <VendorSelectionProvider>
        <VendorCard {...defaultProps} />
      </VendorSelectionProvider>
    </BrowserRouter>
  );
};

describe('VendorCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vendor information correctly', () => {
    renderVendorCard();
    
    expect(screen.getByText('Test Wedding Photographer')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Test City, TX')).toBeInTheDocument();
    expect(screen.getAllByText('4.5')).toHaveLength(2); // One in overlay, one in main rating
    expect(screen.getByText('(100)')).toBeInTheDocument();
  });

  it('renders the Check Availability button', () => {
    renderVendorCard();
    
    const checkAvailabilityButton = screen.getByRole('button', { name: /check availability/i });
    expect(checkAvailabilityButton).toBeInTheDocument();
    expect(checkAvailabilityButton).toHaveClass('bg-wedding-primary');
  });

  it('opens availability modal when Check Availability button is clicked', async () => {
    renderVendorCard();
    
    const checkAvailabilityButton = screen.getByRole('button', { name: /check availability/i });
    
    // Initially modal should not be visible
    expect(screen.queryByTestId('availability-modal')).not.toBeInTheDocument();
    
    // Click the button
    fireEvent.click(checkAvailabilityButton);
    
    // Modal should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('availability-modal')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Check Availability for Test Wedding Photographer')).toBeInTheDocument();
  });

  it('closes availability modal when close button is clicked', async () => {
    renderVendorCard();
    
    const checkAvailabilityButton = screen.getByRole('button', { name: /check availability/i });
    
    // Open modal
    fireEvent.click(checkAvailabilityButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('availability-modal')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('availability-modal')).not.toBeInTheDocument();
    });
  });

  it('tracks vendor click when Check Availability button is clicked', async () => {
    const { trackVendorClick } = await import('@/utils/vendorUtils');
    
    renderVendorCard();
    
    const checkAvailabilityButton = screen.getByRole('button', { name: /check availability/i });
    fireEvent.click(checkAvailabilityButton);
    
    await waitFor(() => {
      expect(trackVendorClick).toHaveBeenCalledWith(mockVendor, 'check_availability');
    });
  });

  it('renders other action buttons correctly', () => {
    renderVendorCard();
    
    expect(screen.getByRole('button', { name: /view profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();
  });

  it('handles vendor without phone number', () => {
    const vendorWithoutPhone = { ...mockVendor, phone: undefined };
    renderVendorCard({ vendor: vendorWithoutPhone });
    
    expect(screen.queryByRole('link', { name: /call/i })).not.toBeInTheDocument();
  });

  it('handles vendor without website', () => {
    const vendorWithoutWebsite = { ...mockVendor, url: undefined };
    renderVendorCard({ vendor: vendorWithoutWebsite });
    
    expect(screen.queryByRole('link', { name: /website/i })).not.toBeInTheDocument();
  });

  it('displays subcategory badge when provided', () => {
    renderVendorCard({ subcategory: 'portrait' });
    
    expect(screen.getByText('Portrait')).toBeInTheDocument();
  });

  it('shows multi-select button when showMultiSelect is true', () => {
    renderVendorCard({ showMultiSelect: true });
    
    expect(screen.getByRole('button', { name: /add to inquiry/i })).toBeInTheDocument();
  });

  it('handles favorite button click', async () => {
    const onToggleFavorite = vi.fn();
    renderVendorCard({ onToggleFavorite });
    
    const favoriteButton = screen.getByRole('button', { name: /save to favorites/i });
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(onToggleFavorite).toHaveBeenCalledWith(mockVendor);
    });
  });

  it('displays loading state correctly', () => {
    renderVendorCard({ isLoading: true });
    
    const favoriteButton = screen.getByRole('button', { name: /save to favorites/i });
    expect(favoriteButton).toBeDisabled();
  });

  it('shows favorite state when isFavorite is true', () => {
    renderVendorCard({ isFavorite: true });
    
    const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
    expect(favoriteButton).toBeInTheDocument();
  });
});
