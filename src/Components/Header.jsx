import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Wanda Management System</h1>
      <div className="text-sm">
        <span>Welcome, User</span>
      </div>
    </header>
  );
};

export default Header;
