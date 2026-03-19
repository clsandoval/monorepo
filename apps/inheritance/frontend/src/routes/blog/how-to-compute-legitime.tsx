import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogHowToComputeLegitimeRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/how-to-compute-legitime',
  component: BlogHowToComputeLegitiemPage,
});

function BlogHowToComputeLegitiemPage() {
  return (
    <BlogLayout meta={getBlogPost('how-to-compute-legitime')!}>
      <h2>What Is the Legitime?</h2>
      <p>
        The legitime is the portion of a testator's estate that the law sets aside for compulsory heirs and
        which cannot be diminished by donations inter vivos or mortis causa, or by any testamentary disposition.
        Articles 886 to 914 of the Philippine Civil Code establish the legitime fractions for each class of
        compulsory heir. The portion of the estate not covered by legitimes — called the free portion —
        may be given to anyone.
      </p>

      <h2>Step 1: Identify the Compulsory Heirs Present</h2>
      <p>
        Begin by listing all compulsory heirs who survive the decedent. The Civil Code recognizes four classes:
        (1) legitimate children and descendants; (2) in default of (1), legitimate parents and ascendants;
        (3) the surviving spouse; and (4) illegitimate children. The presence or absence of each class changes
        the applicable legitime fractions. Note that the surviving spouse is always a compulsory heir regardless
        of which other heirs exist, whereas parents are excluded whenever legitimate children or grandchildren
        survive.
      </p>

      <h2>Step 2: Determine the Net Distributable Estate</h2>
      <p>
        The legitime is computed on the net estate, which is the gross estate minus debts, charges, and
        obligations of the decedent. Under Article 908, the value of donations inter vivos made by the decedent
        must be added back (collated) to arrive at the base for legitime computation — a process called collation.
        If the donated value would impair the legitime, the donation is subject to reduction (inofficious
        donation). For this calculator, enter the net distributable estate after debts but before any
        collation adjustments.
      </p>

      <h2>Step 3: Apply the Legitime Fractions</h2>
      <p>
        The fractions under the Civil Code are as follows. When only legitimate children survive: each child
        receives an equal share of one-half the estate divided by the number of children (Article 888). When
        legitimate children and the surviving spouse concur: the total legitime is three-fourths of the estate,
        with the spouse receiving a share equal to one legitimate child's share (Article 892). When only
        legitimate parents survive: they receive one-half the estate (Article 889). When legitimate parents
        and the spouse concur but no children exist: parents receive one-fourth, spouse receives one-fourth
        (Article 889 read with Article 1001). Illegitimate children always receive one-half the share of each
        legitimate child (Article 176, Family Code).
      </p>

      <h2>Step 4: Compute the Free Portion</h2>
      <p>
        Subtract the total legitime from the net distributable estate to find the free portion. Example: estate
        of ₱2,000,000, two legitimate children, surviving spouse. Total legitime = three-fourths × ₱2,000,000
        = ₱1,500,000. Free portion = ₱500,000. The ₱1,500,000 is split three ways (two children plus spouse
        as equal unit): each receives ₱500,000 as their compulsory share, and the remaining ₱500,000 is the
        testator's free portion.
      </p>

      <h2>Step 5: Check for Impairment and Reduce</h2>
      <p>
        If a will's specific bequests consume the free portion and also intrude into the legitime, those
        bequests are reduced pro rata until the legitime is fully restored (Article 911). The order of
        reduction is: (a) non-compulsory testamentary dispositions, then (b) donations inter vivos in
        reverse chronological order. This reduction process is automatic upon petition by an aggrieved heir
        and does not require the entire will to be annulled. Use our full case engine to model will
        dispositions and see exactly which bequests would be reduced.
      </p>
    </BlogLayout>
  );
}
