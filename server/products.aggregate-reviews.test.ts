import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { products } from "../drizzle/schema";

describe("products Kaspi review model", () => {
  it("keeps verified aggregate fields without storing individual review content", () => {
    const columns = getTableColumns(products);

    expect(columns).toHaveProperty("kaspiUrl");
    expect(columns).toHaveProperty("kaspiReviews");
    expect(columns).toHaveProperty("kaspiRating");
    expect(columns).not.toHaveProperty("kaspiReviewSamples");
  });
});
