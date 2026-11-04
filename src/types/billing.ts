export type PlanId = 'starter' | 'small' | 'medium' | 'large' | 'enterprise';
export type Frequency = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  name: string;
  minUsers: number;
  maxUsers: number | null;
  monthly: number;
  annual: number | null;
  perUser?: number;
  blurb: string;
}

export interface Subscription {
  planId: PlanId;
  frequency: Frequency;
  enterpriseUsers: number;
  renewal: string;
  termStart: string;
  payment: 'paid' | 'failed';
  paymentMethod: string;
  failedOn?: string;
  amountDue?: number;
  cancelEffective?: string;
  scheduledFrequency?: Frequency;
  scheduledPlanId?: PlanId;
  scheduledEffective?: string;
}

export type ExportFormat = 'CSV' | 'Excel' | 'PDF';

export interface ExportJob {
  id: string;
  report: string;
  format: ExportFormat;
  range: string;
  dataType: string;
  status: 'running' | 'done' | 'failed';
  date: string;
  time: string;
  rows?: number;
  willFail?: boolean;
}