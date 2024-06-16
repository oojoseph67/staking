import { ethers } from "ethers";
import ERC20 from "./ERC20.json";
import StakingABI from "./Staking.json";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { CONTRACT_ADDRESS } from "@/configs";

export async function getProvider() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const balance = await provider.getBalance(signer.getAddress());
    return { provider, signer, balance: ethers.utils.formatEther(balance) };
  } else {
    alert("Please install MetaMask!");
    throw new Error("MetaMask not installed");
  }
}

export async function getERC20ContractInterface(tokenAddress: string) {
  try {
    const { signer } = await getProvider();
    const contract = new ethers.Contract(tokenAddress, ERC20.abi, signer);
    return contract;
  } catch (error) {
    console.error("Failed to get provider or contract interface:", error);
    throw error;
  }
}

export async function getStakingContractInterface() {
  try {
    const { signer } = await getProvider();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      StakingABI.abi,
      signer
    );
    return contract;
  } catch (error) {
    console.error("Failed to get provider or contract interface:", error);
    throw error;
  }
}

export function useCheckAllowance(tokenAddress: string) {
  const [allowance, setAllowance] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    if (activeAccount?.address) {
      (async () => {
        try {
          setIsLoading(true);
          const contract = await getERC20ContractInterface(tokenAddress);
          const allowance = await contract.allowance(
            activeAccount?.address,
            CONTRACT_ADDRESS
            // "0xE924512E05C828c0881f46508e27Bb59238e87b9",
            // spender // staking contract address
          );
          setAllowance(allowance.toString());
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [tokenAddress, activeAccount]);

  return { allowance, isLoading, error };
}

export function useTokenBalance(tokenAddress: string) {
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    if (activeAccount?.address) {
      (async () => {
        try {
          setIsLoading(true);
          const contract = await getERC20ContractInterface(tokenAddress);
          console.log({ contract });
          const balance = await contract.balanceOf(activeAccount?.address);
          const decimals = await contract.decimals();
          const readableBalance = convertToReadable(balance, decimals);
          setBalance(readableBalance);
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [tokenAddress, activeAccount]);

  return { balance, isLoading, error };
}

export function useUserPosition() {
  const [assetIds, setAssetIds] = useState<ethers.BigNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    if (activeAccount?.address) {
      (async () => {
        try {
          setIsLoading(true);
          const contract = await getStakingContractInterface();
          console.log("staking contract", contract);
          const assetIds = await contract.getPositionIdsForAddress(
            activeAccount?.address
          );
          // const assetIds = await contract.getPositionIdsForAddress(
          //   "0xE924512E05C828c0881f46508e27Bb59238e87b9"
          // );
          setAssetIds(assetIds);
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  return { assetIds, isLoading, error };
}

type PositionsType = {
  positionId: string;
  percentInterest: number;
  createdDate: string;
  daysRemaining: number;
  interest: string;
  staked: string;
  open: any;
  tokenAddress: any;
  walletAddress: any;
};

export function usePositionById() {
  const [assets, setAssets] = useState<PositionsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();
  const {
    assetIds: userPosition,
    isLoading: userPositionLoading,
    error: userPositionError,
  } = useUserPosition();

  useEffect(() => {
    if (activeAccount?.address && !userPositionLoading && !userPositionError) {
      (async () => {
        try {
          setIsLoading(true);
          const contract = await getStakingContractInterface();
          console.log("staking contract", contract);

          const positionIds = userPosition.map((pos) =>
            ethers.BigNumber.from(pos).toString()
          );
          console.log("positionIds", positionIds);

          const queriedAssets = await Promise.all(
            positionIds.map(async (positionId: string) => {
              const asset = await contract.getPositionById(positionId);
              return asset;
            })
          );

          console.log("queriedAssets", queriedAssets);

          const updatedQuery = await Promise.all(
            queriedAssets.map(async (asset) => {
              const parsedAsset = {
                positionId: Number(asset.positionId).toString(),
                percentInterest: Number(asset.percentInterest) / 100,
                createdDate: new Date(
                  asset.createdDate * 1000
                ).toLocaleDateString(),
                daysRemaining: calcDaysRemaining(asset.unlockDate),
                interest: convertToReadable(asset.weiInterest, 18),
                staked: convertToReadable(asset.weiStaked, 18),
                open: asset.open,
                tokenAddress: asset.tokenAddress,
                walletAddress: asset.walletAddress,
              };
              console.log("parsedAsset", parsedAsset);
              return parsedAsset;
            })
          );
          setAssets(updatedQuery);
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount, userPosition, userPositionLoading, userPositionError]);

  return { assets, isLoading, error };
}

export const convertToReadable = (balance: string, decimals: number) => {
  return ethers.utils.formatUnits(balance, decimals);
};

export const convertToWei = (balance: string, decimals: number) => {
  return ethers.utils.parseUnits(balance, decimals);
};

export function calcDaysRemaining(unlockDate: number) {
  const timeNow = Date.now() / 1000;
  const secondsRemaining = unlockDate - timeNow;
  return Math.max(Number((secondsRemaining / 86400).toFixed(0)), 0);
}
