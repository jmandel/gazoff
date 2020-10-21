import React, {useLayoutEffect, useRef} from 'react';
import logo from './logo.svg';
import './App.css';
import './index'
import {observer} from 'mobx-react';
import {State } from './index'

const App = observer(({store}: {store: State}) => {
  const oRef = useRef<HTMLDivElement|null>(null);

  useLayoutEffect(() => {
    if (oRef.current) {
      console.log("oref", oRef.current.clientWidth)
    }
  })
  
  const glassesAvg = store.avg("glasses")
  const uncorrectedAvg = store.avg("uncorrected")

  let trial: null | typeof store.trials[number] = null;
  if (typeof store.currentStatus == "object")
     trial = store.trials[store.currentStatus.awaiting];

  return (

    <div className="App"
    onTouchEnd={(e) => {
      if (!oRef.current) {
        console.log("No oref")
        return
      }
      const {clientX: x, clientY: y} = e.changedTouches[0]
      const targetX = (trial?.x || 0) * oRef.current!.offsetParent!.clientWidth;
      const targetY = (trial?.y || 0) * oRef.current!.offsetParent!.clientHeight;

      const distance = Math.sqrt(
        Math.pow((targetX - x), 2) +
        Math.pow((targetY - y), 2)
      )

      console.log(x, targetX, y, targetY, distance)

      store.completeTrial(distance)
    }}
    style={{
      width: "100%",
      height: "100%",
      maxHeight: "100%",
      position: "relative"
    }}>
      Data collection {(store.fractionComplete * 100).toFixed(0)}% complete.
      <br></br>
      {typeof store.currentStatus == "object" && <span 
        style={{fontStyle: "italic"}}
      >
        Please hold device at {store.trials[store.currentStatus.awaiting].clockPosition} o'clock .
        <br></br>
        Please say "{store.trials[store.currentStatus.awaiting].type}".
       </span>}
      <br></br>
 
      {store.currentStatus == "paused" && <button
        onClick={()=>{
          store.resume()
        }}
      >
        Begin 
       </button>}
      {
        !isNaN(glassesAvg + uncorrectedAvg) && 
        <div>
          <br></br>
            Glasses {glassesAvg.toFixed(0)}  vs Uncorrected  {uncorrectedAvg.toFixed(0)}.
          <br></br>
            T-test result: p={(store.stat)}.
        </div>
      }

      <div 
      ref={oRef}
      className="marks-the-spot"
      style={{
        display: "absolute",
        left: (trial?.x || .5) * 100 + "%",
        top: (trial?.y || .5) * 100 + "%",
        textAlign: "left",
        color: "blue"
      }}>o</div>

      <pre style={{
        maxWidth: "100%",
        overflow: "scroll"
      }}>
        {JSON.stringify(store.trials)}
      </pre>
      
    </div>
  );
});

export default App;
