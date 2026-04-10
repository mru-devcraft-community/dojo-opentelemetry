import React from "react";
import Layout from "@theme/Layout";
import { usePluginData } from "@docusaurus/useGlobalData";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.css";

interface Presentation {
  id: string;
  title: string;
  description?: string;
  author?: string;
  url: string;
}

interface PluginData {
  presentations: Presentation[];
  isDev: boolean;
}

export default function SlidevPresentation() {
  const { presentations, isDev } = usePluginData("docusaurus-plugin-slidev") as PluginData;
  const location = useLocation();

  const presentation = presentations.find((p) => {
    const normalizedUrl = p.url.replace(/\/$/, "");
    const normalizedPath = location.pathname.replace(/\/$/, "");
    return normalizedUrl === normalizedPath;
  });

  if (!presentation) {
    return (
      <Layout title="Presentation Not Found">
        <div className={styles.container}>
          <div className={styles.errorState}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h1m4 0h13M4 4v10a2 2 0 0 0 2 2h10m3.42-.592c.359-.362.58-.859.58-1.408V4m-8 12v4m-3 0h6m-7-8l2-2m4 0l2-2M3 3l18 18"
              />
            </svg>
            <h1 className={styles.errorTitle}>Presentation Not Found</h1>
            <p className={styles.errorText}>
              The presentation at <code>{location.pathname}</code> could not be found.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isDev) {
    return (
      <Layout title={presentation.title} description={presentation.description}>
        <div className={styles.container}>
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M3 4h18M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4m-8 12v4m-3 0h6" />
                  <path d="m8 12l3-3l2 2l3-3" />
                </g>
              </svg>
            </div>
            <h1 className={styles.placeholderTitle}>{presentation.title}</h1>
            {presentation.description && (
              <p className={styles.placeholderDescription}>{presentation.description}</p>
            )}
            {presentation.author && (
              <div className={styles.placeholderMeta}>
                <svg className={styles.metaIcon} viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
                </svg>
                <span>By {presentation.author}</span>
              </div>
            )}
            <div className={styles.placeholderMessage}>
              <div className={styles.messageIcon}>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.91 2.91 0 0 1 12 1.67M12.01 15l-.127.007a1 1 0 0 0 0 1.986L12 17l.127-.007a1 1 0 0 0 0-1.986zM12 8a1 1 0 0 0-.993.883L11 9v4l.007.117a1 1 0 0 0 1.986 0L13 13V9l-.007-.117A1 1 0 0 0 12 8"
                  />
                </svg>
              </div>
              <h2 className={styles.messageTitle}>Development Mode</h2>
              <p className={styles.messageText}>
                This presentation is not available in development mode. To view it, build the site first:
              </p>
              <div className={styles.commandBlock}>
                <code>npm run build</code>
              </div>
              <p className={styles.messageText}>Then serve the built site:</p>
              <div className={styles.commandBlock}>
                <code>npm run serve</code>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={presentation.title} description={presentation.description}>
      <div className={styles.presentationContainer}>
        <iframe
          src={presentation.url}
          className={styles.presentationIframe}
          title={presentation.title}
          allowFullScreen
        />
      </div>
    </Layout>
  );
}
