import React, { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

const ChallengePage = ({ myContract, appLoading }) => {
  const [challengeData, setChallengeData] = useState({});
  console.log('🚀 ~ ChallengePage ~ challengeData', challengeData);
  useEffect(() => {
    const getChallenge = async () => {
      const name = window.location.pathname.split('/')[2];
      const [
        owner,
        challengeName,
        description,
        numWeeks,
        started,
        ended,
        exists,
        zoomLink,
        weeklyMeetingTime,
        challengeId,
        participants,
      ] = await myContract.getChallenge(name);
      setChallengeData({
        owner,
        challengeName,
        description,
        numWeeks,
        started,
        ended,
        exists,
        zoomLink,
        weeklyMeetingTime,
        challengeId,
        participants,
      });
    };
    if (myContract) {
      getChallenge();
    }
  }, [myContract]);

  const renderChallengePage = () => {
    const {
      owner,
      challengeName,
      description,
      numWeeks,
      started,
      ended,
      exists,
      zoomLink,
      weeklyMeetingTime,
      challengeId,
      participants,
    } = challengeData;
    return (
      <div className='container'>
        <div className='create-challenge'>
          <div className='card'>
            <div className='card-header'>Hosted by: {owner}</div>
            <div className='card-body'>
              <h5 className='card-title'>{challengeName}</h5>
              <p className='card-text'>{description}</p>
              <p className='card-text'>
                Weekly Zoom calls at: {weeklyMeetingTime}
              </p>
              <p className='card-text'>
                Weekly Zoom calls at: {weeklyMeetingTime}
              </p>
              <a href={zoomLink} className='btn btn-primary'>
                Join Zoom Call
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return !appLoading && challengeData ? renderChallengePage() : null;
};

export default ChallengePage;
