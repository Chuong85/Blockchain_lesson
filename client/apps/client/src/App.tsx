import { QueryClient } from '@tanstack/react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { WalletPage } from './pages/WalletPage';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})


function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Router>
        <Routes>
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="*" element={<Navigate to="/wallet" replace />} />
        </Routes>
      </Router>
    </PersistQueryClientProvider>
  );
}

export default App;
