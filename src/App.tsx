import React, { useState, useEffect } from 'react';
import './assets/css/App.css';

function App() {
  let [testResults, setTestResults] = useState();
  
  async function getTestResults(){
    try {
      const response = await fetch('http://localhost:3001/getTestResults');
      const data = await response.json();
      setTestResults(data)
    } catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    getTestResults();
  }, [])

  return (
    <div className='App'>
      <h2>Instrument Results Dashboard</h2>
      {testResults ? 
        <table>
          <tbody>
            {Object.keys(testResults).map(key =>  
              <tr key={'header' + key}><th>{key}</th><td>{testResults[key]}</td></tr>
            )}
          </tbody>
        </table>
      : null} 
    </div>
  );
}

export default App;
