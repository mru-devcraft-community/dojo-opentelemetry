import fs from "fs";
import path from "path";
import { logInfo, logWarn, formatPath } from "./logger";

export const SLIDEV_CACHE_DIR = "docusaurus-plugin-slidev";

/**
 * Get cache directory within .docusaurus for isolated builds
 */
export function getSlidevCacheDir(siteDir: string, pluginId: string): string {
  return path.join(siteDir, ".docusaurus", SLIDEV_CACHE_DIR, pluginId);
}

/**
 * Get the build output directory within the cache
 */
export function getSlidevBuildOutputDir(siteDir: string, pluginId: string): string {
  return path.join(getSlidevCacheDir(siteDir, pluginId), "output");
}

/**
 * Clean up Slidev-generated artifacts in source directory
 */
export function cleanupSourceDirectory(sourcePath: string): void {
  if (!fs.existsSync(sourcePath)) return;

  const artifacts = ["index.html", ".slidev", "dist"];
  for (const name of artifacts) {
    const fullPath = path.join(sourcePath, name);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

/**
 * Clean up the Slidev cache directory
 */
export function cleanupSlidevCache(cacheDir: string): void {
  if (!fs.existsSync(cacheDir)) return;
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    logInfo(`Cleaned Slidev cache: ${formatPath(cacheDir)}`);
  } catch {
    logWarn(`Failed to clean Slidev cache`);
  }
}

/**
 * Create an isolated build directory for a single presentation.
 * Copies the .md file and co-located assets to prevent race conditions
 * when building multiple presentations in parallel.
 */
export function createIsolatedBuildDir(
  sourceAbsolutePath: string,
  presentationId: string,
  cacheDir: string,
): string {
  const safeId = presentationId.replace(/[/\\]/g, "__");
  const isolatedDir = path.join(cacheDir, "builds", safeId);
  fs.mkdirSync(isolatedDir, { recursive: true });

  // Copy the source .md file
  const sourceFileName = path.basename(sourceAbsolutePath);
  const isolatedSourcePath = path.join(isolatedDir, sourceFileName);
  fs.copyFileSync(sourceAbsolutePath, isolatedSourcePath);

  // Copy co-located non-md assets (images, etc.)
  const sourceDir = path.dirname(sourceAbsolutePath);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    if (entry.name.endsWith(".md") || entry.name.startsWith("_category_")) continue;

    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(isolatedDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Create a dummy index.html to prevent Slidev CLI ENOENT when it tries to unlink it
  fs.writeFileSync(path.join(isolatedDir, "index.html"), "", "utf-8");

  return isolatedSourcePath;
}

/**
 * Clean isolated build directory after build
 */
export function cleanupIsolatedBuildDir(isolatedDir: string): void {
  if (!fs.existsSync(isolatedDir)) return;
  for (const artifact of ["index.html", ".slidev", "dist", "node_modules"]) {
    const p = path.join(isolatedDir, artifact);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  }
}

/**
 * Copy built presentations from cache to final output directory
 */
export function copyBuiltPresentationsToOutput(
  cacheOutputDir: string,
  finalOutputDir: string,
): void {
  if (!fs.existsSync(cacheOutputDir)) {
    logWarn(`Cache output directory not found: ${formatPath(cacheOutputDir)}`);
    return;
  }
  fs.mkdirSync(finalOutputDir, { recursive: true });
  copyDirRecursive(cacheOutputDir, finalOutputDir);
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
