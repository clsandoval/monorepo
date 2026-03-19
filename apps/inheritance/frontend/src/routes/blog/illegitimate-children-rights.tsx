import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogIllegitimateChildrenRightsRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/illegitimate-children-rights',
  component: BlogIllegitimateChildrenRightsPage,
});

function BlogIllegitimateChildrenRightsPage() {
  return (
    <BlogLayout meta={getBlogPost('illegitimate-children-rights')!}>
      <h2>Who Is an Illegitimate Child Under Philippine Law?</h2>
      <p>
        Under the Family Code of the Philippines, children born outside a valid marriage are classified as
        illegitimate. This includes children born to parents who were not married at the time of conception
        or birth, children born of void marriages (unless the parents contracted a subsequent valid marriage),
        and children born of adulterous or bigamous relationships. The classification matters significantly
        for succession because the law assigns different share sizes to legitimate and illegitimate children —
        but it does not strip illegitimate children of the right to inherit altogether.
      </p>

      <h2>The Half-Share Rule (Article 176, Family Code)</h2>
      <p>
        Article 176 of the Family Code, as amended by Republic Act No. 9255, provides that illegitimate
        children shall inherit from their parents in the same manner as legitimate children, except that
        each illegitimate child receives only one-half the share of each legitimate child. This half-share
        rule is compulsory — it cannot be reduced by a will, and if the will attempts to give the illegitimate
        child less than their half-share, the will is reducible to restore the compulsory minimum. Conversely,
        the testator may give the illegitimate child more than the half-share out of the free portion.
      </p>

      <h2>Proving Filiation: The Legal Requirements</h2>
      <p>
        Before an illegitimate child may claim any inheritance, filiation must be legally established.
        Articles 172 and 175 of the Family Code enumerate the acceptable proofs: (1) a birth certificate
        signed or acknowledged by the father; (2) a notarized private handwritten instrument signed by the
        parent recognizing the child; (3) open and continuous possession of the status of an illegitimate
        child, established by direct acts of the parent or the family; or (4) any other means allowed by
        existing laws. DNA evidence may be considered under modern Rules of Evidence. Filiation must be
        established during the lifetime of the putative parent or within four years after the child reaches
        majority, or within the prescriptive period for impugning legitimacy.
      </p>

      <h2>Concurrence With Other Heirs</h2>
      <p>
        Illegitimate children do not exclude legitimate children, the surviving spouse, or legitimate parents.
        They concur with all these heirs, but their presence reduces the shares of legitimate heirs
        proportionally. The mechanics work as follows: (a) compute the share of each legitimate child as
        though no illegitimate children existed; (b) assign each illegitimate child one-half that share;
        (c) verify that the total of all shares does not exceed the estate. If the total exceeds the estate,
        the Civil Code provides for pro-rata reduction of all shares except compulsory legitimes.
      </p>

      <h2>Surname Rights Under R.A. 9255</h2>
      <p>
        Republic Act No. 9255 amended Article 176 to allow illegitimate children to use the surname of their
        father, provided the father expressly recognizes the child in the birth certificate or a private
        document. This right to use the surname is distinct from inheritance rights — a child using the
        father's surname does not automatically have a stronger inheritance claim, and conversely, a child
        not using the surname can still inherit if filiation is otherwise established. For estate planning
        purposes, practitioners should ensure all filiation documents are in order before commencing
        extrajudicial settlement proceedings.
      </p>

      <h2>Practical Implications for Estate Settlement</h2>
      <p>
        When settling an estate with both legitimate and illegitimate children, all heirs must be identified
        and their filiation documented before any extrajudicial settlement deed is signed. Excluding a known
        illegitimate child from the settlement exposes all parties to a later action for annulment of the
        extrajudicial settlement and reconveyance of the heir's share. Our calculator helps you model the
        correct shares before finalizing any settlement — enter the exact heir composition to see how the
        estate should be divided.
      </p>
    </BlogLayout>
  );
}
