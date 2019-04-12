import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { customGlobal } from './setupTests';

it('renders without crashing', () => {
  const div = document.createElement('div');
  customGlobal.fetch.mockResponseOnce(JSON.stringify({ data: '12345' }));
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
