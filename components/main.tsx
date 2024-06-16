"use client";

import styles from "@/styles/Home.module.css";
import { Staking } from "./staking";
import { StakingData } from "./stakingData";

export function Main() {
  return (
    <section className={styles.container}>
      <Staking />
      <StakingData />
    </section>
  );
}
