import React, { useState } from "react";
import { PresentationIcon, AuthorIcon } from "../icons";
import styles from "./styles.module.css";

interface Presentation {
  id: string;
  title: string;
  description?: string;
  author?: string;
  url: string;
  previewUrl?: string;
}

interface Props {
  presentation: Presentation;
  isDev: boolean;
}

export default function SlidevCard({ presentation, isDev }: Props) {
  const [isLoading, setIsLoading] = useState(true);

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
          <PresentationIcon className={styles.previewIcon} width={160} height={90} />
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{presentation.title}</h3>
          {isDev && (
            <span className={`${styles.badge} ${styles.unavailableBadge}`}>
              Build Required
            </span>
          )}
        </div>
        {presentation.description && (
          <p className={styles.description}>{presentation.description}</p>
        )}
        {presentation.author && (
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <AuthorIcon className={styles.icon} />
              <span>{presentation.author}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isDev) {
    return <a href={presentation.url} className={styles.card}>{cardContent}</a>;
  }

  return (
    <a href={presentation.url} className={styles.card} target="_blank" rel="noopener noreferrer">
      {cardContent}
    </a>
  );
}
