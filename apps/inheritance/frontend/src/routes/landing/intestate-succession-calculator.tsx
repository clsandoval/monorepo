import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const intestateSuccessionCalculatorRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/intestate-succession-calculator',
  component: IntestateSuccessionCalculatorPage,
});

function IntestateSuccessionCalculatorPage() {
  return (
    <LandingPageLayout
      title="Intestate Succession Calculator Philippines"
      description="Free online calculator for intestate succession under Philippine law. Compute inheritance shares when there is no will, based on the Civil Code of the Philippines."
      headline="Intestate Succession Calculator"
      subheadline="Compute inheritance shares when the deceased left no will. Based on Articles 960–1014 of the Civil Code."
      legalExplainer={
        <>
          <h2>What Is Intestate Succession?</h2>
          <p>
            Intestate succession governs how a deceased person's estate is distributed when they die without a valid will, or
            when an existing will fails to cover the entire estate. Under Articles 960 to 1014 of the Philippine Civil Code,
            the law prescribes a fixed order of priority among heirs, ensuring that the estate always passes to the closest
            surviving relatives. The rules are mandatory — parties cannot contract around them — and apply equally whether
            the decedent was a Philippine national or a foreigner whose estate is situated in the Philippines.
          </p>
          <h2>Who Are the Compulsory Heirs?</h2>
          <p>
            Philippine law recognizes compulsory heirs whose right to inherit cannot be defeated even by a will: legitimate
            children and descendants, legitimate parents and ascendants, the surviving spouse, and acknowledged illegitimate
            children. In intestacy, these heirs take first, in the order established by the Civil Code. Legitimate children
            exclude parents and more remote ascendants; the surviving spouse always inherits alongside the primary line.
            Illegitimate children are entitled to one-half of the share of each legitimate child (Article 176 of the Family
            Code, as amended by R.A. 9255).
          </p>
          <h2>How the Calculator Applies the Rules</h2>
          <p>
            Our calculator encodes Articles 960 to 1014 in full: it evaluates the composition of the surviving family,
            determines the applicable succession scenario, and produces the exact peso share for each heir. Enter the net
            distributable estate and select the heirs to see results instantly. Common scenarios — spouse with children,
            parents without children, collateral relatives — are all covered. For more complex situations involving wills,
            donations, or preterition, create a free account to access the full case engine.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/spouse-and-children-inheritance', label: 'Spouse and Children Inheritance' },
        { to: '/no-will-inheritance-philippines', label: 'No Will? Here\'s Who Inherits' },
        { to: '/legitimate-share-calculator', label: 'Legitimate Share Calculator' },
        { to: '/blog/intestate-vs-testate', label: 'Blog: Intestate vs Testate Succession' },
      ]}
    />
  );
}
