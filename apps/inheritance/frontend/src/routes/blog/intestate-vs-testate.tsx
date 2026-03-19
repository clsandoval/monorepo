import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getBlogPost } from '@/lib/blog-posts';

export const blogIntestateVsTestateRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog/intestate-vs-testate',
  component: BlogIntestateVsTestatePage,
});

function BlogIntestateVsTestatePage() {
  return (
    <BlogLayout meta={getBlogPost('intestate-vs-testate')!}>
      <h2>Defining the Two Modes of Succession</h2>
      <p>
        Philippine succession law recognizes two principal modes: testate and intestate. Testate succession
        (from the Latin <em>testamentum</em>, meaning will) occurs when the decedent leaves a valid last will
        and testament that disposes of at least part of the estate. Intestate succession — governed by Articles
        960 to 1014 of the Civil Code — applies when no will exists, when the will is declared void or
        ineffective in whole or in part, or when the will fails to cover the entire estate. Mixed succession
        arises when a partially effective will leaves a residue that falls under intestate rules.
      </p>

      <h2>Testate Succession: Freedom Bounded by Legitime</h2>
      <p>
        A testator's freedom to dispose of property by will is not absolute. The Civil Code reserves the
        legitime — a fraction of the estate — for compulsory heirs who cannot be deprived of it except for
        lawful disinheritance causes enumerated in Articles 915 to 920. The free portion, which is what
        remains after satisfying all legitimes, may be given to anyone the testator chooses, including
        strangers, institutions, or even a favored compulsory heir. A will that impairs the legitime does
        not become void — it is simply reducible to the extent of the impairment.
      </p>

      <h2>Intestate Succession: The Law Decides</h2>
      <p>
        When intestacy applies, the Civil Code's order of succession is mandatory and cannot be varied by
        agreement among heirs. The law prioritizes descendants over ascendants, close relatives over distant
        ones, and the surviving spouse concurs with both primary classes. The underlying policy is to replicate
        what a reasonable person would most likely have done had they made a will — placing family members
        closest in blood or legal bond first in line.
      </p>

      <h2>Key Differences in Practice</h2>
      <p>
        In testate succession, the probate court validates the will before distribution; this process can take
        months or years. In intestate succession, heirs may proceed directly to extrajudicial settlement if
        the estate is uncontested and the decedent left no debts — a faster and less expensive path. However,
        intestate distribution often surprises families: a surviving spouse may receive less than expected if
        many children survive, and illegitimate children have enforceable rights regardless of family
        preferences.
      </p>

      <h2>When Both Rules Apply: Mixed Succession</h2>
      <p>
        Mixed succession arises most commonly when a will covers some assets but not others (e.g., real
        property named but bank accounts omitted), or when a will is partially annulled. In these cases, the
        testate rules govern whatever the will validly addresses, and intestate rules fill the gap. The
        calculator handles pure intestate scenarios; for testate or mixed situations, the full case engine
        allows you to enter will dispositions and see how they interact with the compulsory share floor.
      </p>

      <h2>Practical Takeaway</h2>
      <p>
        If you are planning an estate, executing a valid will is the only way to control who receives what
        beyond the compulsory shares. If you are settling the estate of a deceased relative who left no will,
        intestate succession rules apply automatically — and knowing those rules is the first step toward a
        fair and legally sound distribution. Use our calculator to model the exact shares before entering any
        settlement negotiations.
      </p>
    </BlogLayout>
  );
}
