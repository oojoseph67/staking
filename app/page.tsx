import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/header";

export default function Home() {
  return (
    <section className={styles.main}>
      <Head>
        <title>Staking</title>
        <meta name="description" content="A staking platform for the masses." />
      </Head>
      <Header />
    </section>
  );
}
