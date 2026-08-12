import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

const rows = JSON.parse(fs.readFileSync('/home/ubuntu/excel_rows.json', 'utf-8'));
const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const r = rows[0];
  const params = [
    r.sku, r.category, r.nameKk, r.nameRu, r.descriptionKk, r.descriptionRu,
    r.style, r.material, JSON.stringify(r.colors), r.photoUrl, r.widthMm, r.heightMm, r.depthMm,
    r.price, JSON.stringify(r.features), r.kaspiUrl, r.kaspiReviews,
  ];
  const [res] = await conn.query(
    'INSERT IGNORE INTO products (sku, category, nameKk, nameRu, descriptionKk, descriptionRu, style, material, colors, photoUrl, widthMm, heightMm, depthMm, basePriceKzt, features, isPublished, kaspiUrl, kaspiReviews) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)',
    params,
  );
  console.log('single row ok:', res);

  // now batch of 40 with stringified json
  const chunk = rows.slice(0, 40);
  const placeholders = chunk.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)').join(',');
  const paramsBatch = chunk.flatMap((x) => [
    x.sku, x.category, x.nameKk, x.nameRu, x.descriptionKk, x.descriptionRu,
    x.style, x.material, JSON.stringify(x.colors), x.photoUrl, x.widthMm, x.heightMm, x.depthMm,
    x.price, JSON.stringify(x.features), x.kaspiUrl, x.kaspiReviews,
  ]);
  const [res2] = await conn.query(
    `INSERT IGNORE INTO products (sku, category, nameKk, nameRu, descriptionKk, descriptionRu, style, material, colors, photoUrl, widthMm, heightMm, depthMm, basePriceKzt, features, isPublished, kaspiUrl, kaspiReviews) VALUES ${placeholders}`,
    paramsBatch,
  );
  console.log('batch ok, inserted:', res2.affectedRows);
} catch (e) {
  console.error('ERR:', e.sqlMessage?.slice(0, 400));
}
await conn.end();
