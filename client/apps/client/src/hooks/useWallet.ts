import { ethers } from "ethers";
import { AES, enc } from "crypto-js";
import { useWalletState } from "../contexts/state";
import { NETWORKS } from "../constants/networks";

export const useWallet = () => {
  const { address, network, importedToken, provider, signer, encryptedInfo, isUnlocked, set } = useWalletState()

  const importWallet = async (privateKey: string, passcode: string) => {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const encryptedInfo = AES.encrypt(privateKey, passcode).toString()

    set({ encryptedInfo, signer: wallet, provider, address: wallet.address, isUnlocked: true })
  }

  const unlockWallet = async (passcode: string) => {
    const decryptedInfo = AES.decrypt(encryptedInfo, passcode).toString(enc.Utf8)
    const provider = new ethers.JsonRpcProvider(network.rpcUrl)
    const wallet = new ethers.Wallet(decryptedInfo, provider)
    set({ signer: wallet, isUnlocked: true, address: wallet.address, provider })
  }

  const switchNetwork = async (chainId: number) => {
  }

  return {
    address,
    network,
    importedToken,
    provider,
    signer,
    encryptedInfo,
    isUnlocked,
    importWallet,
    unlockWallet,
    switchNetwork
  }
}
