import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogNoWillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/no-will-philippines',
  component: BlogNoWillPage,
});

function BlogNoWillPage() {
  return (
    <BlogLayout meta={getBlogPost('no-will-philippines')!}>
      <h2>The Legal Framework: Articles 960 to 1014</h2>
      <p>
        When a Filipino citizen (or a foreigner with property in the Philippines) dies without leaving a valid
        will, Articles 960 to 1014 of the Civil Code take over automatically. These provisions establish a
        rigid order of succession designed to ensure that the estate always passes to the surviving family
        members who are closest in relationship to the decedent. There is no gap in the law — someone always
        inherits, even if it ultimately becomes the State.
      </p>

      <h2>The Priority Order</h2>
      <p>
        The Civil Code's priority order is as follows: (1) Legitimate children and descendants — they inherit
        first and exclude all ascendants except the surviving spouse. (2) Legitimate parents and ascendants —
        they inherit in the absence of legitimate children or grandchildren. (3) The surviving spouse — always
        inherits, concurring with whichever primary line is present; their share depends on who else survives.
        (4) Illegitimate children — inherit concurrently with all the above, receiving one-half the share of
        each legitimate child. (5) Collateral relatives (siblings, nephews, nieces, and other relatives up to
        the fifth civil degree) — inherit only when no spouse, descendants, or ascendants exist.
      </p>

      <h2>Common Scenarios and Their Results</h2>
      <p>
        Scenario A — Spouse and two legitimate children: the estate is divided into three equal parts (spouse
        counts as one child for this purpose under Article 996). Scenario B — No children, surviving parents
        and spouse: one-half to spouse, one-quarter to father, one-quarter to mother under Article 1001.
        Scenario C — No spouse, no children, both parents alive: father and mother split the estate equally
        under Article 985. Scenario D — No direct family, one sibling: the sibling inherits the entire estate
        as a collateral relative under Article 1003.
      </p>

      <h2>The Role of Illegitimate Children</h2>
      <p>
        Illegitimate children are always a source of complexity in intestate settlements. They have a
        compulsory right to inherit regardless of whether the other heirs acknowledge the relationship.
        If the decedent recognized illegitimate children during their lifetime, those children must be included
        in any extrajudicial settlement; excluding them renders the settlement voidable at their instance.
        Even unrecognized illegitimate children may bring an action to establish filiation and claim their
        share within the prescriptive period.
      </p>

      <h2>Extrajudicial Settlement: The Practical Path</h2>
      <p>
        When the decedent left no debts and the heirs are agreed, they may settle the estate extrajudicially
        under Rule 74 of the Rules of Court. The heirs execute a notarized Deed of Extrajudicial Settlement,
        publish it once a week for three consecutive weeks in a newspaper of general circulation, and then
        transfer titles accordingly. This process is significantly faster than judicial settlement. However, any
        heir who was excluded — even inadvertently — may file an action within two years from publication to
        claim their share. Knowing the correct legal shares before drafting the deed prevents costly litigation.
      </p>

      <h2>When the State Inherits: Article 1011</h2>
      <p>
        Article 1011 provides that if a person dies intestate without any surviving heirs — no descendants,
        ascendants, spouse, or collateral relatives within the fifth civil degree — the entire estate escheats
        to the government. The municipality or city where the decedent resided takes the property, which is
        then used for public benefit. In practice, escheat is rare because distant relatives can often be
        found, but it underscores how the law ensures that no estate simply disappears. Escheat proceedings
        are initiated by the Solicitor General or a public prosecutor before the Regional Trial Court.
      </p>
    </BlogLayout>
  );
}
