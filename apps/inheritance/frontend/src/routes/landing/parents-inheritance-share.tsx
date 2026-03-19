import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { LandingPageLayout } from '@/components/landing/LandingPageLayout';

export const parentsInheritanceShareRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/parents-inheritance-share',
  component: ParentsInheritanceSharePage,
});

function ParentsInheritanceSharePage() {
  return (
    <LandingPageLayout
      title="Inheritance of Parents — Philippine Succession Law"
      description="Calculate the inheritance share of surviving parents when there are no children. Philippine Civil Code rules for ascending heirs."
      headline="Parents' Inheritance Share"
      subheadline="How the estate is distributed when the deceased's parents are the surviving heirs."
      initialHeirs={[
        { type: 'Father' },
        { type: 'Mother' },
      ]}
      legalExplainer={
        <>
          <h2>Article 985: Parents as Heirs in the Absence of Children</h2>
          <p>
            Under Article 985 of the Philippine Civil Code, in the absence of legitimate children and descendants, the
            legitimate parents and ascendants shall inherit from the deceased. When both the father and mother survive, they
            inherit in equal shares — each receiving one-half of the net distributable estate. Parents are classified as
            compulsory heirs in the second line, meaning they are only called to inherit when no legitimate children or
            grandchildren exist. If only one parent survives, that parent takes the entire share reserved for the ascending
            line.
          </p>
          <h2>When the Surviving Spouse Also Survives (Article 1001)</h2>
          <p>
            Article 1001 governs the scenario where both the surviving spouse and the legitimate parents of the decedent
            survive, with no legitimate children. In this case, the estate is divided equally: one-half goes to the surviving
            spouse and the other half is split equally between the father and mother (or entirely to whichever parent
            survives). This rule prevents the spouse from taking everything while still protecting the parents' compulsory
            right to a portion of their child's estate.
          </p>
          <h2>Grandparents and More Remote Ascendants</h2>
          <p>
            If neither parent survives but grandparents do, Article 985 still applies in the ascending line — grandparents
            inherit when parents have predeceased the decedent. The right of representation does not apply in the ascending
            line (Article 972), so grandparents only inherit in their own right when both parents are gone. In practice, the
            presence of even one surviving parent excludes all grandparents from the intestate succession. Use the calculator
            with Father and Mother heirs to model the most common scenario; for grandparents, select no parents and use a
            free-text approach in the full case tool.
          </p>
        </>
      }
      relatedLinks={[
        { to: '/intestate-succession-calculator', label: 'Intestate Succession Calculator' },
        { to: '/spouse-and-children-inheritance', label: 'Spouse and Children Inheritance' },
        { to: '/blog/parents-inheritance-share', label: 'Blog: Estate Distribution When Both Parents Are Alive' },
        { to: '/legitimate-share-calculator', label: 'Legitimate Share Calculator' },
      ]}
    />
  );
}
