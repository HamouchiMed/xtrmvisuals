#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const clientDir = path.join(dist, "client");
const index = path.join(clientDir, "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

// Copy dist/client contents to dist/ root so standard hosts like Vercel find index.html
cpSync(clientDir, dist, { recursive: true });

console.log("Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json");

