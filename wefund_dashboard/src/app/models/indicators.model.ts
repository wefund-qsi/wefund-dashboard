export interface DatePeriod {
  from: string;
  to: string;
}

export interface ActiveCampaignsData {
  date: string;
  count: number;
}

export interface ActiveCampaignsResponse {
  indicator: 'active_campaigns_over_period';
  period: DatePeriod;
  data: ActiveCampaignsData[];
}

export interface TotalAmountData {
  date: string;
  amount_eur: number;
}

export interface TotalAmountResponse {
  indicator: 'total_amount_collected';
  period: DatePeriod;
  data: TotalAmountData[];
}

export interface SuccessRateData {
  total_campaigns: number;
  successful: number;
  failed: number;
  active: number;
  success_rate_percent: number;
}

export interface SuccessRateResponse {
  indicator: 'global_success_rate';
  data: SuccessRateData;
}

export interface TotalContributionsData {
  date: string;
  count: number;
}

export interface TotalContributionsResponse {
  indicator: 'total_contributions_over_period';
  period: DatePeriod;
  data: TotalContributionsData[];
}

export interface AvgContributionsData {
  total_contributions: number;
  total_campaigns: number;
  average: number;
}

export interface AvgContributionsResponse {
  indicator: 'avg_contributions_per_campaign';
  period: DatePeriod;
  data: AvgContributionsData;
}

export interface AvgAmountData {
  total_amount_eur: number;
  total_contributions: number;
  average_eur: number;
}

export interface AvgAmountResponse {
  indicator: 'avg_amount_per_contribution';
  period: DatePeriod;
  data: AvgAmountData;
}

export type DashboardResponse = 
  | ActiveCampaignsResponse 
  | TotalAmountResponse 
  | SuccessRateResponse 
  | TotalContributionsResponse 
  | AvgContributionsResponse 
  | AvgAmountResponse;
