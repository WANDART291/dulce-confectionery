import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

// --- THIS IS THE MAGIC BRIDGE TO YOUR LOCAL DOCKER DATABASE ---
const client = new ApolloClient({
 uri: 'https://dulce-api-wandile.duckdns.org/graphql/', // Switched to local backend
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)