import path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { Joi } from "@docusaurus/utils-validation";
import type { PluginOptions, PluginContentData } from "./types";
import { scanPresentations } from "./scanner";
import { buildAllPresentations, checkSlidevInstalled } from "./builder";
import { logInfo, logWarn } from "./logger";
import {
  cleanupSourceDirectory,
  cleanupSlidevCache,
  getSlidevCacheDir,
  getSlidevBuildOutputDir,
  copyBuiltPresentationsToOutput,
} from "./fileSystem";

const DEFAULT_OPTIONS: PluginOptions = {
  path: "./slidev",
  download: false,
  routeBasePath: "/slidev",
  pageTitle: "Slidev Presentations",
  pageTagline: "Interactive presentation overview",
  id: "default",
  theme: "unicorn",
  addons: [],
  buildTimeout: 120,
  verbose: false,
  maxParallelBuilds: 4,
  autoInstall: true,
};

/**
 * Derive URL path from the path option.
 */
function getUrlPathFromPath(pathOption: string): string {
  const normalized = pathOption.replace(/^\.?\//, "").replace(/\/$/, "");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || "slidev";
}

/**
 * Handle deprecated option names.
 */
const DEPRECATED: Record<string, string> = {
  sourceDir: "path",
  overviewPath: "routeBasePath",
  overviewTitle: "pageTitle",
  overviewTagline: "pageTagline",
};

function processDeprecated(opts: Record<string, unknown>): Record<string, unknown> {
  const processed = { ...opts };
  for (const [oldName, newName] of Object.entries(DEPRECATED)) {
    if (oldName in processed && !(newName in processed)) {
      logWarn(`Deprecated option "${oldName}": use "${newName}" instead`);
      processed[newName] = processed[oldName];
      delete processed[oldName];
    }
  }
  return processed;
}

export default function pluginSlidev(
  context: LoadContext,
  opts: Partial<PluginOptions>,
): Plugin<PluginContentData> {
  const processedOpts = processDeprecated(opts as Record<string, unknown>);
  const options: PluginOptions = { ...DEFAULT_OPTIONS, ...processedOpts } as PluginOptions;

  let contentData: PluginContentData;
  const isDev = process.env.NODE_ENV === "development";

  return {
    name: "docusaurus-plugin-slidev",

    getThemePath() {
      return path.resolve(__dirname, "../theme");
    },

    async loadContent(): Promise<PluginContentData> {
      const scanResult = await scanPresentations(options, {
        siteDir: context.siteDir,
        baseUrl: context.baseUrl,
      });

      const { presentations, categories } = scanResult;

      if (isDev && presentations.length > 0) {
        logInfo("Presentations will be available after running 'npm run build'");
      } else if (!isDev && presentations.length > 0) {
        const slidevInstalled = await checkSlidevInstalled();
        if (!slidevInstalled) {
          throw new Error("Slidev CLI not installed. Run: npm install @slidev/cli");
        }

        const sourcePath = path.join(context.siteDir, options.path);
        cleanupSourceDirectory(sourcePath);

        const cacheDir = getSlidevCacheDir(context.siteDir, options.id);
        cleanupSlidevCache(cacheDir);

        await buildAllPresentations(presentations, options, {
          siteDir: context.siteDir,
          baseUrl: context.baseUrl,
        });
      }

      contentData = { presentations, categories, config: options, isDev };
      return contentData;
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData, addRoute } = actions;
      const { presentations, categories, config } = content;

      setGlobalData(content);

      // Overview page
      addRoute({
        path: config.routeBasePath,
        component: "@theme/SlidevOverview",
        exact: true,
      });

      // Category sub-pages
      for (const category of categories) {
        addRoute({
          path: category.url,
          component: "@theme/SlidevOverview",
          exact: true,
        });
      }

      // Individual presentation pages
      for (const presentation of presentations) {
        const routePath = presentation.url.endsWith("/")
          ? presentation.url.slice(0, -1)
          : presentation.url;
        addRoute({
          path: routePath,
          component: "@theme/SlidevPresentation",
          exact: true,
        });
      }
    },

    async postBuild({ outDir }) {
      if (isDev || !contentData?.presentations?.length) return;

      const cacheOutputDir = getSlidevBuildOutputDir(context.siteDir, options.id);
      const urlPath = getUrlPathFromPath(options.path);
      const finalOutputDir = path.join(outDir, urlPath);
      copyBuiltPresentationsToOutput(cacheOutputDir, finalOutputDir);
      logInfo(`Copied ${contentData.presentations.length} presentation(s) to final output`);
    },
  };
}

export function validateOptions({
  options,
}: {
  options: Record<string, unknown>;
  validate: (schema: unknown, options: unknown) => unknown;
}): PluginOptions {
  const processed = processDeprecated(options);

  const schema = Joi.object({
    path: Joi.string().default(DEFAULT_OPTIONS.path),
    sourceDir: Joi.string().optional(),
    theme: Joi.string().default(DEFAULT_OPTIONS.theme),
    addons: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.addons),
    download: Joi.boolean().default(DEFAULT_OPTIONS.download),
    routeBasePath: Joi.string().default(DEFAULT_OPTIONS.routeBasePath),
    overviewPath: Joi.string().optional(),
    pageTitle: Joi.string().default(DEFAULT_OPTIONS.pageTitle),
    overviewTitle: Joi.string().optional(),
    pageTagline: Joi.string().default(DEFAULT_OPTIONS.pageTagline),
    overviewTagline: Joi.string().optional(),
    id: Joi.string().default(DEFAULT_OPTIONS.id),
    buildTimeout: Joi.number().min(10).max(600).default(DEFAULT_OPTIONS.buildTimeout),
    verbose: Joi.boolean().default(DEFAULT_OPTIONS.verbose),
    maxParallelBuilds: Joi.number().min(1).default(DEFAULT_OPTIONS.maxParallelBuilds),
    autoInstall: Joi.boolean().default(DEFAULT_OPTIONS.autoInstall),
  });

  const { value, error } = schema.validate(processed);
  if (error) throw error;
  return value as PluginOptions;
}
