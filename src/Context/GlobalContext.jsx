// GlobalContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loggedinUser, setLoggedInUser] = useState(null);

  return (
    <UserContext.Provider value={{ loggedinUser, setLoggedInUser }}>
      {children}
    </UserContext.Provider>
  );
};
