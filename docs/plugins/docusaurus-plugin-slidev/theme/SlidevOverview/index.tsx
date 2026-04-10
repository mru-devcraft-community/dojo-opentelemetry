import React, { useState, useMemo, useEffect } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import { useLocation } from "@docusaurus/router";
import SlidevCard from "../SlidevCard";
import SlidevCategoryCard from "../SlidevCategoryCard";
import SlidevListItem from "../SlidevListItem";
import {
  FolderIcon,
  BackIcon,
  SortAscIcon,
  SortDescIcon,
  GridViewIcon,
  DetailsViewIcon,
  WarningIcon,
  EmptyPresentationIcon,
} from "../icons";
import styles from "./styles.module.css";

const STORAGE_KEYS = {
  viewMode: "slidev-plugin-view-mode",
  sortOrder: "slidev-plugin-sort-order",
};

interface Presentation {
  id: string;
  title: string;
  description?: string;
  author?: string;
  position?: number;
  sourcePath: string;
  url: string;
  previewUrl?: string;
  category: string;
}

interface Category {
  path: string;
  label: string;
  description?: string;
  position: number;
  count: number;
  url: string;
}

interface Config {
  routeBasePath: string;
  sourceDir?: string;
  path?: string;
  pageTitle?: string;
  pageTagline?: string;
}

interface PluginData {
  presentations: Presentation[];
  categories: Category[];
  config: Config;
  isDev: boolean;
}

export default function SlidevOverview() {
  const { presentations, categories, config, isDev } = usePluginData(
    "docusaurus-plugin-slidev",
  ) as PluginData;
  const location = useLocation();

  const currentCategory = useMemo(() => {
    const basePath = config.routeBasePath.replace(/\/$/, "");
    const currentPath = location.pathname.replace(/\/$/, "");
    if (currentPath === basePath) return "";
    return currentPath.replace(basePath + "/", "");
  }, [location.pathname, config.routeBasePath]);

  const isInCategory = currentCategory !== "";

  const parentCategoryPath = useMemo(() => {
    if (!currentCategory) return null;
    const parts = currentCategory.split("/");
    return parts.length === 1 ? "" : parts.slice(0, -1).join("/");
  }, [currentCategory]);

  const currentCategoryMeta = useMemo(() => {
    if (!currentCategory) return null;
    return categories.find((cat) => cat.path === currentCategory);
  }, [currentCategory, categories]);

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(STORAGE_KEYS.viewMode) || "grid";
    }
    return "grid";
  });

  const [sortOrder, setSortOrder] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(STORAGE_KEYS.sortOrder) || "asc";
    }
    return "asc";
  });

  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEYS.sortOrder, sortOrder);
  }, [sortOrder]);

  const naturalCompare = (a: string, b: string) => {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return collator.compare(a, b);
  };

  const filteredPresentations = useMemo(
    () => presentations.filter((p) => (p.category || "") === currentCategory),
    [presentations, currentCategory],
  );

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const catParts = cat.path.split("/");
      const currentParts = currentCategory ? currentCategory.split("/") : [];
      if (catParts.length !== currentParts.length + 1) return false;
      if (currentCategory) return cat.path.startsWith(currentCategory + "/");
      return catParts.length === 1;
    });
  }, [categories, currentCategory]);

  const sortedPresentations = useMemo(() => {
    const sorted = [...filteredPresentations];
    return sorted.sort((a, b) => {
      const aPos = a.position ?? Infinity;
      const bPos = b.position ?? Infinity;
      if (aPos !== bPos) {
        const cmp = aPos - bPos;
        return sortOrder === "asc" ? cmp : -cmp;
      }
      const pathCmp = naturalCompare(a.sourcePath, b.sourcePath);
      if (pathCmp !== 0) return sortOrder === "asc" ? pathCmp : -pathCmp;
      const titleCmp = naturalCompare(a.title, b.title);
      return sortOrder === "asc" ? titleCmp : -titleCmp;
    });
  }, [filteredPresentations, sortOrder]);

  const sortedCategories = useMemo(() => {
    const sorted = [...filteredCategories];
    return sorted.sort((a, b) => {
      const posCmp = a.position - b.position;
      if (posCmp !== 0) return sortOrder === "asc" ? posCmp : -posCmp;
      const labelCmp = naturalCompare(a.label, b.label);
      return sortOrder === "asc" ? labelCmp : -labelCmp;
    });
  }, [filteredCategories, sortOrder]);

  const toggleSort = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  const toggleView = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  const title = currentCategoryMeta?.label || config.pageTitle || "Slidev Presentations";
  const tagline = currentCategoryMeta?.description || config.pageTagline || "Interactive presentation overview";

  const backUrl = useMemo(() => {
    if (parentCategoryPath === null) return null;
    const basePath = config.routeBasePath.replace(/\/$/, "");
    return parentCategoryPath ? `${basePath}/${parentCategoryPath}` : basePath;
  }, [parentCategoryPath, config.routeBasePath]);

  const hasContent = filteredPresentations.length > 0 || filteredCategories.length > 0;
  const sourceDir = config.path || config.sourceDir || "./slidev";

  return (
    <Layout title={title} description={tagline}>
      <div className={styles.container}>
        <div className={styles.bannerWrapper}>
          {isInCategory && backUrl !== null && (
            <Link to={backUrl} className={styles.backButton} aria-label="Go back">
              <BackIcon width={24} height={24} />
            </Link>
          )}
          <div className={styles.banner}>
            <h1 className={styles.title}>
              {isInCategory && <FolderIcon className={styles.titleIcon} width={50} height={50} />}
              <span>{title}</span>
            </h1>
            <p className={styles.subtitle}>{tagline}</p>
          </div>
          {(hasContent || isInCategory) && (
            <div className={styles.controls}>
              <button
                className={styles.controlButton}
                onClick={toggleSort}
                title={sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
              >
                {sortOrder === "asc" ? <SortAscIcon width={20} height={20} /> : <SortDescIcon width={20} height={20} />}
              </button>
              <button
                className={styles.controlButton}
                onClick={toggleView}
                title={viewMode === "grid" ? "Switch to List" : "Switch to Grid"}
              >
                {viewMode === "grid" ? <DetailsViewIcon width={20} height={20} /> : <GridViewIcon width={20} height={20} />}
              </button>
            </div>
          )}
        </div>

        {isDev && (
          <div className={styles.devModeWarning}>
            <div className={styles.warningTitle}>
              <WarningIcon className={styles.warningIcon} />
              Development Mode
            </div>
            <p className={styles.warningText}>
              Slidev presentations are only available after building the site.
              <br />
              Run <code>npm run build</code> to generate presentations, then <code>npm run serve</code> to view them.
            </p>
          </div>
        )}

        <div className={styles.contentContainer}>
          {!hasContent && !isInCategory && (
            <div className={styles.emptyState}>
              <EmptyPresentationIcon className={styles.emptyStateIcon} />
              <h2 className={styles.emptyStateTitle}>No Presentations Found</h2>
              <p className={styles.emptyStateText}>
                Create a Slidev presentation in the <code>{sourceDir}</code> directory.
              </p>
              <code className={styles.emptyStateCode}>
                echo &quot;# My First Slide&quot; &gt; {sourceDir}/presentation.md
              </code>
            </div>
          )}

          {!hasContent && isInCategory && (
            <div className={styles.emptyState}>
              <FolderIcon className={styles.emptyStateIcon} width={64} height={64} />
              <h2 className={styles.emptyStateTitle}>Empty Category</h2>
              <p className={styles.emptyStateText}>
                This category doesn&apos;t contain any presentations yet.
              </p>
            </div>
          )}

          {hasContent && viewMode === "grid" && (
            <div className={styles.grid}>
              {sortedCategories.map((category) => (
                <SlidevCategoryCard key={`cat-${category.path}`} category={category} />
              ))}
              {sortedPresentations.map((presentation) => (
                <SlidevCard key={presentation.id} presentation={presentation} isDev={isDev} />
              ))}
            </div>
          )}

          {hasContent && viewMode === "list" && (
            <div className={styles.list}>
              {sortedCategories.map((category) => (
                <SlidevListItem key={`cat-${category.path}`} type="category" category={category} />
              ))}
              {sortedPresentations.map((presentation) => (
                <SlidevListItem key={presentation.id} type="presentation" presentation={presentation} isDev={isDev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
