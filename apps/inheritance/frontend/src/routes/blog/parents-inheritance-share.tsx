import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogParentsInheritanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/parents-inheritance-share',
  component: BlogParentsInheritanceSharePage,
});

function BlogParentsInheritanceSharePage() {
  return (
    <BlogLayout meta={getBlogPost('parents-inheritance-share')!}>
      <h2>When Do Parents Inherit?</h2>
      <p>
        Parents become intestate heirs only when the decedent leaves no legitimate children, grandchildren, or
        other descendants. Under Article 985 of the Civil Code, legitimate parents (and more remote ascendants)
        are in the second line of succession. They are excluded entirely whenever even one legitimate child or
        grandchild survives. This exclusion rule is strict — a grandchild excludes grandparents just as a child
        excludes parents. Illegitimate children do not exclude parents; the two groups may concur, with the
        parents taking their ascendant share and the illegitimate children taking one-half the share each would
        have received as legitimate children.
      </p>

      <h2>Both Parents Alive, No Spouse (Article 985)</h2>
      <p>
        When both parents survive and there is no surviving spouse (and no children), the estate is divided
        equally between the father and the mother — each receives one-half. This is true regardless of the
        age, financial status, or other characteristics of the parents. The law makes no distinction between
        the paternal and maternal lines in the ascending line; both parents stand on equal footing. If only
        one parent survives, that parent takes the entire estate as the sole heir in the first ascending degree.
      </p>

      <h2>Both Parents and Surviving Spouse (Article 1001)</h2>
      <p>
        The more common and legally interesting scenario arises when the surviving spouse concurs with the
        legitimate parents of the decedent. Article 1001 prescribes: "Should brothers and sisters or their
        children survive with the widow or widower, the latter shall be entitled to one-half of the inheritance
        and the brothers and sisters or their children to the other half." Wait — that's Article 1001 on
        siblings. The correct provision for parents and spouse is found by reading Articles 889 and 1001
        together: the spouse receives one-half, and the parents divide the remaining one-half equally between
        them (one-quarter each). If only one parent survives, that parent receives one-half and the spouse
        receives the other half.
      </p>

      <h2>Grandparents and More Remote Ascendants</h2>
      <p>
        If both parents have predeceased the decedent, the paternal and maternal grandparents are called to
        inherit. Article 985 applies in the ascending line: the nearer ascendants exclude more remote ones.
        However — critically — the right of representation does not apply in the ascending line (Article 972).
        This means that if both parents are dead and one set of grandparents is also dead, the surviving
        grandparents do not represent the deceased grandparents; instead, the surviving grandparents inherit
        in their own right on whichever side they belong to. The result can seem unequal: if the paternal
        grandparents both died and the maternal grandmother survived, the maternal grandmother alone inherits
        everything from the ascending line.
      </p>

      <h2>Interaction With Illegitimate Children</h2>
      <p>
        When illegitimate children of the decedent survive alongside the parents, the estate is split between
        the two groups. The parents retain their ascending share, and the illegitimate children receive their
        proportional share as per the half-share rule. The surviving spouse, if present, also concurs. These
        multi-class scenarios can produce non-intuitive fractions; the calculator handles all combinations
        automatically. Enter the specific heirs present to generate the exact distribution.
      </p>

      <h2>Common Mistakes in Estate Settlement</h2>
      <p>
        A frequent mistake in estate settlements involving parents is the failure to account for the
        surviving spouse's superior right. Families sometimes assume that the decedent's parents are the
        primary heirs, overlooking that the spouse's concurrent right to half the estate is mandatory and
        non-waivable except by the spouse themselves. Another mistake is ignoring illegitimate children of
        the decedent who may have a legal claim. Before executing any extrajudicial settlement, verify the
        full heir composition using the correct legal rules.
      </p>
    </BlogLayout>
  );
}
