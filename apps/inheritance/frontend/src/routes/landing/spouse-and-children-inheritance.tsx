import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const spouseAndChildrenInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/spouse-and-children-inheritance',
  component: SpouseAndChildrenInheritancePage,
});

function SpouseAndChildrenInheritancePage() {
  return (
    <LandingPageLayout
      title="Inheritance Share of Surviving Spouse & Children — Philippines"
      description="Calculate how a Philippine estate is divided between the surviving spouse and children. Covers legitimate and illegitimate children under the Civil Code."
      headline="Spouse & Children Inheritance"
      subheadline="How the estate is divided when both a surviving spouse and children inherit."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'LegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2>Article 996: The Foundational Rule</h2>
          <p>
            When legitimate children and a surviving spouse all survive the decedent, Article 996 of the Civil Code governs
            the division. The surviving spouse receives a share equal to the share of one legitimate child. This means the
            estate is divided into equal parts among all legitimate children plus the spouse — the spouse counts as one
            child for purposes of apportionment. For example, if two legitimate children and a spouse survive, each receives
            one-third of the net distributable estate.
          </p>
          <h2>Division Examples</h2>
          <p>
            With one legitimate child and a surviving spouse, the estate is split 50/50. With three legitimate children and
            a surviving spouse, each of the four parties receives one-fourth. This proportional structure remains constant
            regardless of the estate size. When illegitimate children are also present, the calculus shifts: each
            illegitimate child receives one-half the share of a legitimate child, reducing the effective shares of all other
            heirs proportionally to satisfy the full legitime pool.
          </p>
          <h2>Community Property Considerations</h2>
          <p>
            Most Philippine marriages are governed by the absolute community of property regime. Under this system, only the
            decedent's half-share of the community property forms the net distributable estate subject to succession. The
            surviving spouse's own half is not part of the estate. For marriages under the conjugal partnership of gains
            regime, a similar split applies to the conjugal partnership. The calculator assumes the estate value entered is
            already the net distributable portion after the conjugal or community settlement.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/illegitimate-child-inheritance', label: 'Illegitimate Child Inheritance' },
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/legitimate-share-calculator', label: 'Legitimate Share Calculator' },
        { to: '/blog/no-will-philippines', label: 'Blog: What Happens When There Is No Will?' },
      ]}
    />
  );
}
