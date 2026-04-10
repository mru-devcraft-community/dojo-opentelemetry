import React from "react";
import Link from "@docusaurus/Link";
import { PresentationIcon, FolderIcon, AuthorIcon } from "../icons";
import styles from "./styles.module.css";

interface Presentation {
  id: string;
  title: string;
  description?: string;
  author?: string;
  url: string;
}

interface Category {
  path: string;
  label: string;
  description?: string;
  count: number;
  url: string;
}

type Props =
  | { type: "presentation"; presentation: Presentation; isDev: boolean }
  | { type: "category"; category: Category };

export default function SlidevListItem(props: Props) {
  if (props.type === "category") {
    const { category } = props;
    return (
      <Link to={category.url} className={`${styles.listItem} ${styles.categoryItem}`}>
        <div className={styles.titleSection}>
          <FolderIcon className={styles.icon} width={18} height={18} />
          <span className={styles.title}>{category.label}</span>
        </div>
        <div className={styles.descriptionSection}>
          {category.description || "—"}
        </div>
        <div className={styles.metaSection}>
          <span className={styles.badge}>
            {category.count} presentation{category.count !== 1 ? "s" : ""}
          </span>
        </div>
      </Link>
    );
  }

  const { presentation, isDev } = props;
  const content = (
    <>
      <div className={styles.titleSection}>
        <PresentationIcon className={styles.icon} width={18} height={18} />
        <span className={styles.title}>{presentation.title}</span>
        {isDev && <span className={styles.devBadge}>Build Required</span>}
      </div>
      <div className={styles.descriptionSection}>
        {presentation.description || "—"}
      </div>
      <div className={styles.metaSection}>
        {presentation.author && (
          <div className={styles.author}>
            <AuthorIcon className={styles.authorIcon} width={14} height={14} />
            <span>{presentation.author}</span>
          </div>
        )}
      </div>
    </>
  );

  if (isDev) {
    return <a href={presentation.url} className={styles.listItem}>{content}</a>;
  }
  return (
    <a href={presentation.url} className={styles.listItem} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}
