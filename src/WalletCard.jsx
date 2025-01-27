import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

const WalletCard = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState('Connect Wallet');

  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);

  async function detectProvider() {
    const provider = await detectEthereumProvider();

    if (provider) {
      setMetaMaskInstalled(true);
      startApp(provider);
    } else {
      setConnButtonText('Install MetaMask');
      console.log('Please install MetaMask!');
    }
  }

  function startApp(provider) {
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }
  }

  const connectWalletHandler = () => {
    if (metaMaskInstalled) {
      // Connect Wallet logic
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log('MetaMask Here!');

        window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((result) => {
            accountChangedHandler(result[0]);
            setConnButtonText('Wallet Connected');
            getAccountBalance(result[0]);
          })
          .catch((error) => {
            setErrorMessage(error.message);
          });
      } else {
        console.log('Need to install MetaMask');
        setErrorMessage('Please install MetaMask browser extension to interact');
      }
    } else {
      if (connButtonText === 'Install MetaMask') {
        // Redirect to the MetaMask website
        window.location.href = 'https://metamask.io/';
      }
    }
  };

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    getAccountBalance(newAccount.toString());
  };

  const getAccountBalance = (account) => {
    window.ethereum
      .request({ method: 'eth_getBalance', params: [account, 'latest'] })
      .then((balance) => {
        setUserBalance(parseInt(balance, 16));
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const chainChangedHandler = () => {
    // Reload the page to avoid any errors with chain change mid-use of the application
    window.location.reload();
  };

  useEffect(() => {
    // Add event listeners and cleanup
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accountChangedHandler);
      window.ethereum.on('chainChanged', chainChangedHandler);

      return () => {
        window.ethereum.removeListener('accountsChanged', accountChangedHandler);
        window.ethereum.removeListener('chainChanged', chainChangedHandler);
      };
    }
  }, []);

  useEffect(() => {
    // Detect the Ethereum provider when the component mounts
    detectProvider();
  }, []);

  return (
    <div className="walletCard">
      <h4>Connection to MetaMask using window.ethereum methods</h4>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
      <div className="accountDisplay">
        <h3>Address: {defaultAccount}</h3>
      </div>
      <div className="balanceDisplay">
        <h3>Balance: {userBalance}</h3>
      </div>
      {errorMessage}
    </div>
  );
};

export default WalletCard;
