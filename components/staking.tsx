"use client";

import styles from "@/styles/Home.module.css";
import { TOKEN_CONTRACT_ADDRESS } from "@/configs";
import { useEffect, useState } from "react";
import {
  getProvider,
  useUserPosition,
  useTokenBalance,
  usePositionById,
  getStakingContractInterface,
  convertToWei,
  useCheckAllowance,
  getERC20ContractInterface,
} from "@/contract";
import { useActiveWallet } from "thirdweb/react";
import { ethers } from "ethers";

export function Staking() {
  const wallet = useActiveWallet();
  const [tokenAddress, setTokenAddress] = useState<string>(
    TOKEN_CONTRACT_ADDRESS
  );
  const [stakingTab, setStakingTab] = useState(true);
  const [unstakingTab, setUnstakingTab] = useState(true);
  const [unstakeValue, setUnstakeValue] = useState("0");

  // const [assetIds, setAssetIds] = useState([]);
  // const [assets, setAssets] = useState([]);
  const [amount, setAmount] = useState("0");

  const { balance } = useTokenBalance(tokenAddress);
  console.log({ balance });

  const assetId = useUserPosition();
  console.log({ assetId });

  const positions = usePositionById();
  console.log({ positions });

  const { allowance } = useCheckAllowance(tokenAddress);
  console.log({ allowance });

  const switchToUnstake = async () => {
    if (!unstakingTab) {
      setUnstakingTab(true);
      setStakingTab(false);
    }

    // getUserPositions
  };

  const switchToStake = async () => {
    if (!stakingTab) {
      setStakingTab(true);
      setUnstakingTab(false);
    }
  };

  const withdraw = async (positionId: number) => {
    console.log("withdraw");
    // const positionId = 1;
    const contract = await getStakingContractInterface();
    const withdraw = await contract.withdraw(positionId);
    console.log({ withdraw });
  };

  const stakeTokens = async () => {
    console.log("stake");
    const contract = await getStakingContractInterface();
    const formatAmount = convertToWei(amount, 18);
    const tx = await contract.stakeTokens(
      0,
      "0x463e7AbCe0C85C9e608f9c4F49cf7625EEE79172",
      formatAmount
    );
    await tx.wait();
    console.log({ tx });
  };

  const approve = async () => {
    try {
      console.log("approve");
      const contract = await getERC20ContractInterface(tokenAddress);
      console.log({ contract });
      const approvalAmount = ethers.constants.MaxUint256;
      const tx = await contract.approve(
        "0xB07825b02b1Eb35d07f8a4d42d7dDc1E4D72476A",
        approvalAmount
      );
      await tx.wait();
      console.log("Approval transaction:", tx);
    } catch (error) {
      console.log("Approval failed:", error);
    }
  };

  useEffect(() => {
    (async () => {
      const provider = await getProvider();
      console.log("use effect", provider);
    })();
  }, [wallet]);

  return (
    <section className={styles.stakingContainer}>
      <section>
        <section className={styles.stakeUnstakeTab}>
          <section
            className={`${stakingTab ? styles.stakingType : ""}`}
            id="stake"
            onClick={switchToStake}
          >
            Stake
          </section>
          <section
            className={`${unstakingTab ? styles.stakingType : ""}`}
            id="unstake"
            onClick={switchToUnstake}
          >
            Unstake
          </section>
        </section>
        <section className={styles.stakingSection}>
          <span className={styles.apy}>7% APY</span>
          {stakingTab ? (
            <section className={styles.stakingBox}>
              <h2>Stake</h2>
              <input
                className={styles.inputField}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                id="inputField"
                placeholder="Enter amount to stake"
                required
              />
              <section className={styles.stakingInfo}>
                <p>
                  Balance <span>{balance}</span>
                </p>
                <p>Exchange Rate: 1.0333</p>
                <button
                  disabled={!amount}
                  className={styles.stakeBtn}
                  onClick={allowance === "0" ? approve : stakeTokens}
                >
                  {allowance === "0" ? "Approve" : "Stake"}
                </button>
              </section>
            </section>
          ) : (
            <section className={styles.stakingBox}>
              <h2>Unstake</h2>
              <input
                className={styles.inputField}
                value={unstakeValue}
                onChange={(e) => setUnstakeValue(e.target.value)}
                type="number"
                id="inputField"
                placeholder="Enter Amount"
                required
              />
              <section className={styles.stakingInfo}>
                <p>
                  Balance:{" "}
                  {positions.length > 0 &&
                    positions.map((a, id) => {
                      if (a.open) {
                        return <span key={id}>{a.etherStaked}</span>;
                      } else {
                        return <span></span>;
                      }
                    })}
                </p>
                {/* <p>Transaction Cost</p> */}
                <p>You Receive:</p>
              </section>
              <button
                className={styles.stakeBtn}
                onClick={() => withdraw(positions.positionId)}
              >
                UNSTAKE
              </button>
            </section>
          )}
        </section>
      </section>
    </section>
  );
}
