import React, { useEffect, useState } from 'react';

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import BigNumber from 'bignumber.js';

const CreateChallenge = ({ myContract, appLoading }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [numWeeks, setNumWeeks] = useState('');
  const [zoom, setZoom] = useState('');
  const [time, setTime] = useState('');

  const createChallengeOnChain = async () => {
    // const numWeeksParam = new BigNumber(numWeeks);
    // eslint-disable-next-line react/prop-types
    const res = await myContract.createChallenge(
      name,
      numWeeks,
      description,
      zoom,
      time
    );

    const res2 = await myContract.getChallenge(name);
    navigate(`challenge-page/${name}`);

    console.log('🚀 ~ createChallenge ~ res2', res2);
  };

  return !appLoading ? (
    <div className='container'>
      <div className='create-challenge'>
        <h1>Create a challenge</h1>
        <div className='challenge-warning'>
          (or, to join a challenge, ask the creator for the join link)
        </div>

        <label
          htmlFor='basic-url'
          className='form-label w-100 text-center mt-5'
        >
          Challenge Name
        </label>
        <div className='input-group mb-3 w-50'>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>
        <label
          htmlFor='basic-url'
          className='form-label w-100 text-center mt-3'
        >
          Challenge Description
        </label>
        <div className='input-group mb-3 w-50'>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>
        <label
          htmlFor='basic-url'
          className='form-label w-100 text-center mt-3'
        >
          Number of Weeks
        </label>
        <div className='input-group mb-3 w-50'>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={(e) => setNumWeeks(e.target.value)}
            value={numWeeks}
          />
        </div>
        <label
          htmlFor='basic-url'
          className='form-label w-100 text-center mt-3'
        >
          Zoom Link
        </label>
        <div className='input-group mb-3 w-50'>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={(e) => setZoom(e.target.value)}
            value={zoom}
          />
        </div>
        <label
          htmlFor='basic-url'
          className='form-label w-100 text-center mt-3'
        >
          Weekly Meeting Time
        </label>
        <div className='input-group mb-3 w-50'>
          <input
            type='text'
            className='form-control'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={(e) => setTime(e.target.value)}
            value={time}
          />
        </div>
        <div className='submit-container w-100 mt-5 d-flex justify-content-center'>
          <button
            onClick={createChallengeOnChain}
            className='btn-lg btn-primary'
          >
            Create Challenge
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreateChallenge;
