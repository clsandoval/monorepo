export { computeEstateTax, wizardStateToEngineInput } from './pipeline';
export { runAdvisor } from './advisor';
export { runSensitivity } from './sensitivity';
export type {
  EstateTaxFullOutput,
  EstateTaxScheduleSummary,
  ExplainerOutput,
  ExplainerSection,
  DualPathComparisonResult,
  TaxComputationResult,
} from './types';
export type { Suggestion } from './advisor';
export type { SensitivityResult } from './sensitivity';
