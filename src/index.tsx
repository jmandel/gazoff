import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { makeAutoObservable, makeObservable, observable } from "mobx";

// @ts-ignore
import ttest from 'ttest'

export interface State {
  readonly fractionComplete: number,
  stat: number,
  completeTrial: (distance: number) => void,
  resume: () => void,
  avg: (type: "glasses" | "uncorrected") => number,
  currentStatus: "paused" | "finished" | { awaiting: number, since: Date }
  trials: {
    type: "glasses" | "contacts" | "uncorrected",
    clockPosition: number,
    x: number,
    y: number,
    tapDistance: null | number
  }[]
}

function createState({nTrials} = {
  nTrials: 5
}): State {
  return {
    avg(type) {
      const distances = (type: "glasses" | "uncorrected") => this.trials.filter(t => t.type === type && t.tapDistance).map(t => t.tapDistance)
      const td = distances(type) as number[]
      return td.reduce((tot, d) => tot+d, 0) / td.length
    },
    get stat() {
      const distances = (type: "glasses" | "uncorrected") => this.trials.filter(t => t.type === type && t.tapDistance).map(t => t.tapDistance)
      const d1 = distances("glasses")
      const d2 = distances("uncorrected")
      if (d1.length < 1 || d2.length < 1) {
        return 0
      }
      const test = ttest(d1, d2)
      return test.pValue() as number
    },
    resume() {
      this.currentStatus = {
        awaiting: this.trials.filter(t => t.tapDistance).length,
        since: new Date()
      }
    },
    currentStatus: "paused",
    completeTrial(distance) {
      if (typeof this.currentStatus === 'object') {
        this.trials[this.currentStatus.awaiting].tapDistance = distance;
        let nextTrial = this.currentStatus.awaiting + 1
        if (nextTrial < this.trials.length) {
          this.currentStatus = {
            awaiting: nextTrial,
            since: new Date()
          }
        } else {
          this.currentStatus = "finished"
        }
      }
    },
    get fractionComplete() {
      const trials = this.trials;
      const completed = trials.filter(t => t.tapDistance !== null)
      return completed.length / trials.length
    },
    trials: Array(nTrials).fill(0).map((v, i) => ({
      type: i < nTrials/2 ? "glasses" : "uncorrected",
      clockPosition: Math.floor(Math.random() * 11 + 1),
      tapDistance:null,
      x: Math.random(),
      y: Math.random()
    }))  
  }
}

let state = makeAutoObservable(createState({
  nTrials: 20
}));


ReactDOM.render(
  <React.StrictMode>
    <App store={state} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
