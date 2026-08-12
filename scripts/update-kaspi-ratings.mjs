import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

const workbook = JSON.parse(fs.readFileSync('/home/ubuntu/excel_dump.json', 'utf-8'));
const [, ...dataRows] = workbook['Все товары'];
const entries = dataRows
  .map((row) => ({
    sku: String(row[1] ?? '').trim(),
    rating: Number(row[11]) > 0 ? Number(row[11]) : null,
    reviews: Number.isFinite(Number(row[12])) ? Number(row[12]) : null,
  }))
  .filter((entry) => entry.sku);

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const CHUNK_SIZE = 50;

for (let start = 0; start < entries.length; start += CHUNK_SIZE) {
  const chunk = entries.slice(start, start + CHUNK_SIZE);
  const ratingCases = chunk.map(() => 'WHEN ? THEN ?').join(' ');
  const reviewCases = chunk.map(() => 'WHEN ? THEN ?').join(' ');
  const ids = chunk.map(() => '?').join(', ');
  const params = [
    ...chunk.flatMap((entry) => [entry.sku, entry.rating]),
    ...chunk.flatMap((entry) => [entry.sku, entry.reviews]),
    ...chunk.map((entry) => entry.sku),
  ];
  await conn.execute(
    `UPDATE products
      SET kaspiRating = CASE sku ${ratingCases} ELSE kaspiRating END,
          kaspiReviews = CASE sku ${reviewCases} ELSE kaspiReviews END
      WHERE sku IN (${ids})`,
    params,
  );
  console.log(`updated ${Math.min(start + CHUNK_SIZE, entries.length)}/${entries.length}`);
}

const [summary] = await conn.query(
  'SELECT COUNT(*) AS allProducts, SUM(kaspiRating IS NOT NULL) AS ratedProducts FROM products',
);
console.log(summary[0]);
await conn.end();
