import React, { useState } from "react";
import { usePluginData } from "@docusaurus/useGlobalData";
import { PresentationIcon } from "../icons";
import styles from "./styles.module.css";

function normalizePath(url: string): string {
  let normalized = url.endsWith("/") ? url.slice(0, -1) : url;
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  return normalized.toLowerCase();
}

interface Presentation {
  title: string;
  description?: string;
  url: string;
  previewUrl?: string;
}

interface PluginData {
  presentations: Presentation[];
  isDev: boolean;
}

function findPresentation(link: string): { presentation: Presentation | null; isDev: boolean } {
  const normalizedLink = normalizePath(link);
  try {
    const data = usePluginData("docusaurus-plugin-slidev") as PluginData;
    if (data?.presentations) {
      const found = data.presentations.find((p) => normalizePath(p.url) === normalizedLink);
      if (found) return { presentation: found, isDev: data.isDev };
    }
  } catch {
    // plugin data not found
  }
  return { presentation: null, isDev: false };
}

interface Props {
  link: string;
  width?: string;
  pluginId?: string;
}

export default function SlidevLink({ link, width = "550px" }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const { presentation, isDev } = findPresentation(link);

  if (!presentation) {
    return (
      <div className={styles.errorCard} style={{ width }}>
        <div className={styles.errorPreview}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <div className={styles.errorContent}>
          <h4 className={styles.errorTitle}>Presentation Not Found</h4>
          <p className={styles.errorMessage}>
            <code className={styles.errorPath}>{link}</code>
            <br />is not available
          </p>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      <div className={styles.preview}>
        {!isDev && presentation.previewUrl ? (
          <>
            {isLoading && (
              <div className={styles.previewLoading}>
                <div className={styles.spinner} />
              </div>
            )}
            <iframe
              src={presentation.previewUrl}
              className={`${styles.previewIframe} ${isLoading ? styles.previewIframeLoading : styles.previewIframeLoaded}`}
              title={`Preview of ${presentation.title}`}
              loading="lazy"
              onLoad={() => setIsLoading(false)}
            />
          </>
        ) : (
          <PresentationIcon className={styles.previewIcon} width={120} height={67} />
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{presentation.title}</h4>
          {isDev && <span className={styles.badge}>Build Required</span>}
        </div>
        {presentation.description && (
          <p className={styles.description}>{presentation.description}</p>
        )}
      </div>
    </>
  );

  return (
    <a href={presentation.url} className={styles.card} style={{ width }} target="_blank" rel="noopener noreferrer">
      {cardContent}
    </a>
  );
}
