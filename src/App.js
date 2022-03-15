import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import './App.css';
import abi from './utils/Voting.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [proposedCandidate, setProposedCandidate] = useState('');
  const [candidateList, setCandidateList] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isOwner, setIsOwner] = useState();
  const [candidateToConfirm, setCandidateToConfirm] = useState(null);
  const [votingContract, setVotingContract] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  // change this every time we re-deploy
  const contractAddress = '0x1F52cbb5aCFAA439496e64c23634B39985e74438';

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

  const setupSmartContractMethods = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    setVotingContract(contract);
  };

  useEffect(() => {
    if (votingContract) {
      getCandidates();
      checkIfUserIsTheOwner();

      votingContract.on('CandidateProposed', getCandidates);
      votingContract.on('VoteSubmitted', getCandidates);
      votingContract.on('ConfirmedCandidate', getCandidates);
      return () => {
        votingContract.off('CandidateProposed', getCandidates);
      };
    }
  }, [votingContract]);

  const getCandidates = async () => {
    try {
      const candidateListRes = await votingContract.getCandidates();
      const ownerRes = await votingContract.getOwner();
      console.log('🚀 ~ owner address', ownerRes);
      const cleanedCandidates = candidateListRes.map((item) => {
        return {
          name: item.name,
          votes: new BigNumber(item.votes._hex).toNumber(),
          confirmed: item.confirmed,
        };
      });
      setCandidateList(cleanedCandidates);
      setAppLoading(false);
      setIsMining(false);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfUserIsTheOwner = async () => {
    try {
      const userIsOwner = await votingContract.isOwner();
      console.log('🚀 ~ userIsOwner', userIsOwner);
      setIsOwner(userIsOwner);
    } catch (error) {
      console.log(error);
    }
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

  const proposeCandidate = async () => {
    if (!proposedCandidate.length) {
      return setMessageError(
        'You gots to type in a candidate name before prosping them'
      );
    } else {
      setMessageError('');
    }
    try {
      setIsMining(true);
      const res = await votingContract.proposeCandidate(proposedCandidate);
      await res.wait();
      setProposedCandidate('');
    } catch (error) {
      console.log('🚀 error', error);
    }
  };

  const submitVote = async () => {
    if (!selectedCandidate) {
      return setMessageError('Select a candidate before trynna vote');
    } else {
      setMessageError('');
    }
    try {
      setIsMining(true);
      const res = await votingContract.vote(selectedCandidate.name);
      await res.wait();
    } catch (error) {
      setMessageError(error.data.message);
      setIsMining(false);
    }
  };

  const confirmCandidate = async () => {
    if (!candidateToConfirm) {
      return setMessageError('Select a candidate to confirm before confirming');
    } else {
      setMessageError('');
    }
    try {
      setIsMining(true);
      const res = await votingContract.confirmCandidate(
        candidateToConfirm.name
      );
      await res.wait();
      setIsMining(false);
    } catch (error) {
      setMessageError(error.data.message);
      setIsMining(false);
    }
  };

  const unconfirmedCandidates = candidateList.reduce((all, item) => {
    if (!item.confirmed) {
      all++;
    }
    return all;
  }, 0);

  return !appLoading ? (
    <div className='mainContainer'>
      <div className='message-error'>{messageError}</div>

      {!currentAccount ? (
        <div className='no-wallet'>
          <div>You must install metamask and connect before using this app</div>
          <button className='waveButton' onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : null}

      {!isMining ? (
        <>
          {candidateList && candidateList.length ? (
            <div className='candidates-container'>
              <ul className='candidate-list'>
                <b>Click a candidate then press &quot;vote&quot;</b>
                {candidateList &&
                  candidateList.map((item, idx) => {
                    if (!item.confirmed) return;
                    return (
                      <li
                        key={idx}
                        onClick={() => setSelectedCandidate(item)}
                        className={
                          selectedCandidate &&
                          selectedCandidate.name === item.name
                            ? 'selected'
                            : ''
                        }
                      >
                        {item.name} ({item.votes})
                      </li>
                    );
                  })}
              </ul>
              <button className='vote-button' onClick={submitVote}>
                Vote
              </button>
            </div>
          ) : (
            <div>Propose a candidate, then voting will be enabled</div>
          )}

          {unconfirmedCandidates > 0 &&
          candidateList &&
          candidateList.length ? (
            <div className='pending-candidates'>
              <b>Pending Candidates</b>
              <ul className='candidate-list'>
                {isOwner ? (
                  <b>
                    Click a candidate below to confirm them + add them to the
                    ballot
                  </b>
                ) : null}
                {candidateList &&
                  candidateList.map((item, idx) => {
                    if (item.confirmed) return;
                    return (
                      <li
                        key={idx}
                        onClick={() => setCandidateToConfirm(item)}
                        className={
                          candidateToConfirm &&
                          candidateToConfirm.name === item.name
                            ? 'selected'
                            : ''
                        }
                      >
                        {item.name} ({item.votes})
                      </li>
                    );
                  })}
              </ul>
              {isOwner ? (
                <button className='vote-button' onClick={confirmCandidate}>
                  confirm candidate
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className='processing-transaction'>
          We&apos;re processing your transaction, please wait
        </div>
      )}
      <div className='propose-candidate-container'>
        <div className='message-input'>
          <input
            type='text'
            placeholder='John Doe'
            value={proposedCandidate}
            onChange={(e) => {
              setProposedCandidate(e.target.value);
            }}
          />
        </div>

        <button className='propose-candidate-button' onClick={proposeCandidate}>
          Propose Candidate
        </button>
      </div>
    </div>
  ) : null;
};

export default App;
