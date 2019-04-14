import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { act } from 'react-dom/test-utils';

const mockResults = {'hum-1':'keep','hum-2':'discard','temp-1':'precise'};

it("should display fetched data correctly", async () => {
  let resolve:any;

  window.fetch = function fetch() {
    return new Promise<any>(_resolve => {
      resolve = _resolve;
    });
  }

  const el = document.createElement('div');
  act(() => {
    ReactDOM.render(<App />, el);
  });
  
  expect(el.innerHTML).toBe('<div class=\"App\"><h2>Instrument Results Dashboard</h2></div>');

  //@ts-ignore //types don't exist yet for react/react-dom 16.9.0-alpha.0
  await act(async () => {
    resolve({
      ok: true,
      status: 200,
      json: () => mockResults
    });
  });

  const headers = el.querySelectorAll('th');
  expect(headers.length).toBe(Object.keys(mockResults).length);

  const values = el.querySelectorAll('td');
  expect(values.length).toBe(Object.values(mockResults).length);
});