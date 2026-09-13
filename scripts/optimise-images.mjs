import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const mediaDirectory = path.resolve('public/media');
const outputDirectory = path.join(mediaDirectory, 'optimised');

const images = [
  { name: 'hero', source: '82040841-20b3-474c-909b-48284a1ef3c6.png', widths: [800, 1200, 1672] },
  { name: 'boarding', source: '11e94619-23ed-4490-81f1-08b71b74e096.png', widths: [800, 1200, 1672] },
  { name: 'craft', source: 'ca7f04a5-5781-411f-929b-cd8d85449b8d.png', widths: [720, 1100, 1448] },
  { name: 'river', source: 'fd5b978b-03a5-4276-8dc3-ba1de340a940.png', widths: [720, 1100, 1448] },
];

await mkdir(outputDirectory, { recursive: true });

for (const image of images) {
  for (const width of image.widths) {
    const source = path.join(mediaDirectory, image.source);
    const pipeline = sharp(source).resize({ width, withoutEnlargement: true });
    await pipeline.clone().avif({ quality: 68 }).toFile(path.join(outputDirectory, `${image.name}-${width}.avif`));
    await pipeline.clone().webp({ quality: 78 }).toFile(path.join(outputDirectory, `${image.name}-${width}.webp`));
  }
}

await sharp(path.join(mediaDirectory, '610c715d-eac0-4df8-9041-d52b285ed01b.png'))
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(path.join(outputDirectory, 'canoe-cutout.webp'));

console.log('Optimised River Wey media written to public/media/optimised.');
