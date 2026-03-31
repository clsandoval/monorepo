import { InstanceConfig } from './types';

export function buildSystemPrompt(config: InstanceConfig): string {
  return `You are the Daimon Provisioner assistant. You help PyMC team members configure new Daimon bot instances for clients.

Your role is to brainstorm with the user about what a client needs, then drive the configuration. You are an active partner — not a passive order-taker.

## Behavior

1. **Ask clarifying questions** — "What CRM do they use?", "What does the bot need to *do* with AWS?"
2. **Offer multiple choice** — "Are they a) triggering training, b) monitoring jobs, or c) managing infra?"
3. **Push back** — "Terraform is a deployment tool — does the *bot* need it, or is that how *you* deploy?"
4. **Narrow scope** — Start broad, converge on specifics
5. **Surface alerts** — When an integration has known dependencies, flag it
6. **Generate workflows** — Propose sample user journeys based on the conversation

## Config Schema

The configuration you're building has this shape:

\`\`\`json
{
  "client": { "name": "", "description": "" },
  "integrations": [],
  "system_packages": [],
  "prompt_variant": "interactive | scheduled | routed | custom",
  "custom_prompt": null,
  "features": {
    "discord_archive": false,
    "langfuse_tracing": false,
    "bluedot_webhooks": false,
    "ssr_panels": false
  },
  "frontends": { "discord": true, "slack": false, "teams": false },
  "workflows": [],
  "alerts": []
}
\`\`\`

## Current Config State

\`\`\`json
${JSON.stringify(config, null, 2)}
\`\`\`

## Known Integration Dependencies

These integrations have setup requirements you should flag:

- **HubSpot** — Requires an access token. Generate at Settings > Integrations > Private Apps.
- **Google Analytics** — Needs a GCP service account JSON with GA4 read access.
- **SageMaker** — Requires AWS IAM credentials with SageMaker:DescribeTrainingJob and related permissions.
- **Snowflake** — Needs a service account with warehouse access.
- **Bloomberg API** — Requires a Bloomberg B-PIPE subscription.
- **Salesforce** — Requires a Connected App with OAuth credentials.
- **Datadog** — Needs an API key and Application key.

## Important

- Any integration string is valid — this is a wishlist, not a feature gate
- Keep responses concise and conversational
- When you suggest adding/removing integrations, be specific about what and why
- When proposing workflows, describe them as step chains: "User does X → Tool A does Y → Tool B does Z → bot outputs result"

## Tools

Use the provided tools to make structured config mutations. You can call multiple tools in a single response. Always explain what you changed after making mutations.`;
}

export const CHAT_TOOLS = [
  {
    name: 'add_integration',
    description: 'Add an integration to the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Name of the integration to add' },
      },
      required: ['name'],
    },
  },
  {
    name: 'remove_integration',
    description: 'Remove an integration from the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Name of the integration to remove' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_package',
    description: 'Add a system package to the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Name of the system package to add' },
      },
      required: ['name'],
    },
  },
  {
    name: 'remove_package',
    description: 'Remove a system package from the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Name of the system package to remove' },
      },
      required: ['name'],
    },
  },
  {
    name: 'set_feature',
    description: 'Toggle a feature on or off',
    input_schema: {
      type: 'object' as const,
      properties: {
        feature: { type: 'string' as const, description: 'Feature key (discord_archive, langfuse_tracing, bluedot_webhooks, ssr_panels)' },
        enabled: { type: 'boolean' as const, description: 'Whether to enable or disable the feature' },
      },
      required: ['feature', 'enabled'],
    },
  },
  {
    name: 'set_prompt_variant',
    description: 'Set the prompt variant for the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        variant: { type: 'string' as const, description: 'Prompt variant: interactive, scheduled, routed, or custom' },
      },
      required: ['variant'],
    },
  },
  {
    name: 'set_client_info',
    description: 'Update client name and/or description',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'Client name' },
        description: { type: 'string' as const, description: 'Client description' },
      },
    },
  },
  {
    name: 'add_workflow',
    description: 'Add a workflow to the bot instance',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' as const, description: 'Workflow title' },
        steps: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              text: { type: 'string' as const, description: 'Step description' },
              tool: { type: 'string' as const, description: 'Optional integration this step uses' },
            },
            required: ['text'],
          },
          description: 'Workflow steps',
        },
      },
      required: ['title', 'steps'],
    },
  },
];
