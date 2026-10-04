import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Path โฟลเดอร์ต้นทางและปลายทาง
const inputDir = 'D:/3.P/apps/web/public/images/b-p/show';
const outputDir = 'D:/3.P/apps/web/public/images/b-p/show_optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const baseName = path.parse(file).name;
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${baseName}.webp`);

    console.log(`Processing: ${file} -> ${baseName}.webp`);

    await sharp(inputPath)
      .resize({
        width: 1600,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
  }
}

console.log('✅ แปลงและบีบอัดรูปทั้งหมดเรียบร้อยแล้ว!');