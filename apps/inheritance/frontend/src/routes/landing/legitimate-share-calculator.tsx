import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const legitimateShareCalculatorRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/legitimate-share-calculator',
  component: LegitimateShareCalculatorPage,
});

function LegitimateShareCalculatorPage() {
  return (
    <LandingPageLayout
      title="Legitime Calculator Philippines — Compute Compulsory Shares"
      description="Calculate the legitime (compulsory share) of each heir under Philippine succession law. Free tool based on the Civil Code."
      headline="Legitimate Share Calculator"
      subheadline="Compute the compulsory shares (legitimes) that the law guarantees to each heir."
      legalExplainer={
        <>
          <h2>What Is the Legitime?</h2>
          <p>
            The legitime is the portion of a deceased person's estate that the law reserves exclusively for compulsory heirs.
            Under Articles 886 to 914 of the Philippine Civil Code, a testator may freely dispose of only the free portion of
            the estate — the remainder after all legitimes have been satisfied. Any testamentary disposition that impairs the
            legitime is reducible on petition by the aggrieved heir. The legitime exists to protect the family from total
            disinheritance and cannot be waived in advance by the heir.
          </p>
          <h2>Who Are Compulsory Heirs and What Are Their Shares?</h2>
          <p>
            The Civil Code designates four classes of compulsory heirs: (1) legitimate children and descendants, who receive
            one-half of the estate when alone, or three-fourths when concurring with the surviving spouse; (2) legitimate
            parents and ascendants, who receive one-half of the estate when no legitimate children exist; (3) the surviving
            spouse, whose legitime ranges from one-fourth to one-half depending on who else survives; and (4) illegitimate
            children, each of whom receives one-half the share of a legitimate child. When multiple classes concur, the Civil
            Code provides specific rules for each combination.
          </p>
          <h2>How to Use This Calculator</h2>
          <p>
            Select the heirs present in the estate and enter the net distributable estate value. The calculator applies the
            exact legitime fractions from Articles 888 to 903 and computes both the compulsory share and the free portion
            available for testamentary disposition or additional distribution. Results show per-heir breakdowns in pesos,
            making it easy to verify compliance with a client's will or plan an estate distribution strategy.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse and Children Inheritance' },
        { to: '/blog/how-to-compute-legitime', label: 'Blog: How to Compute the Legitime' },
        { to: '/blog/preterition-explained', label: 'Blog: Preterition Explained' },
      ]}
    />
  );
}
