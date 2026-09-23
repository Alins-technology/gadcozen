// Generates small WebP versions of every PNG/JPG in public/images/products:
//   foo.png -> foo-200.webp, foo-600.webp, foo-1200.webp
// The original files are kept (the database still references them); the
// frontend swaps in the WebP versions via utils/image.js.
//
// Usage (after adding new product photos):
//   npm install --no-save sharp && node scripts/optimize-images.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "images", "products");
const WIDTHS = [200, 600, 1200];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

let before = 0;
let after = 0;
for (const file of walk(ROOT).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
  before += fs.statSync(file).size;
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  for (const width of WIDTHS) {
    const out = `${base}-${width}.webp`;
    await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    if (width === 600) after += fs.statSync(out).size;
  }
  console.log("optimized", path.relative(ROOT, file));
}
console.log(
  `\nOriginals: ${(before / 1024 / 1024).toFixed(1)} MB -> 600px WebP set: ${(after / 1024 / 1024).toFixed(1)} MB`
);
