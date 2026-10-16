import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = await readFile(new URL("../src/app/icon.svg", import.meta.url));
const appDirectory = new URL("../src/app/", import.meta.url);
const publicDirectory = new URL("../public/icons/", import.meta.url);
await mkdir(publicDirectory, { recursive: true });

for (const [size, target] of [
  [32, new URL("icon1.png", appDirectory)],
  [180, new URL("apple-icon.png", appDirectory)],
  [192, new URL("star-192.png", publicDirectory)],
  [512, new URL("star-512.png", publicDirectory)],
]) {
  await writeFile(
    target,
    await sharp(source).resize(size, size).png().toBuffer(),
  );
}

const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (const [index, frame] of frames.entries()) {
  const position = 6 + index * 16;
  header.writeUInt8(sizes[index], position);
  header.writeUInt8(sizes[index], position + 1);
  header.writeUInt16LE(1, position + 4);
  header.writeUInt16LE(32, position + 6);
  header.writeUInt32LE(frame.length, position + 8);
  header.writeUInt32LE(offset, position + 12);
  offset += frame.length;
}
await writeFile(
  new URL("favicon.ico", appDirectory),
  Buffer.concat([header, ...frames]),
);
console.log("Generated SVG-based browser, Apple, and home-screen star icons.");
