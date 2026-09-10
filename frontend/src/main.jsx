import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { persistor } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import AuthInitializer from './components/AuthInitializer.jsx'
import axios from 'axios'

// All API requests, including the startup /auth/me request, must carry the
// HttpOnly authentication cookie when they target a different origin locally.
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthInitializer><App /></AuthInitializer>
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
