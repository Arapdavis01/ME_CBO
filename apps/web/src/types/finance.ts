export type DonationStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type PaymentMethod = "MPESA" | "CARD" | "PAYPAL" | "BANK";

export type Donation = {
  id: string;
  amountKes: number;
  method: PaymentMethod;
  status: DonationStatus;
  donorName: string;
  donorEmail?: string | null;
  donorPhone?: string | null;
  message?: string | null;
  createdAt: string;
  receiptUrl?: string | null;
  isAnonymous: boolean;
};

export type DuesPlan = {
  id: string;
  name: string;
  amountKes: number;
  period: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  description: string;
};

export type DuesInvoice = {
  id: string;
  memberId: string;
  memberName: string;
  planName: string;
  amountKes: number;
  periodLabel: string;
  dueDate: string;
  status: "PAID" | "DUE" | "OVERDUE" | "WAIVED";
  paidAt?: string | null;
  method?: PaymentMethod | null;
};

export type Expense = {
  id: string;
  category:
    | "SEEDLINGS"
    | "EQUIPMENT"
    | "TRANSPORT"
    | "TRAINING"
    | "ADMIN"
    | "OUTREACH"
    | "OTHER";
  description: string;
  amountKes: number;
  paidTo: string;
  receiptUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
};

export type FinanceSummary = {
  totalDonationsKes: number;
  totalDuesKes: number;
  totalExpensesKes: number;
  balanceKes: number;
  monthToDateKes: number;
};
