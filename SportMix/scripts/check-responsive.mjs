import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const componentDir = path.join(rootDir, "src", "components");
const mobileWidthBudget = 390;

async function collectFiles(dir, extensions = new Set([".jsx", ".js", ".css"])) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, extensions)));
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function formatRelative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function findLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function inspectMobileMinWidth(filePath, source) {
  const findings = [];
  const minWidthPattern =
    /minWidth\s*:\s*\{\s*xs\s*:\s*(?:"(\d+)(?:px)?"|'(\d+)(?:px)?'|(\d+))/g;

  for (const match of source.matchAll(minWidthPattern)) {
    const rawValue = match[1] || match[2] || match[3];
    const value = Number(rawValue);

    if (value > mobileWidthBudget) {
      findings.push({
        file: formatRelative(filePath),
        line: findLineNumber(source, match.index),
        value,
      });
    }
  }

  return findings;
}

async function main() {
  const indexHtml = await readFile(path.join(rootDir, "index.html"), "utf8");
  const files = await collectFiles(componentDir);
  const oversizedMinWidths = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    oversizedMinWidths.push(...inspectMobileMinWidth(file, source));
  }

  const failures = [];

  if (!/name=["']viewport["'][^>]*width=device-width/i.test(indexHtml)) {
    failures.push("index.html: missing width=device-width viewport meta.");
  }

  if (!/name=["']viewport["'][^>]*viewport-fit=cover/i.test(indexHtml)) {
    failures.push("index.html: viewport meta should include viewport-fit=cover for mobile safe areas.");
  }

  for (const finding of oversizedMinWidths) {
    failures.push(
      `${finding.file}:${finding.line} has minWidth.xs=${finding.value}px, above ${mobileWidthBudget}px.`,
    );
  }

  if (failures.length > 0) {
    console.error("Responsive check failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Responsive check passed: no mobile minWidth above ${mobileWidthBudget}px.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
