// Seed all products from the Kaspi Excel database using parameterized queries.
// Reads /home/ubuntu/excel_rows.json (produced by /home/ubuntu/seed_excel_products.py logic)
import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

const rows = JSON.parse(fs.readFileSync('/home/ubuntu/excel_rows.json', 'utf-8'));
const conn = await mysql.createConnection(process.env.DATABASE_URL);

const CHUNK = 40;
let inserted = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK);
  const placeholders = chunk.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)').join(',');
  const params = chunk.flatMap((r) => [
    r.sku, r.category, r.nameKk, r.nameRu, r.descriptionKk, r.descriptionRu,
    r.style, r.material, JSON.stringify(r.colors), r.photoUrl, r.widthMm, r.heightMm, r.depthMm,
    r.price, JSON.stringify(r.features), r.kaspiUrl, r.kaspiReviews,
  ]);
  await conn.query(
    `INSERT IGNORE INTO products (sku, category, nameKk, nameRu, descriptionKk, descriptionRu, style, material, colors, photoUrl, widthMm, heightMm, depthMm, basePriceKzt, features, isPublished, kaspiUrl, kaspiReviews) VALUES ${placeholders}`,
    params,
  );
  inserted += chunk.length;
  console.log(`inserted ${inserted}/${rows.length}`);
}

const [cnt] = await conn.query('SELECT COUNT(*) AS c FROM products');
console.log('total products now:', cnt[0].c);
await conn.end();
