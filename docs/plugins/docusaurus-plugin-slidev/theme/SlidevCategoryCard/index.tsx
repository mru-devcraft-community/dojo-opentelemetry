import React from "react";
import Link from "@docusaurus/Link";
import { FolderIcon } from "../icons";
import styles from "./styles.module.css";

interface Category {
  path: string;
  label: string;
  description?: string;
  count: number;
  url: string;
}

interface Props {
  category: Category;
}

export default function SlidevCategoryCard({ category }: Props) {
  return (
    <Link to={category.url} className={styles.card}>
      <div className={styles.bannerWrapper}>
        <span className={styles.banner}>Folder</span>
      </div>
      <div className={styles.iconContainer}>
        <FolderIcon className={styles.folderIcon} width={92} height={92} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{category.label}</h3>
        </div>
        {category.description && (
          <p className={styles.description}>{category.description}</p>
        )}
        <div className={styles.metadata}>
          <span className={styles.badge}>
            {category.count} presentation{category.count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
