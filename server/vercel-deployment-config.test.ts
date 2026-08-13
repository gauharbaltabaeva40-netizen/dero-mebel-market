import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

describe("Vercel deployment configuration", () => {
  it("redirects every Vercel request to the supported live storefront", async () => {
    const configPath = path.join(projectRoot, "vercel.json");
    const config = JSON.parse(await readFile(configPath, "utf8")) as {
      redirects?: Array<{
        source?: string;
        destination?: string;
        permanent?: boolean;
      }>;
    };

    expect(config.redirects).toEqual([
      {
        source: "/(.*)",
        destination: "https://deromebel-mvjbwqqp.manus.space/$1",
        permanent: false,
      },
    ]);
  });
});
