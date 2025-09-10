import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchResult } from '@/types/search';

interface VendorSelectionContextType {
  selectedVendors: SearchResult[];
  addVendor: (vendor: SearchResult) => boolean;
  removeVendor: (vendorId: string) => void;
  clearSelection: () => void;
  isVendorSelected: (vendorId: string) => boolean;
  canAddMore: boolean;
  maxVendors: number;
}

const VendorSelectionContext = createContext<VendorSelectionContextType | undefined>(undefined);

interface VendorSelectionProviderProps {
  children: React.ReactNode;
  maxVendors?: number;
}

export const VendorSelectionProvider: React.FC<VendorSelectionProviderProps> = ({
  children,
  maxVendors = 3
}) => {
  const [selectedVendors, setSelectedVendors] = useState<SearchResult[]>([]);

  const addVendor = useCallback((vendor: SearchResult): boolean => {
    if (selectedVendors.length >= maxVendors) {
      return false; // Cannot add more vendors
    }

    if (selectedVendors.some(v => v.place_id === vendor.place_id)) {
      return false; // Vendor already selected
    }

    setSelectedVendors(prev => [...prev, vendor]);
    return true;
  }, [selectedVendors, maxVendors]);

  const removeVendor = useCallback((vendorId: string) => {
    setSelectedVendors(prev => prev.filter(v => v.place_id !== vendorId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVendors([]);
  }, []);

  const isVendorSelected = useCallback((vendorId: string): boolean => {
    return selectedVendors.some(v => v.place_id === vendorId);
  }, [selectedVendors]);

  const canAddMore = selectedVendors.length < maxVendors;

  const value: VendorSelectionContextType = {
    selectedVendors,
    addVendor,
    removeVendor,
    clearSelection,
    isVendorSelected,
    canAddMore,
    maxVendors
  };

  return (
    <VendorSelectionContext.Provider value={value}>
      {children}
    </VendorSelectionContext.Provider>
  );
};

export const useVendorSelection = (): VendorSelectionContextType => {
  const context = useContext(VendorSelectionContext);
  if (context === undefined) {
    throw new Error('useVendorSelection must be used within a VendorSelectionProvider');
  }
  return context;
};
