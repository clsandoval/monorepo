import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    question: 'Do I need to host my own bot?',
    answer:
      'No. Daimon runs the bot infrastructure for you on Fly.io. You bring your Discord bot token (which you create once in the Discord Developer Portal) — Daimon handles the rest. Your bot stays online 24/7 without you managing servers.',
  },
  {
    question: 'What is BYOK (Bring Your Own Keys)?',
    answer:
      'BYOK means you provide your own Anthropic API key. When your bot responds to messages in Discord, the AI processing cost goes directly to your Anthropic account. Daimon only charges the small platform fee listed above — we never add a markup to your AI usage.',
  },
  {
    question: 'How do I create a Discord bot token?',
    answer:
      'Go to discord.com/developers/applications, create a new application, navigate to the "Bot" section, and click "Reset Token" to generate your token. Enable the "Message Content" intent under Privileged Gateway Intents. Copy the token. Also copy your server\'s ID (right-click your server icon → Copy Server ID). Paste both into your Daimon dashboard. Our Quick Start guide has step-by-step screenshots.',
  },
  {
    question: 'Is my bot token stored securely?',
    answer:
      'Yes. Your Discord bot token and API keys are encrypted at rest using Supabase Vault (AES-256 encryption). They are never returned in API responses or logs. Daimon staff cannot view your credentials.',
  },
  {
    question: 'What services can my bot use?',
    answer:
      'All 50+ tools are available to every tier. You connect your own accounts for each service (GitHub, Google, Linear, Toggl, Notion, Slack, etc.) and the tools activate. Services you haven\'t connected simply won\'t be used.',
  },
  {
    question: 'Can I use my own OpenAI key?',
    answer:
      'Optionally. Daimon uses Claude (Anthropic) as the primary AI model. Some classification tasks can optionally use OpenAI — if you paste an OpenAI key, it will be used for those tasks. An OpenAI key is not required.',
  },
  {
    question: 'What happens if my Anthropic API key runs out of credits?',
    answer:
      'The bot will stop responding to messages and Daimon will mark your API key as invalid. Your dashboard will show an error state on the "API Keys" card. Update your key or add Anthropic credits to restore service.',
  },
  {
    question: 'Can I connect multiple Discord servers?',
    answer:
      'Free and Starter plans support 1 Discord connection. Pro supports up to 5 connections, each pointing to a different Discord server with the same bot token or different tokens.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer:
      "We don't offer a time-limited trial, but the Free tier is genuinely functional — all tools available, no expiration. Upgrade only when you want priority support, analytics, or multi-server support.",
  },
  {
    question: 'How do I cancel?',
    answer:
      'From your dashboard → Billing → Manage Subscription. This opens the Stripe Customer Portal where you can cancel immediately. Your plan downgrades to Free at the end of your billing period. No data is deleted for 30 days after downgrade.',
  },
  {
    question: 'What if the bot disconnects?',
    answer:
      "Daimon's health monitoring detects disconnections within 60 seconds and automatically attempts to reconnect using exponential backoff (up to 10 attempts over ~25 minutes). Your dashboard will show a \"Reconnecting…\" status. If reconnection fails, you'll see an error state with the specific error message from Discord.",
  },
  {
    question: 'Do you offer team plans or enterprise?',
    answer:
      'Pro supports up to 5 team members. For enterprise needs (more servers, custom SLAs, private deployments), contact us at hello@daimon.ai.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" aria-label="FAQ" className="scroll-mt-20">
      <div className="bg-card py-24 max-md:py-16">
        <div className="mx-auto max-w-[896px] px-8 max-md:px-6">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="font-headline-semi-expanded mb-12 text-center text-[clamp(28px,3.5vw,44px)] font-medium text-foreground">
            Common questions.
          </h2>

          <Accordion>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={index}>
                <AccordionTrigger className="py-5 text-[17px] font-medium leading-snug text-foreground max-md:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground max-md:text-[15px]">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
