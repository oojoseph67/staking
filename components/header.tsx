"use client";

import styles from "@/styles/Home.module.css";
import {
  useActiveAccount,
  useConnect,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { Beans } from "@web3uikit/icons";
import { client } from "@/configs";

export function Header() {
  const { connect, isConnecting, error } = useConnect();
  const { disconnect } = useDisconnect();
  const activeAccount = useActiveAccount();
  const wallet = useActiveWallet();

  console.log({ activeAccount });
  console.log({ wallet });

  const handleConnect = async () => {
    connect(async () => {
      const metamask = createWallet("io.metamask");
      if (injectedProvider("io.metamask")) {
        await metamask.connect({ client });
      } else {
        await metamask.connect({
          client,
          walletConnect: { showQrModal: true },
        });
      }
      return metamask;
    });
  };

  const handleDisconnect = async () => {
    if (wallet) {
      disconnect(wallet);
    }
  };

  return (
    <section className={styles.header}>
      <section className={styles.header_logo}>
        <h1 className={styles.title}>Beans Staking</h1>
        <Beans fontSize="20px" className={styles.beans} />
      </section>
      <section className={styles.header_btn}>
        {wallet ? (
          <button className={styles.connectBtn} onClick={handleDisconnect}>
            Disconnect
          </button>
        ) : (
          <button
            className={styles.connectBtn}
            disabled={isConnecting}
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        )}
      </section>
    </section>
  );
}
