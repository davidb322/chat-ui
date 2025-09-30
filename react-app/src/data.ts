import type { AccessRequest, Location, Product } from './types';

export const locations: Location[] = [
  { id: 'all', name: 'All Locations', type: 'Headquarters', region: 'National' },
  { id: 'denver', name: 'Denver Manufacturing', type: 'Manufacturing', region: 'Mountain' },
  { id: 'atlanta', name: 'Atlanta Distribution', type: 'Warehouse', region: 'Southeast' },
  { id: 'seattle', name: 'Seattle Innovation Lab', type: 'Headquarters', region: 'Northwest' },
  { id: 'dallas', name: 'Dallas Service Hub', type: 'Warehouse', region: 'South Central' },
  { id: 'boston', name: 'Boston Retail Flagship', type: 'Retail', region: 'Northeast' }
];

export const products: Product[] = [
  {
    id: 'prod-safety-harness',
    name: 'Aegis Safety Harness Pro',
    category: 'Safety Equipment',
    description:
      'Industrial grade safety harness with integrated telemetry. Trusted across manufacturing and service hubs for high-risk tasks.',
    tags: ['Safety', 'Telemetry', 'OSHA'],
    availability: [
      {
        locationId: 'denver',
        status: 'unavailable',
        price: '$289',
        leadTime: '2 weeks',
        notes: 'Pending regional compliance review'
      },
      {
        locationId: 'atlanta',
        status: 'available',
        price: '$275',
        leadTime: 'In stock',
        lastOrderDate: '2025-01-12'
      },
      {
        locationId: 'seattle',
        status: 'pending',
        price: '$282',
        leadTime: 'Awaiting approval',
        notes: 'Field testing scheduled 2025-02-20'
      },
      {
        locationId: 'dallas',
        status: 'available',
        price: '$278',
        leadTime: '3 days',
        lastOrderDate: '2024-12-04'
      },
      {
        locationId: 'boston',
        status: 'unavailable',
        price: '$295',
        leadTime: '4 weeks',
        notes: 'Request from retail pending sales approval'
      }
    ],
    usageHighlights: [
      'Adopted by 85% of Atlanta maintenance teams',
      'Reduced safety incidents by 23% in Dallas plant',
      'Supports predictive maintenance analytics'
    ],
    metrics: { adoptionRate: 0.82, satisfaction: 0.94, averageOrderValue: 6500 },
    relatedProducts: ['Guardian Fall Protection Kit', 'Atlas Smart Winch'],
    documentationLinks: [
      { label: 'Compliance sheet', url: '#' },
      { label: 'Usage case study', url: '#' }
    ]
  },
  {
    id: 'prod-robotics-kit',
    name: 'Nova Collaborative Robotics Kit',
    category: 'Automation',
    description:
      'Modular cobot kit for flexible assembly lines. Includes rapid deployment tooling and AI-assisted programming.',
    tags: ['Automation', 'AI Assisted', 'High Value'],
    availability: [
      {
        locationId: 'denver',
        status: 'available',
        price: '$22,400',
        leadTime: 'In stock',
        lastOrderDate: '2025-01-02'
      },
      {
        locationId: 'atlanta',
        status: 'available',
        price: '$22,900',
        leadTime: '5 days',
        lastOrderDate: '2024-11-22'
      },
      {
        locationId: 'seattle',
        status: 'available',
        price: '$22,100',
        leadTime: 'In stock'
      },
      {
        locationId: 'dallas',
        status: 'pending',
        price: '$22,750',
        leadTime: 'Awaiting budget review',
        notes: 'Approval workflow triggered 2025-01-18'
      },
      {
        locationId: 'boston',
        status: 'unavailable',
        price: '$23,400',
        leadTime: '6 weeks',
        notes: 'Retail floor has limited space – requires ops approval'
      }
    ],
    usageHighlights: [
      'Cut assembly time by 35% at Denver plant',
      'Supports remote diagnostics across locations',
      'CRM shows $480K expansion pipeline tied to kit'
    ],
    metrics: { adoptionRate: 0.67, satisfaction: 0.88, averageOrderValue: 22400 },
    relatedProducts: ['Nova Vision Pack', 'Cortex Safety Scanner'],
    documentationLinks: [
      { label: 'Deployment guide', url: '#' },
      { label: 'ROI Calculator', url: '#' }
    ]
  },
  {
    id: 'prod-sanitizer',
    name: 'PureGuard Industrial Sanitizer',
    category: 'Facilities',
    description:
      'High-capacity sanitizer designed for multi-site compliance needs. Includes automated reorder triggers and IoT monitoring.',
    tags: ['Facilities', 'Consumable', 'Compliance'],
    availability: [
      {
        locationId: 'denver',
        status: 'available',
        price: '$68',
        leadTime: 'In stock',
        lastOrderDate: '2025-01-08'
      },
      {
        locationId: 'atlanta',
        status: 'available',
        price: '$65',
        leadTime: '2 days',
        lastOrderDate: '2025-01-04'
      },
      {
        locationId: 'seattle',
        status: 'available',
        price: '$67',
        leadTime: '3 days'
      },
      {
        locationId: 'dallas',
        status: 'available',
        price: '$64',
        leadTime: '4 days',
        lastOrderDate: '2024-12-17'
      },
      {
        locationId: 'boston',
        status: 'pending',
        price: '$69',
        leadTime: 'Awaiting vendor setup',
        notes: 'Retail-specific packaging requested'
      }
    ],
    usageHighlights: [
      'Automated reorder triggers reduce stockouts by 60%',
      'Cross-location analytics identify compliance gaps',
      'Bulk pricing shared across HQ and distribution'
    ],
    metrics: { adoptionRate: 0.93, satisfaction: 0.9, averageOrderValue: 8200 },
    relatedProducts: ['PureGuard Smart Dispenser', 'CleanTrack Reporting Suite'],
    documentationLinks: [
      { label: 'Chemical safety data sheet', url: '#' },
      { label: 'Cross-location rollout plan', url: '#' }
    ]
  },
  {
    id: 'prod-drone',
    name: 'Skylink Inventory Drone',
    category: 'Logistics',
    description:
      'Autonomous drone designed for rapid aisle scanning and inter-site transfer planning with ERP integration.',
    tags: ['Logistics', 'Analytics', 'ERP Integrated'],
    availability: [
      {
        locationId: 'denver',
        status: 'pending',
        price: '$9,600',
        leadTime: 'Awaiting FAA clearance',
        notes: 'Safety pilot training scheduled 2025-03-01'
      },
      {
        locationId: 'atlanta',
        status: 'available',
        price: '$9,400',
        leadTime: 'In stock',
        lastOrderDate: '2024-12-28'
      },
      {
        locationId: 'seattle',
        status: 'unavailable',
        price: '$9,750',
        leadTime: '5 weeks',
        notes: 'Lab evaluating alternative vendor'
      },
      {
        locationId: 'dallas',
        status: 'available',
        price: '$9,550',
        leadTime: '7 days',
        lastOrderDate: '2025-01-10'
      },
      {
        locationId: 'boston',
        status: 'unavailable',
        price: '$9,800',
        leadTime: '8 weeks',
        notes: 'Retail store ceilings restrict drone flight'
      }
    ],
    usageHighlights: [
      'Shortened inventory audit cycles by 48%',
      'Triggered $320K in cross-location transfer savings',
      'ERP integration validated in Atlanta and Dallas'
    ],
    metrics: { adoptionRate: 0.58, satisfaction: 0.86, averageOrderValue: 19200 },
    relatedProducts: ['Skylink Docking Station', 'VisionSync Analytics'],
    documentationLinks: [
      { label: 'Integration checklist', url: '#' },
      { label: 'Safety certification matrix', url: '#' }
    ]
  }
];

export const accessRequests: AccessRequest[] = [
  {
    id: 'req-1024',
    productId: 'prod-safety-harness',
    productName: 'Aegis Safety Harness Pro',
    locationId: 'denver',
    locationName: 'Denver Manufacturing',
    status: 'Open',
    submittedOn: '2025-01-13',
    expectedResolution: '2025-01-21',
    owner: 'Jordan Lee'
  },
  {
    id: 'req-1011',
    productId: 'prod-robotics-kit',
    productName: 'Nova Collaborative Robotics Kit',
    locationId: 'dallas',
    locationName: 'Dallas Service Hub',
    status: 'Completed',
    submittedOn: '2024-12-18',
    expectedResolution: '2024-12-29',
    owner: 'Priya Nair'
  },
  {
    id: 'req-0974',
    productId: 'prod-drone',
    productName: 'Skylink Inventory Drone',
    locationId: 'denver',
    locationName: 'Denver Manufacturing',
    status: 'Escalated',
    submittedOn: '2024-11-30',
    expectedResolution: '2025-01-05',
    owner: 'Marcus Chen'
  }
];

export const savedSearches = [
  {
    id: 'saved-critical-safety',
    label: 'Critical Safety Equipment',
    searchTerm: 'safety',
    availability: 'all',
    locations: ['denver', 'atlanta', 'dallas']
  },
  {
    id: 'saved-expansion',
    label: 'Expansion Opportunities',
    searchTerm: '',
    availability: 'unavailable',
    locations: ['denver', 'boston']
  }
];
