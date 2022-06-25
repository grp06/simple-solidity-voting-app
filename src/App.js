import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import './App.css';
import abi from './utils/BasicAAVE.json';

let minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: 'usr', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

let kovanDaiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD';
// change this every time we re-deploy
const contractAddress = '0x7617d08DBb1f796c03e3Cb991c5F3b23dA187347';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [aaveContract, setAaveContract] = useState(null);
  const [appLoading, setAppLoading] = useState(false);
  const [daiContract, setDaiContract] = useState(null);

  const contractABI = abi.abi;

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

  useEffect(() => {
    if (aaveContract) {
      const fallbackHit = (stuff) => {
        console.log('stuff = ', stuff);
      };
      aaveContract.on('FallbackHit', fallbackHit);
    }
  }, [aaveContract]);

  const setupSmartContractMethods = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const myContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    setAaveContract(myContract);
    const daiContract = new ethers.Contract(kovanDaiAddress, minABI, signer);
    setDaiContract(daiContract);
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

  const approveDaiSpending = () => {
    daiContract.approve(contractAddress, ethers.utils.parseEther('1000'));
  };

  const getDaiBalance = async () => {
    const res = await aaveContract.getDaiBalance();
    const formatted = ethers.utils.formatEther(res._hex);
    console.log('🚀 ~ getDaiBalance ~ formatted', formatted);
  };

  const getContractsDaiBalance = async () => {
    const res = await aaveContract.getContractsDaiBalance();
    const formatted = ethers.utils.formatEther(res._hex);
    console.log('🚀 ~ getDaiBalance ~ formatted', formatted);
  };

  const getSender = async () => {
    const res = await aaveContract.getSender();
    console.log('🚀  ~ res', res);
  };

  const getAdaiValue = async () => {
    const res = await aaveContract.getAdaiValue();
    const formatted = ethers.utils.formatEther(res._hex);
    console.log('🚀  ~ formatted', formatted);
  };

  const getMyWalletAdaiBalance = async () => {
    const res = await aaveContract.getMyWalAdaiBalance();
    const formatted = ethers.utils.formatEther(res._hex);
    console.log('🚀  ~ formatted', formatted);
  };

  const transferDaiToContract = async () => {
    const res = await aaveContract.transferDaiToContract();
    console.log('🚀  ~ res', res);
  };

  const deposit = async () => {
    const res = await aaveContract.deposit();
    console.log('🚀  ~ res', res);
  };

  const viewAccount = async () => {
    const res = await aaveContract.viewAccount();
    console.log('🚀  ~ res', res[0]._hex);

    console.log(res[0]._hex.toString());
  };

  return !appLoading ? (
    <div className='mainContainer'>
      {!currentAccount ? (
        <div className='no-wallet'>
          <div>You must install metamask and connect before using this app</div>
          <button className='waveButton' onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : null}
      <div>
        <button onClick={approveDaiSpending}>Approve</button>
      </div>
      <div>
        <button onClick={getDaiBalance}>get dai balance</button>
      </div>
      <div>
        <button onClick={getContractsDaiBalance}>
          get contracts dai balance
        </button>
      </div>
      <div>
        <button onClick={getSender}>get sender</button>
      </div>
      <div>
        <button onClick={getAdaiValue}>get aDai Value</button>
      </div>
      <div>
        <button onClick={transferDaiToContract}>transferDaiToContract</button>
      </div>
      <div>
        <button onClick={deposit}>Deposit</button>
      </div>
      <div>
        <button onClick={getMyWalletAdaiBalance}>
          get my wallets aDai balance
        </button>
      </div>
      <div>
        <button onClick={viewAccount}>view account</button>
      </div>
    </div>
  ) : null;
};

export default App;
