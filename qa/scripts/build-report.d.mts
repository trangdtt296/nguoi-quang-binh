export interface FeatureSummary {
  code: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  pending: number;
  notRun: number;
  /** Số mục thiết kế đã có case phủ / tổng, ví dụ "42/42". */
  coverage: string;
}

export function buildReport(options?: { quiet?: boolean; only?: string }): Promise<{
  reportPath: string;
  warnings: string[];
  features: FeatureSummary[];
}>;
