import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import Checkout from './components/Checkout';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <Checkout />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

