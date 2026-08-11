import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { products, faqs, companySettings, pricingRules, leads } from "../../drizzle/schema";
import { getDb } from "../db";

const dbOrFail = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  return db;
};

/** List published products. */
export const productsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await dbOrFail();
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isPublished, true))
      .orderBy(products.category, products.id);
    return rows;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await dbOrFail();
      const rows = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return rows[0];
    }),
});

/** FAQ knowledge base. */
export const faqsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await dbOrFail();
    return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.category);
  }),
});

/** Verified company facts — the AI's only company-knowledge source. */
export const settingsRouter = router({
  all: publicProcedure.query(async () => {
    const db = await dbOrFail();
    const rows = await db.select().from(companySettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }),
});

/** Pricing rules — consumed by the backend calculator only. */
export const pricingRouter = router({
  all: publicProcedure.query(async () => {
    const db = await dbOrFail();
    return db.select().from(pricingRules);
  }),
});
