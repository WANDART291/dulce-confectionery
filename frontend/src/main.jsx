import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// 1. Initialize the Apollo Client
// We use 127.0.0.1 to force IPv4, avoiding Windows localhost issues.
const client = new ApolloClient({
  uri: 'http://127.0.0.1:8000/graphql/', 
  cache: new InMemoryCache(),
});

// 2. Render the React Application
// We wrap the entire App in ApolloProvider so every component can request data.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)