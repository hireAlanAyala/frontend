import create from 'zustand';
import { ethers } from 'ethers';
import { App, SaversVaultABI, SaversDAIABI } from '../config';

const setLoading = (loading) => ({ loading });
const setSaversDAIBalance = (saversDAIBalance) => ({ saversDAIBalance, loading: false });
const setCurrentTransaction = (currentTransaction) => ({
  currentTransaction,
  loading: false,
});
const setPreviousTransaction = (previousTransaction) => ({
  previousTransaction,
  currentTransaction: null,
  loading: false,
});

export const useSaversVault = create((set, get) => ({
  saversDAIBalance: ethers.BigNumber.from(0),
  loading: false,
  currentTransaction: null,
  previousTransaction: null,
  setCurrentTransaction: (tx) => {
    set(setCurrentTransaction(tx));
  },
  setPreviousTransaction: (tx) => {
    set(setPreviousTransaction(tx));
  },
  fetchSaversDAIBalance: async (address, chainId, provider) => {
    if (!address || chainId !== App.CHAIN_ID) {
      set(setSaversDAIBalance(ethers.BigNumber.from(0)));
      return;
    }
    set(setLoading(true));

    const saversDAI = new ethers.Contract(App.SAVERS_DAI, SaversDAIABI, provider);
    const balance = await saversDAI.balanceOf(address);
    set(setSaversDAIBalance(balance));
  },
  withdraw: async (amount, provider) => {
    try {
      set(setLoading(true));

      const saversVault = new ethers.Contract(App.SAVERS_VAULT, SaversVaultABI, provider);
      const tx = await saversVault.withdraw(amount, { gasLimit: 400000 });
      set(setCurrentTransaction(tx));
    } catch (error) {
      set(setLoading(false));
      throw error;
    }
  },
  withdrawMax: async (provider) => {
    try {
      set(setLoading(true));

      const saversVault = new ethers.Contract(App.SAVERS_VAULT, SaversVaultABI, provider);
      const tx = await saversVault.withdrawMax({ gasLimit: 400000 });
      set(setCurrentTransaction(tx));
    } catch (error) {
      set(setLoading(false));
      throw error;
    }
  },
  deposit: async (amount, provider) => {
    try {
      set(setLoading(true));

      const saversVault = new ethers.Contract(App.SAVERS_VAULT, SaversVaultABI, provider);
      const tx = await saversVault.deposit(amount, { gasLimit: 400000 });
      set(setCurrentTransaction(tx));
    } catch (error) {
      set(setLoading(false));
      throw error;
    }
  },
}));
