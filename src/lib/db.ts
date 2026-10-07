// =====================================================================
// SwapShield Database & In-Memory Store
// Matches PostgreSQL relational DDL with Nigerian seed data
// =====================================================================

import {
  User,
  GadgetListing,
  SwapProposal,
  EscrowOrder,
  EscrowDispute,
  InspectionHub,
  EscrowTimelineEvent,
  EscrowStatus
} from '@/types';
import { triggerSellerPayout } from './paystack';
import { sendTermiiNotification, SMS_TEMPLATES } from './termii';

// ---------------------------------------------------------------------
// SEED DATA: Nigerian Verified Users
// ---------------------------------------------------------------------
const SEED_USERS: User[] = [
  {
    id: 'usr_001_seun',
    email: 'seun.adeleke@gmail.com',
    phone_number: '+2348031234567',
    full_name: 'Oluwaseun Adeleke',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bvn_verified: true,
    nin_verified: true,
    trust_score: 4.95,
    bank_account_number: '0123456789',
    bank_code: '058',
    bank_name: 'Guaranty Trust Bank (GTB)',
    recipient_code: 'RCP_gtb_seun_001',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-10-01T12:00:00Z'
  },
  {
    id: 'usr_002_chioma',
    email: 'chioma.okonkwo@creatives.ng',
    phone_number: '+2348129876543',
    full_name: 'Chioma Okonkwo',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    bvn_verified: true,
    nin_verified: true,
    trust_score: 4.90,
    bank_account_number: '2087654321',
    bank_code: '033',
    bank_name: 'United Bank for Africa (UBA)',
    recipient_code: 'RCP_uba_chioma_002',
    created_at: '2026-02-14T08:30:00Z',
    updated_at: '2026-09-20T11:15:00Z'
  },
  {
    id: 'usr_003_tunde',
    email: 'tunde.babatunde@techdev.io',
    phone_number: '+2347055566778',
    full_name: 'Babatunde Fashola Jr.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bvn_verified: true,
    nin_verified: false,
    trust_score: 4.80,
    bank_account_number: '1012345678',
    bank_code: '057',
    bank_name: 'Zenith Bank',
    recipient_code: 'RCP_zenith_tunde_003',
    created_at: '2026-03-01T14:00:00Z',
    updated_at: '2026-08-11T16:40:00Z'
  },
  {
    id: 'usr_004_amina',
    email: 'amina.bello@designlab.ng',
    phone_number: '+2349081122334',
    full_name: 'Amina Bello',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bvn_verified: true,
    nin_verified: true,
    trust_score: 5.00,
    bank_account_number: '2233445566',
    bank_code: '011',
    bank_name: 'First Bank of Nigeria',
    recipient_code: 'RCP_fbn_amina_004',
    created_at: '2026-04-12T09:15:00Z',
    updated_at: '2026-10-02T10:00:00Z'
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Nigerian Inspection Hubs
// ---------------------------------------------------------------------
const SEED_HUBS: InspectionHub[] = [
  {
    id: 'hub_001_ikeja',
    name: 'Computer Village Verification Hub',
    slug: 'computer-village-ikeja',
    address: '14 Otigba Street, Opposite Medical Road Junction, Computer Village',
    city: 'Ikeja',
    state: 'Lagos',
    agent_name: 'Emeka Uzo',
    agent_phone: '+2348023456789',
    operating_hours: 'Mon-Sat: 8:30 AM - 6:30 PM',
    is_active: true
  },
  {
    id: 'hub_002_yaba',
    name: 'Yaba Tech Hub & Drop-Off Station',
    slug: 'yaba-tech-hub',
    address: '312 Herbert Macaulay Way, Near Sabo Yaba',
    city: 'Yaba',
    state: 'Lagos',
    agent_name: 'Folake Alabi',
    agent_phone: '+2348056789012',
    operating_hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    is_active: true
  },
  {
    id: 'hub_003_vi',
    name: 'Victoria Island Premium Escrow Hub',
    slug: 'victoria-island-hub',
    address: '22 Adetokunbo Ademola Street, Victoria Island',
    city: 'Victoria Island',
    state: 'Lagos',
    agent_name: 'Chinedu Eze',
    agent_phone: '+2348189012345',
    operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    is_active: true
  },
  {
    id: 'hub_004_abuja',
    name: 'Abuja Wuse II Tech Depot',
    slug: 'abuja-wuse-ii',
    address: 'Plot 414 Aminu Kano Crescent, Wuse II',
    city: 'Abuja',
    state: 'FCT',
    agent_name: 'Musa Garba',
    agent_phone: '+2348090123456',
    operating_hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    is_active: true
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Diagnostic Gadget Listings
// ---------------------------------------------------------------------
const SEED_LISTINGS: GadgetListing[] = [
  {
    id: 'lst_001_iphone15pm',
    seller_id: 'usr_001_seun',
    category: 'SMARTPHONE',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storage_capacity: '256GB',
    ram: '8GB',
    color: 'Natural Titanium',
    imei_or_serial_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    battery_health_percentage: 97,
    battery_cycle_count: 142,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'MINT_GRADE_A',
    cash_price: 1420000,
    is_swap_eligible: true,
    accepted_swap_models: ['MacBook Pro 14" M2 Pro', 'MacBook Air 15" M2', 'iPhone 14 Pro Max'],
    media_urls: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: '3uTools Verified: 98% Test Score. True Tone operational, Face ID calibrated, all cameras tested. No water exposure.',
    diagnostic_score: 98,
    status: 'ACTIVE',
    created_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'lst_002_macbook_m2',
    seller_id: 'usr_002_chioma',
    category: 'LAPTOP',
    brand: 'Apple',
    model: 'MacBook Pro 14" M2 Pro',
    storage_capacity: '512GB',
    ram: '16GB',
    color: 'Space Gray',
    imei_or_serial_hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    battery_health_percentage: 94,
    battery_cycle_count: 88,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'MINT_GRADE_A',
    cash_price: 1720000,
    is_swap_eligible: true,
    accepted_swap_models: ['iPhone 15 Pro Max', 'Dell XPS 15', 'iPad Pro 12.9" M2'],
    media_urls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: 'CoconutBattery Certified: 94.2% design capacity. Zero keyboard stickiness. Liquid contact indicators clean.',
    diagnostic_score: 96,
    status: 'IN_ESCROW',
    created_at: '2026-10-02T11:20:00Z'
  },
  {
    id: 'lst_003_iphone14p',
    seller_id: 'usr_003_tunde',
    category: 'SMARTPHONE',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage_capacity: '128GB',
    ram: '6GB',
    color: 'Deep Purple',
    imei_or_serial_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    battery_health_percentage: 86,
    battery_cycle_count: 310,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'GOOD_GRADE_B',
    cash_price: 920000,
    is_swap_eligible: true,
    accepted_swap_models: ['iPhone 15', 'MacBook Air 13" M1', 'Samsung Galaxy S23 Ultra'],
    media_urls: [
      'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: 'Normal cosmetic pocket wear along bottom bezel. Battery health verified via iOS Diagnostics.',
    diagnostic_score: 89,
    status: 'ACTIVE',
    created_at: '2026-10-03T09:10:00Z'
  },
  {
    id: 'lst_004_iphone13',
    seller_id: 'usr_004_amina',
    category: 'SMARTPHONE',
    brand: 'Apple',
    model: 'iPhone 13',
    storage_capacity: '128GB',
    ram: '4GB',
    color: 'Midnight Black',
    imei_or_serial_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    battery_health_percentage: 78,
    battery_cycle_count: 520,
    screen_status: 'REPLACED_OEM',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'FAIR_GRADE_C',
    cash_price: 510000,
    is_swap_eligible: true,
    accepted_swap_models: ['iPad Air 5th Gen M1', 'iPhone 12 Pro Max'],
    media_urls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: 'Screen replaced with OEM panel in Computer Village. Battery service recommended (78% capacity). Minor scuffs on rim.',
    diagnostic_score: 75,
    status: 'ACTIVE',
    created_at: '2026-10-04T13:40:00Z'
  },
  {
    id: 'lst_005_ipad_pro',
    seller_id: 'usr_001_seun',
    category: 'TABLET',
    brand: 'Apple',
    model: 'iPad Pro 11" M2',
    storage_capacity: '128GB',
    ram: '8GB',
    color: 'Space Gray',
    imei_or_serial_hash: 'c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4',
    battery_health_percentage: 93,
    battery_cycle_count: 110,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'MINT_GRADE_A',
    cash_price: 840000,
    is_swap_eligible: true,
    accepted_swap_models: ['iPhone 14 Pro', 'MacBook Air 13" M1'],
    media_urls: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: 'Includes original folio cover and box. Clean Apple Pencil wireless charging contact.',
    diagnostic_score: 95,
    status: 'ACTIVE',
    created_at: '2026-10-05T08:00:00Z'
  },
  {
    id: 'lst_006_s24ultra',
    seller_id: 'usr_002_chioma',
    category: 'SMARTPHONE',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage_capacity: '256GB',
    ram: '12GB',
    color: 'Titanium Gray',
    imei_or_serial_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    battery_health_percentage: 99,
    battery_cycle_count: 45,
    screen_status: 'ORIGINAL',
    face_id_or_biometrics: 'WORKING',
    icloud_or_mdm_status: 'CLEAN_UNLOCKED',
    physical_condition: 'MINT_GRADE_A',
    cash_price: 1350000,
    is_swap_eligible: true,
    accepted_swap_models: ['iPhone 15 Pro Max', 'MacBook Pro 14" M2 Pro'],
    media_urls: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
    ],
    diagnostic_report_notes: 'Samsung Members diagnostic test: 100% all hardware sensors pass. S-Pen latency optimal.',
    diagnostic_score: 99,
    status: 'ACTIVE',
    created_at: '2026-10-05T15:30:00Z'
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Swap Proposals
// ---------------------------------------------------------------------
const SEED_PROPOSALS: SwapProposal[] = [
  {
    id: 'prp_001',
    listing_id: 'lst_002_macbook_m2',
    proposer_id: 'usr_001_seun',
    offered_device_id: 'lst_001_iphone15pm',
    proposed_cash_topup: 300000, // Seun offers iPhone 15 Pro Max + ₦300k for Chioma's MacBook M2 Pro
    status: 'ACCEPTED',
    proposer_note: 'Offering my mint Natural Titanium 15 Pro Max (97% battery) + ₦300k cash top-up for your M2 Pro.',
    created_at: '2026-10-02T14:00:00Z'
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Escrow Orders (One actively in 48-Hour Testing Period!)
// ---------------------------------------------------------------------
// Calculate 48h expiration ~26 hours in future for live demo countdown
const nowTime = new Date();
const activeTimerExpires = new Date(nowTime.getTime() + 26 * 60 * 60 * 1000).toISOString();

const SEED_ORDERS: EscrowOrder[] = [
  {
    id: 'ord_active_48h',
    order_type: 'DEVICE_SWAP',
    buyer_id: 'usr_001_seun',
    seller_id: 'usr_002_chioma',
    listing_id: 'lst_002_macbook_m2',
    swap_proposal_id: 'prp_001',
    delivery_mode: 'HUB_VERIFICATION',
    hub_id: 'hub_001_ikeja',
    total_escrow_amount: 300000, // Cash top-up held in vault
    platform_fee: 15000, // 5%
    inspection_fee: 3500,
    shipping_fee: 4000,
    payment_reference: 'PSK_REF_SWAP_990142',
    paystack_access_code: 'acc_live_demo_01',
    escrow_status: 'DELIVERED_TESTING_PERIOD',
    delivery_tracking_number: 'GIGL-LOS-88912',
    courier_partner: 'SwapShield Hub (Ikeja Computer Village)',
    inspection_window_expires_at: activeTimerExpires,
    created_at: new Date(nowTime.getTime() - 22 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(nowTime.getTime() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord_funds_locked',
    order_type: 'OUTRIGHT_PURCHASE',
    buyer_id: 'usr_003_tunde',
    seller_id: 'usr_004_amina',
    listing_id: 'lst_004_iphone13',
    delivery_mode: 'DIRECT_COURIER',
    total_escrow_amount: 510000,
    platform_fee: 25500,
    inspection_fee: 3500,
    shipping_fee: 4000,
    payment_reference: 'PSK_REF_BUY_771822',
    escrow_status: 'FUNDS_LOCKED',
    delivery_tracking_number: 'GIGL-YAB-44109',
    courier_partner: 'GIG Logistics',
    created_at: new Date(nowTime.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(nowTime.getTime() - 6 * 60 * 60 * 1000).toISOString()
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Escrow Disputes
// ---------------------------------------------------------------------
const SEED_DISPUTES: EscrowDispute[] = [
  {
    id: 'dsp_001',
    order_id: 'ord_active_48h',
    raised_by: 'usr_001_seun',
    dispute_reason: 'BATTERY_MISMATCH',
    detailed_description: 'CoconutBattery reported cycle count is 320 instead of the 88 stated in the listing.',
    proof_media_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'],
    resolution_status: 'OPEN',
    return_waybill_tracking: 'WAYBILL-RET-90112',
    return_hub_id: 'hub_001_ikeja',
    admin_notes: 'Awaiting device drop-off at Computer Village hub for hardware re-scan.',
    created_at: '2026-10-06T11:00:00Z',
    updated_at: '2026-10-06T11:00:00Z'
  }
];

// ---------------------------------------------------------------------
// SEED DATA: Timeline Events
// ---------------------------------------------------------------------
const SEED_EVENTS: EscrowTimelineEvent[] = [
  {
    id: 'evt_001',
    order_id: 'ord_active_48h',
    actor_id: 'usr_001_seun',
    event_type: 'PAYMENT_CONFIRMED',
    description: 'Paystack verified ₦322,500 deposit into SwapShield escrow vault. Funds secured.',
    created_at: new Date(nowTime.getTime() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'evt_002',
    order_id: 'ord_active_48h',
    actor_id: 'usr_002_chioma',
    event_type: 'HUB_DROP_OFF',
    description: 'MacBook Pro 14" deposited at Computer Village Verification Hub. Hardware serial checked against IMEI hash.',
    created_at: new Date(nowTime.getTime() - 23 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'evt_003',
    order_id: 'ord_active_48h',
    actor_id: 'usr_001_seun',
    event_type: 'DELIVERED_TESTING_PERIOD',
    description: 'Buyer confirmed physical receipt of gadget. 48-Hour Inspection Escrow Window triggered.',
    created_at: new Date(nowTime.getTime() - 22 * 60 * 60 * 1000).toISOString()
  }
];

// In-Memory Database store instance
class DatabaseStore {
  private users: User[] = [...SEED_USERS];
  private hubs: InspectionHub[] = [...SEED_HUBS];
  private listings: GadgetListing[] = [...SEED_LISTINGS];
  private proposals: SwapProposal[] = [...SEED_PROPOSALS];
  private orders: EscrowOrder[] = [...SEED_ORDERS];
  private disputes: EscrowDispute[] = [...SEED_DISPUTES];
  private timelineEvents: EscrowTimelineEvent[] = [...SEED_EVENTS];

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  // Hubs
  getHubs(): InspectionHub[] {
    return this.hubs.filter((h) => h.is_active);
  }

  getHubById(id: string): InspectionHub | undefined {
    return this.hubs.find((h) => h.id === id);
  }

  // Listings
  getListings(filters?: {
    category?: string;
    brand?: string;
    is_swap_eligible?: boolean;
    search?: string;
  }): GadgetListing[] {
    let list = this.listings;

    if (filters?.category) {
      list = list.filter((l) => l.category === filters.category);
    }
    if (filters?.brand) {
      list = list.filter((l) => l.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.is_swap_eligible !== undefined) {
      list = list.filter((l) => l.is_swap_eligible === filters.is_swap_eligible);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((l) => l.model.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q));
    }

    // Attach populated seller
    return list.map((l) => ({
      ...l,
      seller: this.getUserById(l.seller_id)
    }));
  }

  getListingById(id: string): GadgetListing | undefined {
    const listing = this.listings.find((l) => l.id === id);
    if (!listing) return undefined;
    return {
      ...listing,
      seller: this.getUserById(listing.seller_id)
    };
  }

  createListing(data: Omit<GadgetListing, 'id' | 'created_at'>): GadgetListing {
    const newListing: GadgetListing = {
      ...data,
      id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.listings.unshift(newListing);
    return newListing;
  }

  // Proposals
  getProposals(listingId?: string): SwapProposal[] {
    let list = this.proposals;
    if (listingId) {
      list = list.filter((p) => p.listing_id === listingId);
    }
    return list.map((p) => ({
      ...p,
      proposer: this.getUserById(p.proposer_id),
      target_listing: this.getListingById(p.listing_id),
      offered_device: this.getListingById(p.offered_device_id)
    }));
  }

  createProposal(data: Omit<SwapProposal, 'id' | 'created_at' | 'status'>): SwapProposal {
    const proposal: SwapProposal = {
      ...data,
      id: `prp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    this.proposals.unshift(proposal);
    return proposal;
  }

  updateProposalStatus(id: string, status: SwapProposal['status']): SwapProposal | null {
    const p = this.proposals.find((prop) => prop.id === id);
    if (!p) return null;
    p.status = status;
    p.updated_at = new Date().toISOString();
    return p;
  }

  // Orders
  getOrders(): EscrowOrder[] {
    return this.orders.map((o) => this.populateOrder(o));
  }

  getOrderById(id: string): EscrowOrder | undefined {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return undefined;
    return this.populateOrder(order);
  }

  createOrder(data: Omit<EscrowOrder, 'id' | 'created_at' | 'updated_at'>): EscrowOrder {
    const newOrder: EscrowOrder = {
      ...data,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.orders.unshift(newOrder);

    this.addTimelineEvent(
      newOrder.id,
      'ORDER_CREATED',
      `Escrow order created. Payment Reference: ${newOrder.payment_reference}. Awaiting Paystack authorization.`,
      newOrder.buyer_id
    );

    return this.populateOrder(newOrder);
  }

  private populateOrder(o: EscrowOrder): EscrowOrder {
    const buyer = this.getUserById(o.buyer_id);
    const seller = this.getUserById(o.seller_id);
    return {
      ...o,
      buyer,
      seller,
      buyer_phone: buyer?.phone_number,
      seller_phone: seller?.phone_number,
      seller_paystack_recipient_code: seller?.recipient_code,
      listing: this.getListingById(o.listing_id),
      hub: o.hub_id ? this.getHubById(o.hub_id) : undefined,
      swap_proposal: o.swap_proposal_id ? this.proposals.find((p) => p.id === o.swap_proposal_id) : undefined
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: EscrowStatus,
    extraFields?: Record<string, unknown>
  ): Promise<EscrowOrder | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.escrow_status = status;
    order.updated_at = new Date().toISOString();
    if (extraFields) {
      Object.assign(order, extraFields);
    }
    return this.populateOrder(order);
  }

  async createTimelineEvent(params: {
    order_id: string;
    actor?: string;
    event_type: string;
    notes?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<EscrowTimelineEvent> {
    const desc = params.notes || params.description || params.event_type;
    const evt: EscrowTimelineEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: params.order_id,
      actor_id: params.actor,
      event_type: params.event_type,
      description: desc,
      metadata: params.metadata,
      created_at: new Date().toISOString()
    };
    this.timelineEvents.push(evt);
    return evt;
  }

  // Timeline events
  getTimelineEvents(orderId: string): EscrowTimelineEvent[] {
    return this.timelineEvents
      .filter((e) => e.order_id === orderId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addTimelineEvent(orderId: string, event_type: string, description: string, actor_id?: string) {
    this.timelineEvents.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      actor_id,
      event_type,
      description,
      created_at: new Date().toISOString()
    });
  }

  // ---------------------------------------------------------------------
  // SECTION 4B: 48-Hour Escrow State Machine Transitions
  // ---------------------------------------------------------------------

  /**
   * 1. On Paystack charge.success -> Locks funds in escrow
   */
  async lockEscrowFunds(paymentRef: string): Promise<EscrowOrder | null> {
    const order = this.orders.find((o) => o.payment_reference === paymentRef);
    if (!order) return null;

    order.escrow_status = 'FUNDS_LOCKED';
    order.updated_at = new Date().toISOString();

    // Lock listing status to IN_ESCROW
    const listing = this.listings.find((l) => l.id === order.listing_id);
    if (listing) {
      listing.status = 'IN_ESCROW';
    }

    this.addTimelineEvent(
      order.id,
      'FUNDS_LOCKED',
      `Paystack charge.success verified. ₦${order.total_escrow_amount.toLocaleString()} locked securely in SwapShield vault.`,
      order.buyer_id
    );

    // Send Termii SMS notification to seller
    const seller = this.getUserById(order.seller_id);
    if (seller) {
      await sendTermiiNotification({
        to: seller.phone_number,
        sms: SMS_TEMPLATES.escrowFundsLocked(
          order.total_escrow_amount,
          listing ? `${listing.brand} ${listing.model}` : 'Gadget'
        )
      });
    }

    return this.populateOrder(order);
  }

  /**
   * 2. Courier delivers / Buyer clicks "Device Received"
   * Sets status = DELIVERED_TESTING_PERIOD, sets timer = NOW + 48 HOURS, dispatches Termii SMS
   */
  async confirmDeliveryStartInspection(orderId: string): Promise<EscrowOrder | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    order.escrow_status = 'DELIVERED_TESTING_PERIOD';
    order.inspection_window_expires_at = expiresAt;
    order.updated_at = new Date().toISOString();

    const listing = this.getListingById(order.listing_id);
    const buyer = this.getUserById(order.buyer_id);

    this.addTimelineEvent(
      order.id,
      'DELIVERED_TESTING_PERIOD',
      `Device receipt confirmed. 48-Hour hardware inspection window activated until ${new Date(expiresAt).toLocaleString('en-NG')}.`,
      order.buyer_id
    );

    // Send Termii SMS with testing checklist prompt to buyer
    if (buyer) {
      await sendTermiiNotification({
        to: buyer.phone_number,
        sms: SMS_TEMPLATES.inspectionWindowStarted(
          listing ? `${listing.brand} ${listing.model}` : 'Device',
          new Date(expiresAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
        )
      });
    }

    return this.populateOrder(order);
  }

  /**
   * 3. SECTION 4C: Dispute Escalation Flow
   * Freezes timer, sets status = DISPUTED, generates return-waybill
   */
  async fileEscrowDispute(params: {
    orderId: string;
    raisedBy: string;
    reason: EscrowDispute['dispute_reason'];
    description: string;
    proofMediaUrls: string[];
  }): Promise<{ dispute: EscrowDispute; order: EscrowOrder } | null> {
    const order = this.orders.find((o) => o.id === params.orderId);
    if (!order) return null;

    // Freeze timer immediately
    order.escrow_status = 'DISPUTED';
    order.dispute_frozen_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    const waybillTracking = `SWP-RET-${Math.floor(100000 + Math.random() * 900000)}`;

    const dispute: EscrowDispute = {
      id: `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: params.orderId,
      raised_by: params.raisedBy,
      dispute_reason: params.reason,
      detailed_description: params.description,
      proof_media_urls: params.proofMediaUrls,
      resolution_status: 'OPEN',
      return_waybill_tracking: waybillTracking,
      return_hub_id: order.hub_id || 'hub_001_ikeja',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.disputes.unshift(dispute);

    this.addTimelineEvent(
      order.id,
      'DISPUTE_RAISED',
      `Buyer raised defect dispute: [${params.reason}]. 48-Hour timer FROZEN. Prepaid return waybill generated: ${waybillTracking}.`,
      params.raisedBy
    );

    // Send Termii alert
    const seller = this.getUserById(order.seller_id);
    if (seller) {
      await sendTermiiNotification({
        to: seller.phone_number,
        sms: SMS_TEMPLATES.disputeTriggered(order.id, waybillTracking)
      });
    }

    return { dispute, order: this.populateOrder(order) };
  }

  /**
   * 4. Manual or Automated Escrow Release -> Triggers Paystack transfer to seller
   */
  async releaseEscrowPayout(orderId: string, releasedByAdmin = false): Promise<EscrowOrder | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const seller = this.getUserById(order.seller_id);
    const listing = this.getListingById(order.listing_id);

    // Call Paystack Transfer
    const payoutRef = `PAYOUT_${Date.now()}_${order.id.slice(0, 6)}`;
    const payoutResult = await triggerSellerPayout({
      recipientCode: seller?.recipient_code || 'RCP_demo_seller',
      amountInNaira: order.total_escrow_amount,
      reason: `SwapShield Escrow Release for Order #${order.id}`,
      reference: payoutRef
    });

    order.escrow_status = 'COMPLETED';
    order.payout_transferred_at = new Date().toISOString();
    order.payout_reference = payoutResult.data.transfer_code;
    order.updated_at = new Date().toISOString();

    // Mark listing as SOLD
    if (listing) {
      const l = this.listings.find((item) => item.id === listing.id);
      if (l) l.status = 'SOLD';
    }

    this.addTimelineEvent(
      order.id,
      'PAYOUT_TRANSFERRED',
      `Inspection window cleared. Paystack transfer of ₦${order.total_escrow_amount.toLocaleString()} initiated to seller's verified bank account (${seller?.bank_name || 'Bank'}). Transfer Ref: ${payoutResult.data.transfer_code}.`,
      releasedByAdmin ? 'ADMIN_WORKER' : order.buyer_id
    );

    // Send Termii SMS to seller
    if (seller) {
      await sendTermiiNotification({
        to: seller.phone_number,
        sms: SMS_TEMPLATES.payoutReleased(
          order.total_escrow_amount,
          listing ? `${listing.brand} ${listing.model}` : 'Gadget',
          seller.bank_account_number?.slice(-4) || 'XXXX'
        )
      });
    }

    return this.populateOrder(order);
  }

  /**
   * 5. SECTION 4B: Auto-Release Worker (Cron job)
   * Finds all orders where escrow_status = 'DELIVERED_TESTING_PERIOD' AND inspection_window_expires_at <= NOW()
   * If no dispute, triggers automated Paystack payout and completes order
   */
  async runAutoReleaseCronWorker(): Promise<{
    processedCount: number;
    completedOrders: string[];
  }> {
    const now = new Date().getTime();
    const completedOrders: string[] = [];

    const eligibleOrders = this.orders.filter((o) => {
      if (o.escrow_status !== 'DELIVERED_TESTING_PERIOD') return false;
      if (!o.inspection_window_expires_at) return false;
      const expireTime = new Date(o.inspection_window_expires_at).getTime();
      return expireTime <= now;
    });

    for (const order of eligibleOrders) {
      // Check if open dispute exists
      const hasDispute = this.disputes.some(
        (d) => d.order_id === order.id && (d.resolution_status === 'OPEN' || d.resolution_status === 'UNDER_REVIEW')
      );

      if (!hasDispute) {
        await this.releaseEscrowPayout(order.id, true);
        completedOrders.push(order.id);
      }
    }

    return {
      processedCount: eligibleOrders.length,
      completedOrders
    };
  }

  // Fast-forward demo helper: adjust timer to expired so user can test the auto-release cron immediately
  fastForwardInspectionTimer(orderId: string, hoursAgo = 1): EscrowOrder | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const pastTime = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    order.inspection_window_expires_at = pastTime;
    order.updated_at = new Date().toISOString();
    return this.populateOrder(order);
  }
}

// Global Singleton for in-memory database across Next.js API requests
const globalForDb = globalThis as unknown as { swapshieldDb?: DatabaseStore };
if (!globalForDb.swapshieldDb) {
  globalForDb.swapshieldDb = new DatabaseStore();
} else {
  Object.setPrototypeOf(globalForDb.swapshieldDb, DatabaseStore.prototype);
}
export const db = globalForDb.swapshieldDb;
