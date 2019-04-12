import React, { useState, useEffect } from 'react';
import { ISensorResult } from './types';
import './assets/css/App.css';

function App() {
  const [sensorResults, setSensorResults] = useState();
  useEffect(() => {
    getTestResults().then((data: ISensorResult) => setSensorResults(data));
  }, [])

  return (
    <div className='App'>
      Hello there...
      {sensorResults ? JSON.stringify(sensorResults): null}
    </div>
  );
}

async function getTestResults(){
  try {
    const response = await fetch('http://localhost:3001/getTestResults');
    const data = await response.json();
    return data;
  } catch(e){
    console.log(e);
  }
}
export default App;
