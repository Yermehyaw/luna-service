export interface ServiceItem {
  id: string;
  tenantId: string;
  name: string;
  minutes: number;
  description: string;
}

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 's_001',
    tenantId: 'tenant_001',
    name: 'Teller & Cash Deposit',
    minutes: 5,
    description: 'Instant cash deposit, withdrawal, and teller window services.',
  },
  {
    id: 's_002',
    tenantId: 'tenant_001',
    name: 'Account & Card Advisory',
    minutes: 15,
    description: 'New account opening, debit/credit card issuance, and compliance.',
  },
  {
    id: 's_003',
    tenantId: 'tenant_001',
    name: 'Corporate Foreign Exchange',
    minutes: 20,
    description: 'Business foreign currency, trade finance, and wire transfers.',
  },
  {
    id: 's_004',
    tenantId: 'tenant_002',
    name: 'Outpatient Triage & Consultation',
    minutes: 25,
    description: 'General doctor consultation, vital checks, and clinical triage.',
  },
  {
    id: 's_005',
    tenantId: 'tenant_002',
    name: 'Laboratory Diagnostics & Blood Work',
    minutes: 10,
    description: 'Rapid blood sample collection, X-ray pre-clearance, and diagnostics.',
  },
  {
    id: 's_006',
    tenantId: 'tenant_003',
    name: 'SIM Replacement & Biometrics',
    minutes: 8,
    description: 'Instant SIM swap, biometric re-registration, and e-SIM activation.',
  },
];
