export type UserRole = 'generator' | 'recipient' | 'operator' | 'admin';

export interface DemoUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  organization: string;
  recipientFacilityId?: string; // Present if role === 'recipient'
  avatarInitial: string;
  description: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: DemoUser | null;
  authMethod: 'demo_session' | 'guest';
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'USR-GEN-01',
    name: 'Palak Kolambe',
    email: 'palak.kolambe@mitadt.edu.in',
    role: 'generator',
    organization: 'MIT-ADT Campus Facilities & Services',
    avatarInitial: 'PK',
    description: 'Generates segregated campus waste, runs AI triage, confirms material, sends recipient offers.',
  },
  {
    id: 'USR-REC-01',
    name: 'Sunil Deshmukh',
    email: 'sunil.procurement@hadapsarkraft.demo',
    role: 'recipient',
    organization: 'Hadapsar Kraft Paper & Pulp Corp',
    recipientFacilityId: 'REC-PUN-001',
    avatarInitial: 'SD',
    description: 'Reviews incoming fiber offers, accepts/rejects loads, confirms receipt & weighbridge tonnage.',
  },
  {
    id: 'USR-REC-02',
    name: 'Pooja Kulkarni',
    email: 'pooja.intake@chakanpolymers.demo',
    role: 'recipient',
    organization: 'Chakan Polymers & Petro-Resins',
    recipientFacilityId: 'REC-PUN-002',
    avatarInitial: 'PK',
    description: 'Intake officer evaluating plastic polymer purity and bale packaging.',
  },
  {
    id: 'USR-REC-03',
    name: 'Rajesh Patil',
    email: 'rajesh.scrap@bhosarireclaim.demo',
    role: 'recipient',
    organization: 'Bhosari Foundry Scrap Aggregator',
    recipientFacilityId: 'REC-PUN-003',
    avatarInitial: 'RP',
    description: 'Metals reclamation intake supervisor at MIDC Bhosari yard.',
  },
  {
    id: 'USR-REC-05',
    name: 'Anand Shinde',
    email: 'anand.mrf@punegreenhub.demo',
    role: 'recipient',
    organization: 'Pune Green Hub Community MRF',
    recipientFacilityId: 'REC-PUN-005',
    avatarInitial: 'AS',
    description: 'Community recovery depot coordinator evaluating decentralized clean batches.',
  },
  {
    id: 'USR-LOG-01',
    name: 'Vikram Shinde',
    email: 'vikram.logistics@greenfleet.demo',
    role: 'operator',
    organization: 'Pune Green Logistics & Fleet Dispatch',
    avatarInitial: 'VS',
    description: 'Coordinates pickup schedules, records driver custody handover, logs exceptions & transit times.',
  },
  {
    id: 'USR-ADM-01',
    name: 'System Administrator',
    email: 'admin.desk@rejectless.internal',
    role: 'admin',
    organization: 'HackStorm 2026 Audit & Operations Desk',
    avatarInitial: 'AD',
    description: 'Configures recipient capacities, rules engine parameters, resets test data and audits logs.',
  },
];
