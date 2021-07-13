import create from 'zustand';
import { ethers } from 'ethers';
import { App } from '../config';

const CHAIN_NOT_ADDED = 4902;

const setAccount = (selectedAddress) => ({
  selectedAddress,
});

const setNetwork = (networkVersion) => ({
  networkVersion: parseInt(networkVersion),
});

export const useAccounts = create((set, get) => ({
  selectedAddress: '',
  networkVersion: '',
  hasMetaMask: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  getProvider: () => {
    if (!get().hasMetaMask()) return new ethers.providers.JsonRpcProvider(App.MATIC_RPC);

    return new ethers.providers.Web3Provider(window.ethereum, 'any');
  },
  initAccount: () => {
    if (!get().hasMetaMask()) return;

    const { ethereum } = window;

    // Required to init values.
    ethereum.selectedAddress;
    ethereum.networkVersion;

    set({ ...setAccount(ethereum.selectedAddress), ...setNetwork(ethereum.networkVersion) });
  },
  requestAccounts: async () => {
    if (!get().hasMetaMask()) return;

    const { ethereum } = window;
    await ethereum.request({ method: 'eth_requestAccounts' });
  },
  switchToPolygon: async () => {
    if (!get().hasMetaMask()) return;

    const { ethereum } = window;
    const chainId = `0x${App.CHAIN_ID.toString(16)}`;
    const chainName = 'Matic Mainnet';
    const nativeCurrency = {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    };
    const rpcUrls = [App.MATIC_RPC];
    const blockExplorerUrls = ['https://polygonscan.com'];

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      if (switchError.code === CHAIN_NOT_ADDED) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls }],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  },
  onChainChanged: () => {
    if (!get().hasMetaMask()) return;

    const { ethereum } = window;
    const eventName = 'chainChanged';
    const eventHandler = (chainId) => {
      set(setNetwork(chainId));
    };
    ethereum.on(eventName, eventHandler);
    return () => window.removeEventListener(eventName, eventHandler);
  },
  onAccountChanged: () => {
    if (!get().hasMetaMask()) return;

    const { ethereum } = window;
    const eventName = 'accountsChanged';
    const eventHandler = (accounts) => {
      set(setAccount(accounts[0] || null));
    };
    ethereum.on(eventName, eventHandler);
    return () => window.removeEventListener(eventName, eventHandler);
  },
}));
