import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const illegitimateChildInheritanceRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/illegitimate-child-inheritance',
  component: IllegitimateChildInheritancePage,
});

function IllegitimateChildInheritancePage() {
  return (
    <LandingPageLayout
      title="Inheritance Rights of Illegitimate Children — Philippines"
      description="Understand the inheritance rights of illegitimate children under Philippine law. Calculate their share alongside legitimate heirs using the Civil Code rules."
      headline="Illegitimate Child Inheritance"
      subheadline="Calculate the inheritance share of illegitimate children under Philippine succession law."
      initialHeirs={[
        { type: 'SurvivingSpouse' },
        { type: 'LegitimateChild' },
        { type: 'IllegitimateChild' },
      ]}
      legalExplainer={
        <>
          <h2>Article 176 of the Family Code</h2>
          <p>
            Under Article 176 of the Family Code, as amended by Republic Act No. 9255, illegitimate children are entitled
            to support and to use the surname of their father, subject to conditions. For succession purposes, Article 176
            provides that illegitimate children shall inherit from both parents, and each illegitimate child shall receive
            one-half the share that a legitimate child would receive. This half-share rule applies whether or not a will
            exists, because the illegitimate child's share forms part of their compulsory legitime and cannot be reduced
            below that floor.
          </p>
          <h2>Proving Filiation</h2>
          <p>
            An illegitimate child's right to inherit depends on establishing filiation. Under Articles 172 and 175 of the
            Family Code, filiation may be proved by the record of birth appearing in a civil register, a final judgment, an
            admission of filiation in a public document or private handwritten instrument signed by the parent, or open and
            continuous possession of the status of an illegitimate child. Without any of these proofs, the claim to
            inheritance can be contested. The calculator assumes filiation is established for any illegitimate child you add.
          </p>
          <h2>Proportional Division Among All Heirs</h2>
          <p>
            When a surviving spouse, legitimate children, and illegitimate children all concur, the division proceeds by
            first computing the share of each legitimate child, then assigning each illegitimate child one-half of that
            share. The total is then reconciled against the net estate. For example, if the estate is ₱1,200,000, there is
            one legitimate child, one illegitimate child, and a surviving spouse: the legitimate child and the spouse each
            receive the same share, and the illegitimate child receives half of that amount. Try our calculator to see the
            exact figures for your family composition.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/spouse-and-children-inheritance', label: 'Spouse and Children Inheritance' },
        { to: '/legitimate-share-calculator', label: 'Legitimate Share Calculator' },
        { to: '/blog/illegitimate-children-rights', label: 'Blog: Rights of Illegitimate Children' },
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
      ]}
    />
  );
}
