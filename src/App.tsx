import React, { useState, useEffect } from 'react';
import { ISensorResult } from './types';
import './App.css';

function App() {
  const [sensorResults, setSensorResults] = useState();
  useEffect(() => {
    getSensorResults().then((data: ISensorResult) => setSensorResults(data));
  }, [])

  return (
    <div className='App'>
      {sensorResults ? JSON.stringify(sensorResults): null}
    </div>
  );
}

async function getSensorResults(){
  try {
    const response = await fetch('http://localhost:3001/getSensorResults');
    const data = await response.json();
    return data;
  } catch(e){
    console.log(e);
  }
}
export default App;
