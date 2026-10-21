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
];
