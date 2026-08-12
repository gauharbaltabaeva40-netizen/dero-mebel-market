import mysql from 'mysql2/promise';
import 'dotenv/config';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.query('SELECT sku, kaspiUrl FROM products');
const codes = rows.map(r => r.kaspiUrl ? (r.kaspiUrl.split('?')[0].match(/-(\d+)\/?$/)||[])[1] : null).filter(Boolean);
import fs from 'fs';
fs.writeFileSync('/home/ubuntu/existing_kaspi_codes.txt', codes.join('\n') + '\n');
console.log('codes:', codes.length, codes);
await conn.end();
