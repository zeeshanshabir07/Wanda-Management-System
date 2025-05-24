// App.jsx
import React, { useContext } from 'react';
import HomePage from './Pages/HomePage';
import Dashboard from './Pages/Dashboard';
import { UserProvider, UserContext } from './Context/GlobalContext';

// Separated inner component to consume context safely within the provider
const AppContent = () => {
  const { loggedinUser } = useContext(UserContext);

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      {loggedinUser ? <Dashboard /> : <HomePage />}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
