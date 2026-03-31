import { InstanceConfig } from './types';
import { getInstances } from './store';

const STORAGE_KEY = 'daimon-provisioner-instances';

export const MOCK_INSTANCES: InstanceConfig[] = [
  {
    id: 'acme-001',
    client: {
      name: 'Acme Corp',
      description: 'Marketing team ops bot',
    },
    integrations: ['Discord', 'GitHub', 'Toggl', 'HubSpot', 'Google Analytics', 'Onyx RAG', 'SageMaker'],
    system_packages: ['gh', 'claude-code', 'node 18'],
    prompt_variant: 'interactive',
    custom_prompt: null,
    features: {
      discord_archive: true,
      langfuse_tracing: true,
      bluedot_webhooks: false,
      ssr_panels: false,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [
      {
        title: 'Campaign performance review',
        steps: [
          { text: 'User asks for weekly report' },
          { text: 'pulls traffic data', tool: 'GA' },
          { text: 'pulls lead conversions', tool: 'HubSpot' },
          { text: 'bot synthesizes summary' },
        ],
      },
    ],
    alerts: [],
    status: 'running',
    created_at: '2026-03-29T10:00:00.000Z',
    updated_at: '2026-03-31T10:00:00.000Z',
  },
  {
    id: 'bright-002',
    client: {
      name: 'Bright Health',
      description: 'Clinical ops assistant',
    },
    integrations: ['Discord', 'GitHub', 'Jira', 'Confluence', 'PagerDuty', 'Datadog', 'Slack API', 'AWS CloudWatch', 'Onyx RAG'],
    system_packages: ['gh', 'claude-code', 'node 18', 'python3'],
    prompt_variant: 'interactive',
    custom_prompt: null,
    features: {
      discord_archive: true,
      langfuse_tracing: true,
      bluedot_webhooks: true,
      ssr_panels: false,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [
      {
        title: 'Incident triage',
        steps: [
          { text: 'PagerDuty fires alert' },
          { text: 'checks service health', tool: 'Datadog' },
          { text: 'creates incident ticket', tool: 'Jira' },
          { text: 'bot notifies on-call team' },
        ],
      },
    ],
    alerts: [],
    status: 'running',
    created_at: '2026-03-20T08:00:00.000Z',
    updated_at: '2026-03-28T14:00:00.000Z',
  },
  {
    id: 'meridian-003',
    client: {
      name: 'Meridian Capital',
      description: 'Portfolio analytics bot',
    },
    integrations: ['Discord', 'Bloomberg API', 'Snowflake', 'dbt'],
    system_packages: ['gh', 'python3'],
    prompt_variant: 'scheduled',
    custom_prompt: null,
    features: {
      discord_archive: false,
      langfuse_tracing: true,
      bluedot_webhooks: false,
      ssr_panels: true,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [],
    alerts: [
      {
        integration: 'Bloomberg API',
        message: 'Requires a Bloomberg B-PIPE subscription',
        detail: 'Contact your Bloomberg rep to provision API access for the bot service account.',
      },
      {
        integration: 'Snowflake',
        message: 'Needs a service account with warehouse access',
        detail: 'Create a dedicated user with READ access to the analytics warehouse.',
      },
    ],
    status: 'deploying',
    created_at: '2026-03-31T11:00:00.000Z',
    updated_at: '2026-03-31T12:30:00.000Z',
  },
  {
    id: 'northwind-004',
    client: {
      name: 'Northwind Traders',
      description: 'Supply chain coordinator',
    },
    integrations: ['Discord', 'GitHub', 'SAP', 'Shopify', 'Stripe', 'Twilio', 'AWS Lambda', 'Redis', 'PostgreSQL', 'Onyx RAG', 'Google Sheets'],
    system_packages: ['gh', 'claude-code', 'node 18', 'python3', 'terraform'],
    prompt_variant: 'routed',
    custom_prompt: null,
    features: {
      discord_archive: true,
      langfuse_tracing: true,
      bluedot_webhooks: true,
      ssr_panels: true,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [
      {
        title: 'Order fulfillment check',
        steps: [
          { text: 'User asks about order status' },
          { text: 'queries order data', tool: 'SAP' },
          { text: 'checks shipping status', tool: 'Shopify' },
          { text: 'bot reports fulfillment timeline' },
        ],
      },
      {
        title: 'Inventory alert',
        steps: [
          { text: 'Scheduled check runs' },
          { text: 'pulls inventory levels', tool: 'SAP' },
          { text: 'compares against thresholds', tool: 'Google Sheets' },
          { text: 'bot alerts if low stock' },
        ],
      },
    ],
    alerts: [],
    status: 'stopped',
    created_at: '2026-03-10T09:00:00.000Z',
    updated_at: '2026-03-17T16:00:00.000Z',
  },
];

export function seedMockData(): void {
  if (typeof window === 'undefined') return;
  const existing = getInstances();
  if (existing.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INSTANCES));
  }
}
