import create from 'zustand';
import { ethers } from 'ethers';
import { App, ERC20ABI } from '../config';

const setLoading = (loading) => ({ loading });
const setDAIBalance = (DAIBalance) => ({ DAIBalance, loading: false });
const setAllowanceForSavers = (allowanceForSavers) => ({ allowanceForSavers, loading: false });

const getDAI = (provider) => new ethers.Contract(App.DAI, ERC20ABI, provider);

export const useDAI = create((set) => ({
  DAIBalance: ethers.BigNumber.from(0),
  allowanceForSavers: ethers.BigNumber.from(0),
  loading: false,
  fetchDAIBalance: async (address, chainId, provider) => {
    if (!address || chainId !== App.CHAIN_ID) {
      set(setDAIBalance(ethers.BigNumber.from(0)));
      return;
    }
    set(setLoading(true));

    const DAI = getDAI(provider);
    const balance = await DAI.balanceOf(address);
    set(setDAIBalance(balance));
  },
  fetchAllowanceForSavers: async (spender, chainId, provider) => {
    if (!spender || chainId !== App.CHAIN_ID) {
      set(setAllowanceForSavers(ethers.BigNumber.from(0)));
      return;
    }

    try {
      set(setLoading(true));

      const DAI = getDAI(provider);
      const allowance = await DAI.allowance(spender, App.SAVERS_VAULT);
      set(setAllowanceForSavers(allowance));
    } catch (error) {
      throw error;
    } finally {
      set(setLoading(false));
    }
  },
  approve: async (spender, value, provider, callback = () => {}) => {
    try {
      set(setLoading(true));

      const DAI = getDAI(provider);
      const tx = await DAI.approve(spender, value);
      callback(tx);
    } catch (error) {
      throw error;
    } finally {
      set(setLoading(false));
    }
  },
}));
