export interface PluginOptions {
  path: string;
  download: boolean;
  routeBasePath: string;
  pageTitle: string;
  pageTagline: string;
  id: string;
  theme?: string;
  addons?: string[];
  buildTimeout: number;
  verbose: boolean;
  maxParallelBuilds: number;
  autoInstall: boolean;
}

export interface SlidevFrontmatter {
  title?: string;
  description?: string;
  theme?: string;
  addons?: string[];
  author?: string;
  position?: number;
}

export interface PresentationMetadata {
  id: string;
  title: string;
  description?: string;
  theme?: string;
  addons?: string[];
  author?: string;
  position?: number;
  sourcePath: string;
  sourceAbsolutePath: string;
  url: string;
  outputPath: string;
  previewUrl: string;
  category: string;
}

export interface CategoryMetadata {
  path: string;
  label: string;
  description?: string;
  position: number;
  count: number;
  url: string;
}

export interface ScanResult {
  presentations: PresentationMetadata[];
  categories: CategoryMetadata[];
}

export interface PluginContentData {
  presentations: PresentationMetadata[];
  categories: CategoryMetadata[];
  config: PluginOptions;
  isDev: boolean;
}

export interface BuildResult {
  id: string;
  success: boolean;
  error?: string;
  duration?: number;
}

export interface BuildContext {
  siteDir: string;
  baseUrl: string;
}
