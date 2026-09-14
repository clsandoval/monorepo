// Anonymous owner id in a cookie. No login (BUILD-SPEC scope).
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export async function getOwner(): Promise<string> {
  const jar = await cookies();
  let owner = jar.get("rfp_owner")?.value;
  if (!owner) {
    owner = randomUUID();
    jar.set("rfp_owner", owner, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return owner;
}
