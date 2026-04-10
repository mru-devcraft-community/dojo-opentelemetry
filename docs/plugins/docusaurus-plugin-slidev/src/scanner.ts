import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  PluginOptions,
  PresentationMetadata,
  CategoryMetadata,
  ScanResult,
  BuildContext,
} from "./types";
import { logInfo, logWarn, formatPath } from "./logger";
import { getSlidevBuildOutputDir } from "./fileSystem";

/**
 * Derive URL path from the path option.
 * './slidev' -> 'slidev', './presentations' -> 'presentations'
 */
function getUrlPathFromPath(pathOption: string): string {
  const normalized = pathOption.replace(/^\.?\//, "").replace(/\/$/, "");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || "slidev";
}

/**
 * Format a directory name into a readable label.
 */
function formatDirectoryName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Read _category_.yml / .yaml / .json from a directory.
 */
function readCategoryFile(
  dirPath: string,
): { label?: string; description?: string; position?: number } {
  for (const name of ["_category_.yml", "_category_.yaml", "_category_.json"]) {
    const filePath = path.join(dirPath, name);
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      if (name.endsWith(".json")) return JSON.parse(content);
      return (yaml.load(content) as Record<string, unknown>) ?? {};
    } catch {
      logWarn(`Failed to read category file in ${formatPath(dirPath)}`);
    }
  }
  return {};
}

/**
 * Check if a directory contains any markdown files (recursively).
 */
function hasMarkdownFiles(dir: string): boolean {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_"))
      return true;
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules" &&
      hasMarkdownFiles(path.join(dir, entry.name))
    )
      return true;
  }
  return false;
}

interface ScannedFile {
  relativePath: string;
  category: string;
}

/**
 * Recursively scan a directory for .md files.
 */
function scanDirectory(
  dir: string,
  baseDir: string,
  currentCategory = "",
): ScannedFile[] {
  const files: ScannedFile[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    if (entry.name === "node_modules" || entry.name === "sections") continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const newCategory = currentCategory
        ? `${currentCategory}/${entry.name}`
        : entry.name;
      files.push(...scanDirectory(fullPath, baseDir, newCategory));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ relativePath, category: currentCategory });
    }
  }
  return files;
}

/**
 * Scan for category directories and extract metadata.
 */
function scanCategories(
  sourceDir: string,
  baseUrl: string,
  routeBasePath: string,
): Map<string, CategoryMetadata> {
  const categories = new Map<string, CategoryMetadata>();

  function scan(dir: string, categoryPath = ""): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;

      const fullPath = path.join(dir, entry.name);
      const newPath = categoryPath
        ? `${categoryPath}/${entry.name}`
        : entry.name;

      if (hasMarkdownFiles(fullPath)) {
        const data = readCategoryFile(fullPath);
        const normalizedBase = baseUrl.endsWith("/")
          ? baseUrl.slice(0, -1)
          : baseUrl;
        const normalizedRoute = routeBasePath.startsWith("/")
          ? routeBasePath
          : `/${routeBasePath}`;
        categories.set(newPath, {
          path: newPath,
          label: data.label || formatDirectoryName(entry.name),
          description: data.description,
          position: data.position ?? 99,
          count: 0,
          url: `${normalizedBase}${normalizedRoute}/${newPath}`,
        });
      }
      scan(fullPath, newPath);
    }
  }

  scan(sourceDir);
  return categories;
}

/**
 * Extract frontmatter metadata from a Slidev markdown file.
 */
function extractMetadata(filePath: string): Record<string, unknown> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(content);
    return data;
  } catch {
    logWarn(`Failed to extract frontmatter from ${formatPath(filePath)}`);
    return {};
  }
}

/**
 * Scan for Slidev presentations and extract metadata.
 */
export async function scanPresentations(
  options: PluginOptions,
  context: BuildContext,
): Promise<ScanResult> {
  const sourceDir = path.resolve(context.siteDir, options.path);
  const urlPath = getUrlPathFromPath(options.path);

  const categoriesMap = scanCategories(
    sourceDir,
    context.baseUrl,
    options.routeBasePath,
  );

  const scannedFiles = scanDirectory(sourceDir, sourceDir);
  if (scannedFiles.length === 0) {
    logWarn(`No Slidev presentations found in ${formatPath(sourceDir)}`);
    return { presentations: [], categories: [] };
  }

  logInfo(`Found ${scannedFiles.length} Slidev file(s) in: ${formatPath(sourceDir)}`);

  // Count presentations per category
  const categoryCounts = new Map<string, number>();
  for (const file of scannedFiles) {
    if (file.category) {
      categoryCounts.set(file.category, (categoryCounts.get(file.category) || 0) + 1);
    }
  }
  for (const [catPath, count] of categoryCounts) {
    const cat = categoriesMap.get(catPath);
    if (cat) cat.count = count;
  }

  const baseUrl = context.baseUrl.endsWith("/")
    ? context.baseUrl.slice(0, -1)
    : context.baseUrl;

  const presentations: PresentationMetadata[] = scannedFiles.map(
    ({ relativePath, category }) => {
      const sourceAbsolutePath = path.join(sourceDir, relativePath);
      const id = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");
      const fm = extractMetadata(sourceAbsolutePath);
      const title =
        (fm.title as string) || path.basename(relativePath, ".md");
      const url = `${baseUrl}/${urlPath}/${id}/`;
      const outputPath = path.join(
        getSlidevBuildOutputDir(context.siteDir, options.id),
        id,
      );

      return {
        id,
        title,
        description: fm.description as string | undefined,
        theme: fm.theme as string | undefined,
        addons: Array.isArray(fm.addons) ? (fm.addons as string[]) : undefined,
        author: fm.author as string | undefined,
        position: fm.position as number | undefined,
        sourcePath: relativePath,
        sourceAbsolutePath,
        url,
        outputPath,
        previewUrl: `${url}?clicks=0`,
        category,
      };
    },
  );

  const categories = Array.from(categoriesMap.values())
    .filter((cat) => cat.count > 0)
    .sort((a, b) => a.position - b.position);

  return { presentations, categories };
}
