// Pasa las capturas del manual (docs/manual/originales/*.png, que salen de
// tests/e2e/zz-manual-capturas.spec.ts) a WebP livianos en docs/manual/.
// Uso: npm run manual:imagenes  (sharp ya viene instalado con Next: no suma dependencias)
import { readdirSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const SOURCE = "docs/manual/originales";
const TARGET = "docs/manual";

for (const file of readdirSync(SOURCE)
  .filter((f) => f.endsWith(".png"))
  .sort()) {
  const out = join(TARGET, file.replace(/\.png$/, ".webp"));
  const info = await sharp(join(SOURCE, file))
    .resize({ width: 720 })
    .webp({ quality: 78 })
    .toFile(out);
  console.log(`✓ ${out} (${Math.round(info.size / 1024)} KB)`);
}
