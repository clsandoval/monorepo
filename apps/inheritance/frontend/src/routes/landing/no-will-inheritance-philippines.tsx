import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const noWillInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/no-will-inheritance-philippines',
  component: NoWillInheritancePage,
});

function NoWillInheritancePage() {
  return (
    <LandingPageLayout
      title="Who Inherits If There Is No Will? — Philippine Law"
      description="Find out who inherits when someone dies without a will in the Philippines. Order of intestate succession under the Civil Code explained."
      headline="No Will? Here's Who Inherits"
      subheadline="The Philippine Civil Code prescribes exactly who inherits and how much when there is no will."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'LegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2>The Order of Intestate Succession (Articles 960–1014)</h2>
          <p>
            When a person dies without a will, Articles 960 to 1014 of the Philippine Civil Code establish the mandatory
            order in which heirs inherit. Legitimate children and descendants have first priority and exclude more remote
            relatives. If none exist, legitimate parents and ascendants inherit. The surviving spouse always inherits
            alongside whichever primary class is present, with a share determined by the specific concurrence. Collateral
            relatives — siblings, nephews and nieces, and other relatives up to the fifth degree of consanguinity — inherit
            only when no direct relatives and no surviving spouse exist.
          </p>
          <h2>Illegitimate Children in Intestate Succession</h2>
          <p>
            Illegitimate children do not displace legitimate children but inherit concurrently. Each illegitimate child
            receives one-half of the share of each legitimate child (Article 176, Family Code). They also concur with the
            surviving spouse, and all shares are computed proportionally so that the total does not exceed the net estate.
            Importantly, filiation must be established before the illegitimate child can claim any share — a contested
            filiation will delay or block distribution until resolved by the courts.
          </p>
          <h2>The State as Last Resort (Article 1011)</h2>
          <p>
            If a person dies intestate with no surviving heirs of any kind — no children, no parents, no spouse, no
            siblings, no relatives within the fifth civil degree — the entire estate escheats to the State under Article
            1011. In practice, the municipal or city government where the deceased resided takes the estate for public
            benefit, such as funding public schools or hospitals. Escheat proceedings require a court petition, and known
            claimants have the right to appear and establish their relationship within the prescriptive period. Our
            calculator models all common heir combinations; for unusual family compositions, consult a succession attorney.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse and Children Inheritance' },
        { to: '/parents-inheritance-share', label: 'Parents\' Inheritance Share' },
        { to: '/blog/no-will-philippines', label: 'Blog: What Happens When There Is No Will?' },
      ]}
    />
  );
}
