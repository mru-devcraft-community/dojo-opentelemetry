import { spawn, exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import matter from "gray-matter";
import type {
  PresentationMetadata,
  PluginOptions,
  BuildResult,
  BuildContext,
} from "./types";
import {
  logInfo,
  logWarn,
  logError,
  logSuccess,
  formatCode,
  formatPath,
} from "./logger";
import {
  getSlidevCacheDir,
  createIsolatedBuildDir,
  cleanupIsolatedBuildDir,
} from "./fileSystem";

const execAsync = promisify(exec);

/** Official Slidev theme prefix */
const OFFICIAL_THEME_PREFIX = "@slidev/theme-";
/** Community theme prefix */
const COMMUNITY_THEME_PREFIX = "slidev-theme-";
/** Community addon prefix */
const COMMUNITY_ADDON_PREFIX = "slidev-addon-";

/**
 * Derive URL path from plugin path option.
 */
function getUrlPathFromPath(p: string): string {
  const normalized = p.replace(/^\.?\//, "").replace(/\/$/, "");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || "slidev";
}

/**
 * Resolve a Slidev theme shorthand name to its full npm package name.
 *
 * Naming conventions (from https://sli.dev/guide/theme-addon):
 * - Local path (starts with . or /): returned as-is
 * - Full package name (contains /): returned as-is (e.g. @slidev/theme-seriph, @org/slidev-theme-name)
 * - Official shorthand (e.g. "seriph"): resolved to @slidev/theme-seriph
 * - Community shorthand (e.g. "unicorn"): resolved to slidev-theme-unicorn
 *
 * The function checks node_modules to determine if the official or community
 * package exists. If neither is found, it defaults to the community convention.
 */
function resolveThemePackageName(theme: string, siteDir: string): string {
  // Local path — not an npm package
  if (theme.startsWith(".") || theme.startsWith("/") || theme.startsWith("\\")) {
    return theme;
  }
  // Already a full package name (scoped or contains prefix)
  if (theme.startsWith("@") || theme.startsWith(COMMUNITY_THEME_PREFIX) || theme.startsWith(OFFICIAL_THEME_PREFIX)) {
    return theme;
  }
  // Shorthand: try official first, then community
  const officialName = `${OFFICIAL_THEME_PREFIX}${theme}`;
  const communityName = `${COMMUNITY_THEME_PREFIX}${theme}`;
  // Check which one is installed
  if (isPackageInstalled(officialName, siteDir)) return officialName;
  if (isPackageInstalled(communityName, siteDir)) return communityName;
  // Default: try community convention (most common for non-official)
  return communityName;
}

/**
 * Resolve a Slidev addon shorthand name to its full npm package name.
 *
 * Naming conventions:
 * - Full package name (contains / or starts with @): returned as-is
 * - Shorthand (e.g. "excalidraw"): resolved to slidev-addon-excalidraw
 */
function resolveAddonPackageName(addon: string, siteDir: string): string {
  if (addon.startsWith(".") || addon.startsWith("/") || addon.startsWith("\\")) {
    return addon;
  }
  if (addon.startsWith("@") || addon.startsWith(COMMUNITY_ADDON_PREFIX)) {
    return addon;
  }
  return `${COMMUNITY_ADDON_PREFIX}${addon}`;
}

/**
 * Check if a package is installed in node_modules.
 */
function isPackageInstalled(packageName: string, siteDir: string): boolean {
  try {
    const modulePath = path.join(siteDir, "node_modules", ...packageName.split("/"));
    return fs.existsSync(modulePath);
  } catch {
    return false;
  }
}

/**
 * Check if a required package (theme or addon) is available.
 * Returns the resolved package name and install status.
 */
function checkPackageAvailable(
  packageName: string,
  siteDir: string,
): { installed: boolean; resolvedName: string; error?: string } {
  // Local paths are always "available"
  if (packageName.startsWith(".") || packageName.startsWith("/") || packageName.startsWith("\\")) {
    const fullPath = path.resolve(siteDir, packageName);
    if (fs.existsSync(fullPath)) {
      return { installed: true, resolvedName: packageName };
    }
    return { installed: false, resolvedName: packageName, error: `Local path not found: ${fullPath}` };
  }
  // Check node_modules
  if (isPackageInstalled(packageName, siteDir)) {
    return { installed: true, resolvedName: packageName };
  }
  // Check package.json dependencies
  try {
    const pkgPath = path.join(siteDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (packageName in allDeps) {
        return { installed: true, resolvedName: packageName };
      }
    }
  } catch { /* ignore */ }
  return { installed: false, resolvedName: packageName, error: `Package '${packageName}' not found. Install with: npm install ${packageName}` };
}

/**
 * Auto-install missing npm packages.
 */
async function installPackage(packageName: string, siteDir: string): Promise<boolean> {
  try {
    logInfo(`Auto-installing ${formatCode(packageName)}...`);
    await execAsync(`npm install ${packageName}`, { cwd: siteDir });
    logSuccess(`Installed ${formatCode(packageName)}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Failed to install ${formatCode(packageName)}: ${msg}`);
    return false;
  }
}

/**
 * Ensure a theme package is available (resolve shorthand + check/install).
 */
async function ensureThemeAvailable(
  theme: string,
  siteDir: string,
  autoInstall: boolean,
): Promise<string> {
  const resolvedName = resolveThemePackageName(theme, siteDir);
  const check = checkPackageAvailable(resolvedName, siteDir);
  if (check.installed) return resolvedName;

  if (autoInstall) {
    const installed = await installPackage(resolvedName, siteDir);
    if (installed) return resolvedName;
  }
  throw new Error(check.error || `Theme '${theme}' (${resolvedName}) not found. Install with: npm install ${resolvedName}`);
}

/**
 * Ensure addon packages are available (resolve shorthands + check/install).
 */
async function ensureAddonsAvailable(
  addons: string[],
  siteDir: string,
  autoInstall: boolean,
): Promise<string[]> {
  const resolved: string[] = [];
  for (const addon of addons) {
    const resolvedName = resolveAddonPackageName(addon, siteDir);
    const check = checkPackageAvailable(resolvedName, siteDir);
    if (check.installed) {
      resolved.push(resolvedName);
      continue;
    }
    if (autoInstall) {
      const installed = await installPackage(resolvedName, siteDir);
      if (installed) {
        resolved.push(resolvedName);
        continue;
      }
    }
    throw new Error(check.error || `Addon '${addon}' (${resolvedName}) not found. Install with: npm install ${resolvedName}`);
  }
  return resolved;
}

/**
 * Patch the addons list in a Slidev markdown file's frontmatter.
 * This merges the resolved addon names into the YAML headmatter
 * so that Slidev CLI picks them up during build.
 */
function patchFrontmatterAddons(filePath: string, addons: string[]): void {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  // Merge existing addons with resolved ones (deduplicate)
  const existingAddons: string[] = Array.isArray(parsed.data.addons) ? parsed.data.addons : [];
  const merged = [...new Set([...existingAddons, ...addons])];
  parsed.data.addons = merged;

  const updated = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, updated, "utf-8");
}

/**
 * Build a single Slidev presentation.
 */
export async function buildPresentation(
  presentation: PresentationMetadata,
  options: PluginOptions,
  context: BuildContext,
  cacheDir?: string,
): Promise<BuildResult> {
  const startTime = Date.now();
  let isolatedDir: string | undefined;

  try {
    // Validate source file
    if (!fs.existsSync(presentation.sourceAbsolutePath)) {
      throw new Error(`Source file not found: ${presentation.sourceAbsolutePath}`);
    }

    // Resolve theme (presentation frontmatter overrides plugin option)
    const themeRaw = presentation.theme || options.theme;
    let resolvedTheme: string | undefined;
    if (themeRaw) {
      resolvedTheme = await ensureThemeAvailable(themeRaw, context.siteDir, options.autoInstall);
    }

    // Resolve addons (merge plugin-level + presentation-level, deduplicate)
    const mergedAddons = [
      ...(options.addons || []),
      ...(presentation.addons || []),
    ];
    const uniqueAddons = [...new Set(mergedAddons)];
    let resolvedAddons: string[] = [];
    if (uniqueAddons.length > 0) {
      resolvedAddons = await ensureAddonsAvailable(uniqueAddons, context.siteDir, options.autoInstall);
    }

    // Build base URL for presentation
    const baseUrl = context.baseUrl.endsWith("/")
      ? context.baseUrl.slice(0, -1)
      : context.baseUrl;
    const urlPath = getUrlPathFromPath(options.path);
    const base = `${baseUrl}/${urlPath}/${presentation.id}/`;

    // Optional: isolated build directory to prevent race conditions
    let sourcePath = presentation.sourceAbsolutePath;
    if (cacheDir) {
      const isolatedSourcePath = createIsolatedBuildDir(
        presentation.sourceAbsolutePath,
        presentation.id,
        cacheDir,
      );
      isolatedDir = path.dirname(isolatedSourcePath);
      sourcePath = isolatedSourcePath;
    }

    // Build command args
    const args = ["build", sourcePath, "--out", presentation.outputPath, "--base", base];
    if (resolvedTheme) args.push("--theme", resolvedTheme);
    if (options.download) args.push("--download");

    // Addons are read from frontmatter by Slidev CLI, not from CLI flags.
    // If we have merged addons, patch the frontmatter in the (isolated) source file.
    if (resolvedAddons.length > 0) {
      patchFrontmatterAddons(sourcePath, resolvedAddons);
    }

    const timeoutMs = options.buildTimeout * 1000;

    if (options.verbose) {
      logInfo(`Command: slidev ${args.join(" ")}`);
    }

    const result = await new Promise<{ success: boolean; error?: string }>(
      (resolve) => {
        const env = {
          ...process.env,
          SLIDEV_ORIGINAL_SOURCE: presentation.sourceAbsolutePath,
          SLIDEV_ORIGINAL_SOURCE_DIR: path.dirname(presentation.sourceAbsolutePath),
          SLIDEV_SITE_DIR: context.siteDir,
        };

        const child = spawn("slidev", args, {
          cwd: context.siteDir,
          stdio: options.verbose ? "inherit" : "pipe",
          shell: true,
          env,
        });

        let stderr = "";
        let timedOut = false;

        if (!options.verbose && child.stderr) {
          child.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
          });
        }

        const timeout = setTimeout(() => {
          timedOut = true;
          child.kill("SIGTERM");
          setTimeout(() => {
            if (!child.killed) child.kill("SIGKILL");
          }, 5000);
        }, timeoutMs);

        child.on("error", (err: Error) => {
          clearTimeout(timeout);
          resolve({ success: false, error: `Failed to spawn slidev: ${err.message}` });
        });

        child.on("close", (code: number | null) => {
          clearTimeout(timeout);
          if (timedOut) {
            resolve({
              success: false,
              error: `Build timed out after ${options.buildTimeout}s`,
            });
          } else if (code !== 0) {
            resolve({
              success: false,
              error: `Slidev exited with code ${code}\n${stderr}`,
            });
          } else {
            resolve({ success: true });
          }
        });
      },
    );

    // Cleanup
    if (isolatedDir) cleanupIsolatedBuildDir(isolatedDir);

    const duration = (Date.now() - startTime) / 1000;
    if (!result.success) throw new Error(result.error);
    return { id: presentation.id, success: true, duration };
  } catch (err) {
    if (isolatedDir) cleanupIsolatedBuildDir(isolatedDir);
    const duration = (Date.now() - startTime) / 1000;
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Error building ${formatCode(presentation.id)}: ${msg}`);
    return { id: presentation.id, success: false, error: msg, duration };
  }
}

/**
 * Build all presentations with parallel execution.
 */
export async function buildAllPresentations(
  presentations: PresentationMetadata[],
  options: PluginOptions,
  context: BuildContext,
): Promise<BuildResult[]> {
  const totalStart = Date.now();
  const total = presentations.length;
  const cpuCount = os.cpus().length;
  const concurrency = Math.max(1, Math.min(options.maxParallelBuilds ?? 4, cpuCount));
  const cacheDir = getSlidevCacheDir(context.siteDir, options.id);

  logInfo(
    `Building ${total} presentation(s) with ${concurrency > 1 ? concurrency + " parallel workers" : "sequential execution"}...`,
  );

  const results: BuildResult[] = new Array(total);
  const queue = presentations.map((p, i) => ({ p, i }));
  let completed = 0;

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const result = await buildPresentation(item.p, options, context, cacheDir);
      results[item.i] = result;
      completed++;
      if (result.success) {
        logSuccess(`[${completed}/${total}] ${item.p.sourcePath} (${result.duration?.toFixed(2)}s)`);
      } else {
        logError(`[${completed}/${total}] ${item.p.sourcePath} - FAILED`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, total); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalTime = (Date.now() - totalStart) / 1000;

  if (failed > 0) {
    logWarn(`Build complete: ${successful} successful, ${failed} failed (total: ${totalTime.toFixed(2)}s)`);
    results
      .filter((r) => !r.success)
      .forEach((r) => logError(`Failed: ${formatCode(r.id)} - ${r.error}`));
  } else {
    logSuccess(`All ${total} presentations built successfully in ${totalTime.toFixed(2)}s!`);
  }

  return results;
}

/**
 * Check if Slidev CLI is available.
 */
export async function checkSlidevInstalled(): Promise<boolean> {
  try {
    await execAsync("slidev --version");
    return true;
  } catch {
    logError("Slidev CLI not found. Install: npm install @slidev/cli");
    return false;
  }
}
