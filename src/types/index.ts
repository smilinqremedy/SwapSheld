// =====================================================================
// SwapShield Core TypeScript Types
// =====================================================================

export type GadgetCategory = 'SMARTPHONE' | 'LAPTOP' | 'TABLET' | 'ACCESSORY';

export type ScreenStatus = 'ORIGINAL' | 'REPLACED_OEM' | 'REPLACED_AFTERMARKET' | 'CRACKED';

export type BiometricStatus = 'WORKING' | 'FAULTY' | 'NOT_APPLICABLE';

export type ICloudStatus = 'CLEAN_UNLOCKED' | 'BYPASSED_FLAGGED';

export type PhysicalGrade = 'MINT_GRADE_A' | 'GOOD_GRADE_B' | 'FAIR_GRADE_C';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'IN_ESCROW' | 'SOLD' | 'DELISTED';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';

export type EscrowOrderType = 'OUTRIGHT_PURCHASE' | 'DEVICE_SWAP';

export type EscrowStatus = 
  | 'AWAITING_PAYMENT' 
  | 'FUNDS_LOCKED' 
  | 'IN_TRANSIT_TO_BUYER' 
  | 'DELIVERED_TESTING_PERIOD' 
  | 'DISPUTED' 
  | 'PAYOUT_APPROVED' 
  | 'REFUNDED' 
  | 'COMPLETED';

export type DisputeReason = 
  | 'BATTERY_MISMATCH' 
  | 'ICLOUD_LOCKED' 
  | 'AFTERMARKET_SCREEN_UNDISCLOSED' 
  | 'PHYSICAL_DAMAGE' 
  | 'NON_DELIVERY';

export type DisputeResolution = 
  | 'OPEN' 
  | 'UNDER_REVIEW' 
  | 'REFUND_BUYER' 
  | 'RELEASE_TO_SELLER';

export type DeliveryMode = 'DIRECT_COURIER' | 'HUB_VERIFICATION';

export interface User {
  id: string;
  email: string;
  phone_number: string;
  full_name: string;
  avatar_url?: string;
  bvn_verified: boolean;
  nin_verified: boolean;
  trust_score: number;
  bank_account_number?: string;
  bank_code?: string;
  bank_name?: string;
  recipient_code?: string;
  paystack_recipient_code?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionHub {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  agent_name: string;
  agent_phone: string;
  operating_hours: string;
  is_active: boolean;
  created_at?: string;
}

export interface GadgetListing {
  id: string;
  seller_id: string;
  seller?: User;
  category: GadgetCategory;
  brand: string;
  model: string;
  storage_capacity: string;
  ram?: string;
  color: string;
  imei_or_serial_hash: string;
  battery_health_percentage: number;
  battery_cycle_count?: number;
  screen_status: ScreenStatus;
  face_id_or_biometrics: BiometricStatus;
  icloud_or_mdm_status: ICloudStatus;
  physical_condition: PhysicalGrade;
  cash_price: number; // in NGN
  is_swap_eligible: boolean;
  accepted_swap_models: string[];
  media_urls: string[];
  diagnostic_report_notes?: string;
  diagnostic_score?: number; // e.g. 98% health score
  status: ListingStatus;
  created_at: string;
  updated_at?: string;
}

export interface SwapProposal {
  id: string;
  listing_id: string;
  target_listing?: GadgetListing;
  proposer_id: string;
  proposer?: User;
  offered_device_id: string;
  offered_device?: GadgetListing;
  proposed_cash_topup: number; // positive = proposer adds cash; negative = target seller adds cash
  status: ProposalStatus;
  proposer_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface EscrowOrder {
  id: string;
  order_type: EscrowOrderType;
  buyer_id: string;
  buyer?: User;
  seller_id: string;
  seller?: User;
  listing_id: string;
  listing?: GadgetListing;
  swap_proposal_id?: string;
  swap_proposal?: SwapProposal;
  delivery_mode: DeliveryMode;
  hub_id?: string;
  hub?: InspectionHub;
  total_escrow_amount: number; // in NGN
  platform_fee: number; // 5%
  inspection_fee: number; // 3500 NGN
  shipping_fee: number; // 4000 NGN
  payment_reference: string;
  paystack_access_code?: string;
  escrow_status: EscrowStatus;
  delivery_tracking_number?: string;
  courier_partner?: string;
  inspection_window_expires_at?: string; // ISO string (NOW + 48h)
  dispute_frozen_at?: string;
  payout_transferred_at?: string;
  payout_reference?: string;
  buyer_phone?: string;
  seller_phone?: string;
  seller_paystack_recipient_code?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowDispute {
  id: string;
  order_id: string;
  order?: EscrowOrder;
  raised_by: string;
  dispute_reason: DisputeReason;
  detailed_description: string;
  proof_media_urls: string[];
  resolution_status: DisputeResolution;
  return_waybill_tracking?: string;
  return_hub_id?: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface EscrowTimelineEvent {
  id: string;
  order_id: string;
  actor_id?: string;
  event_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Valuation Types
export interface DeviceValuationInput {
  category: GadgetCategory;
  brand: string;
  model: string;
  storage_capacity: string;
  ram?: string;
  battery_health_percentage: number;
  battery_cycle_count?: number;
  screen_status: ScreenStatus;
  face_id_or_biometrics: BiometricStatus;
  icloud_or_mdm_status: ICloudStatus;
  physical_condition: PhysicalGrade;
}

export interface PenaltyBreakdownItem {
  code: string;
  label: string;
  percentage: number;
  amount: number;
  reason: string;
}

export interface DeviceValuationResult {
  base_trade_in_value: number;
  fair_market_value: number;
  penalties: PenaltyBreakdownItem[];
  total_penalty_percentage: number;
  is_flagged: boolean;
  flag_reasons: string[];
}

export interface SwapCalculationResult {
  offered_device: DeviceValuationResult;
  target_device: DeviceValuationResult;
  recommended_cash_delta: number; // target_fair_value - offered_fair_value
  who_pays: 'PROPOSER_PAYS' | 'TARGET_SELLER_PAYS' | 'STRAIGHT_SWAP';
  summary: string;
}
