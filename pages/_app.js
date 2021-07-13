/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useAccounts, useSaversVault, useDAI } from '../src/hooks';
import { App } from '../src/config';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

function MyApp({ Component, pageProps }) {
  const {
    initAccount,
    onChainChanged,
    onAccountChanged,
    selectedAddress,
    networkVersion,
    getProvider,
  } = useAccounts((state) => ({
    initAccount: state.initAccount,
    onChainChanged: state.onChainChanged,
    onAccountChanged: state.onAccountChanged,
    selectedAddress: state.selectedAddress,
    networkVersion: state.networkVersion,
    getProvider: state.getProvider,
  }));

  const { currentTransaction, setPreviousTransaction, fetchSaversDAIBalance } = useSaversVault(
    (state) => ({
      currentTransaction: state.currentTransaction,
      setPreviousTransaction: state.setPreviousTransaction,
      fetchSaversDAIBalance: state.fetchSaversDAIBalance,
    }),
  );

  const { fetchDAIBalance, fetchAllowanceForSavers } = useDAI((state) => ({
    fetchDAIBalance: state.fetchDAIBalance,
    fetchAllowanceForSavers: state.fetchAllowanceForSavers,
  }));

  const rehydrate = () => {
    const provider = getProvider();
    fetchSaversDAIBalance(selectedAddress, networkVersion, provider);
    fetchDAIBalance(selectedAddress, networkVersion, provider);
    fetchAllowanceForSavers(selectedAddress, networkVersion, provider);
  };

  useEffect(() => {
    initAccount();
    const cleanupOnChainChanged = onChainChanged();
    const cleanupOnAccountChanged = onAccountChanged();

    // Quick hack to fix race condition seen in prod
    setTimeout(() => {
      if (networkVersion.toString() !== App.CHAIN_ID.toString()) {
        initAccount();
      }
    }, 10);

    return () => {
      cleanupOnChainChanged();
      cleanupOnAccountChanged();
    };
  }, []);

  useEffect(() => {
    rehydrate();
  }, [selectedAddress, networkVersion]);

  useEffect(() => {
    (async () => {
      if (currentTransaction) {
        try {
          const tx = await currentTransaction.wait();
          rehydrate();
          setPreviousTransaction(tx);
        } catch (error) {
          setPreviousTransaction(error.receipt);
        }
      }
    })();
  }, [currentTransaction]);

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
