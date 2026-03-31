import { Alert } from '@/lib/types';

export const KNOWN_ALERTS: Record<string, Alert> = {
  'HubSpot': { integration: 'HubSpot', message: 'Requires an access token', detail: 'Generate one at Settings → Integrations → Private Apps.' },
  'Google Analytics': { integration: 'Google Analytics', message: 'Needs a service account', detail: 'Requires a GCP service account JSON with GA4 read access.' },
  'LinkedIn': { integration: 'LinkedIn', message: 'Requires app approval', detail: 'Create a LinkedIn Developer app and request Marketing Developer Platform access.' },
  'SageMaker': { integration: 'SageMaker', message: 'Needs AWS credentials', detail: 'Requires IAM role or access key with SageMaker read/invoke permissions.' },
  'Notion': { integration: 'Notion', message: 'Needs an integration token', detail: 'Create an internal integration at notion.so/my-integrations.' },
};

export function getAlertsForIntegrations(integrations: string[]): Alert[] {
  return integrations.filter(i => i in KNOWN_ALERTS).map(i => KNOWN_ALERTS[i]);
}
