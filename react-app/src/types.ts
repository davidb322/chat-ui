export type LocationAvailabilityStatus = 'available' | 'unavailable' | 'pending';

export interface Location {
  id: string;
  name: string;
  type: 'Headquarters' | 'Warehouse' | 'Manufacturing' | 'Retail';
  region: string;
}

export interface AvailabilityDetail {
  locationId: string;
  status: LocationAvailabilityStatus;
  price: string;
  leadTime: string;
  lastOrderDate?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  availability: AvailabilityDetail[];
  usageHighlights: string[];
  metrics: {
    adoptionRate: number;
    satisfaction: number;
    averageOrderValue: number;
  };
  relatedProducts: string[];
  documentationLinks: { label: string; url: string }[];
}

export interface AccessRequest {
  id: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  status: 'Open' | 'Completed' | 'Escalated';
  submittedOn: string;
  expectedResolution: string;
  owner: string;
}

export interface BulkSelection {
  productIds: string[];
  targetLocationIds: string[];
}
