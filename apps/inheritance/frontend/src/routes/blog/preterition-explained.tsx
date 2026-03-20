import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogPreteritionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/preterition-explained',
  component: BlogPreteritionPage,
});

function BlogPreteritionPage() {
  return (
    <BlogLayout meta={getBlogPost('preterition-explained')!}>
      <h2>What Is Preterition?</h2>
      <p>
        Preterition is the total omission of a compulsory heir in the direct line from the testator's will —
        the heir is neither given anything nor expressly disinherited. Article 854 of the Philippine Civil Code
        defines and governs it: "The preterition or omission of one, some, or all of the compulsory heirs in
        the direct line, whether living at the time of the execution of the will or born after the death of
        the testator, shall annul the institution of heir; but the devises and legacies shall be valid insofar
        as they are not inofficious."
      </p>

      <h2>Who Can Be Preterited?</h2>
      <p>
        Only compulsory heirs in the direct line can be preterited. This means legitimate children and
        grandchildren (descending direct line) and legitimate parents and grandparents (ascending direct line)
        when no descendants exist. The surviving spouse cannot be preterited — an omission of the spouse's
        share is treated differently (as an impairment of the legitime subject to reduction, not preterition).
        Illegitimate children are also generally not considered subject to preterition under the prevailing
        view, though their omission may still give rise to a claim for their compulsory share.
      </p>

      <h2>Effect: Annulment of Heir Institutions</h2>
      <p>
        The dramatic effect of Article 854 is that preterition annuls the institution of all heirs named in
        the will — not just the disposition that harmed the preterited heir. If a testator left everything to
        one child and completely omitted a second child, the institution of the first child is annulled in
        its entirety. The estate then passes as if there were no will — intestate succession applies — unless
        the will contained specific devises and legacies (which are preserved as long as they do not impair
        the legitime).
      </p>

      <h2>Preterition vs. Imperfect Disinheritance</h2>
      <p>
        Preterition must be distinguished from imperfect disinheritance. Disinheritance is the intentional
        exclusion of a compulsory heir for a cause recognized by law (Articles 915–920). If disinheritance is
        attempted but the stated cause is not legally recognized or is not proven true, it is considered
        imperfect disinheritance — the effect is not annulment of heir institutions but merely reduction of
        the other heirs' shares to restore the preterited heir's legitime. Preterition, by contrast, involves
        total silence — the heir is simply not mentioned, not given anything, and not disinherited.
      </p>

      <h2>Devises and Legacies Survive Preterition</h2>
      <p>
        Even when heir institutions are annulled by preterition, specific bequests of identified property
        (devises) and gifts of a sum of money or personal property (legacies) remain valid to the extent they
        do not impair the legitime. The preterited heir's rights are satisfied first out of the estate;
        whatever remains — after restoring the legitime — may still go to the legatees and devisees named
        in the will. This nuance means a partially effective will is still worth probating, even in preterition
        cases.
      </p>

      <h2>Practical Implications for Estate Planning</h2>
      <p>
        Preterition is entirely avoidable with careful drafting. At a minimum, every compulsory heir in the
        direct line should be expressly mentioned in the will, even if the testator's intent is to give them
        only their minimum compulsory share. A clause such as "I give my child [name] their legitime as
        provided by law" satisfies Article 854 and prevents the catastrophic annulment of heir institutions.
        Attorneys drafting wills should also conduct a thorough family survey to ensure no heir has been
        inadvertently omitted, particularly where the testator has children from multiple relationships.
      </p>
    </BlogLayout>
  );
}
