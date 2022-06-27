import React, { useEffect, useState } from 'react';
import abi from './utils/ChallengeApp.json';
import { ethers } from 'ethers';

import { Routes, Route } from 'react-router-dom';
import CreateChallenge from './CreateChallenge';
import './App.css';
import ChallengePage from './ChallengePage';
// change this every time we re-deploy
const contractAddress = '0xa4B98735c1A6e8D248505D3AECf9f6e603132218';

function App() {
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState('');
  const [myContract, setMyContract] = useState(null);
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setupSmartContractMethods(ethereum);
      } else {
        setAppLoading(false);
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setupSmartContractMethods = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const myContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    setMyContract(myContract);
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      console.log('🚀 ~ connectWal ~ ethereum', ethereum);

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className='App'>
      {!currentAccount ? (
        <div className='no-wallet'>
          <div>You must install metamask and connect before using this app</div>
          <button className='btn-primary btn-lg' onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : null}
      <Routes>
        <Route
          path='/'
          element={
            <CreateChallenge myContract={myContract} appLoading={appLoading} />
          }
        />
        <Route
          path='/challenge-page/:name'
          element={
            <ChallengePage myContract={myContract} appLoading={appLoading} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
