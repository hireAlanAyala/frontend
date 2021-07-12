import create from 'zustand';
import { ethers } from 'ethers';
import { App, ERC20ABI } from '../config';

const setLoading = (loading) => ({ loading });
const setDAIBalance = (DAIBalance) => ({ DAIBalance, loading: false });

export const useDAI = create((set) => ({
  DAIBalance: ethers.BigNumber.from(0),
  loading: false,
  fetchDAIBalance: async (address, provider) => {
    if (!address) return;
    set(setLoading(true));

    const DAI = new ethers.Contract(App.DAI, ERC20ABI, provider);
    const balance = await DAI.balanceOf(address);
    set(setDAIBalance(balance));
  },
}));
