export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  openUntil: string;
  liveLoad: 'low' | 'moderate' | 'high';
  waitMin: number;
}

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b_001',
    tenantId: 'tenant_001',
    name: 'Lekki Phase 1 Flagship',
    address: 'Admiralty Way, Lekki, Lagos',
    city: 'Lagos',
    openUntil: '5:00 PM',
    liveLoad: 'low',
    waitMin: 4,
  },
  {
    id: 'b_002',
    tenantId: 'tenant_001',
    name: 'Victoria Island Hub',
    address: 'Adeola Odeku Street, VI, Lagos',
    city: 'Lagos',
    openUntil: '4:30 PM',
    liveLoad: 'moderate',
    waitMin: 11,
  },
  {
    id: 'b_003',
    tenantId: 'tenant_002',
    name: 'Central Hospital Annex',
    address: 'Corporation Drive, VI, Lagos',
    city: 'Lagos',
    openUntil: '8:00 PM',
    liveLoad: 'low',
    waitMin: 6,
  },
  {
    id: 'b_004',
    tenantId: 'tenant_003',
    name: 'Westlands Telecom Center',
    address: 'Waiyaki Way, Nairobi',
    city: 'Nairobi',
    openUntil: '6:00 PM',
    liveLoad: 'moderate',
    waitMin: 8,
  },
  {
    id: 'b_005',
    tenantId: 'tenant_004',
    name: 'Lekki Main Salon Lounge',
    address: 'Plot 14 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    openUntil: '7:30 PM',
    liveLoad: 'low',
    waitMin: 3,
  },
  {
    id: 'b_006',
    tenantId: 'tenant_005',
    name: 'Ikeja Workshop Bay Hub',
    address: '8 Commercial Avenue, Ikeja Industrial Estate',
    city: 'Lagos',
    openUntil: '6:00 PM',
    liveLoad: 'low',
    waitMin: 4,
  },
  {
    id: 'b_007',
    tenantId: 'tenant_006',
    name: 'Victoria Island Roastery & Cafe',
    address: '22 Ahmadu Bello Way, Victoria Island',
    city: 'Lagos',
    openUntil: '8:00 PM',
    liveLoad: 'low',
    waitMin: 2,
  },
  {
    id: 'b_008',
    tenantId: 'tenant_007',
    name: 'Maitama Practice Suite',
    address: '4 Aguiyi Ironsi Street, Maitama',
    city: 'Abuja',
    openUntil: '6:30 PM',
    liveLoad: 'low',
    waitMin: 5,
  },
];
