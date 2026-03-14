import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/docs", "/docs/quick-start", "/docs/tools", "/docs/billing", "/docs/faq"],
      disallow: ["/dashboard/", "/admin/", "/api/", "/login", "/signup", "/reset-password"],
    },
    sitemap: "https://daimon.ai/sitemap.xml",
  };
}
