import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public pages are cached for a few minutes. After an admin change, drop that
 * cache so visitors see it straight away. Whole-site is fine at this size.
 */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
}
