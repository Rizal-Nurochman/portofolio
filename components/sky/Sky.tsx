"use client";

import SkyCanvas from "./SkyCanvas";
import styles from "./Sky.module.css";

export default function Sky() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <SkyCanvas />
      <div className={styles.readability} />
      <div className={styles.atmosphere} />
      <div className={styles.grain} />
    </div>
  );
}