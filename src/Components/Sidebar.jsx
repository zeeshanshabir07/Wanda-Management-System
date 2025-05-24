import React from 'react';
import { FaSignOutAlt, FaPrint, FaListAlt } from 'react-icons/fa';

const Sidebar = ({ setActiveSection }) => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white p-6 shadow-lg rounded-r-3xl">
      <h2 className="text-3xl font-bold text-center mb-10 tracking-wide border-b border-white pb-4">
        Wanda Management
      </h2>

      <ul className="space-y-4">
        <li
          className="flex items-center gap-3 cursor-pointer bg-white/10 hover:bg-white/20 transition-all duration-200 px-4 py-3 rounded-xl"
          onClick={() => setActiveSection('wandajatManagement')}
        >
          <FaListAlt className="text-xl text-white" />
          <span className="text-md font-medium">Wandajat Management</span>
        </li>

        <li
          className="flex items-center gap-3 cursor-pointer bg-white/10 hover:bg-white/20 transition-all duration-200 px-4 py-3 rounded-xl"
          onClick={() => setActiveSection('printWandajat')}
        >
          <FaPrint className="text-xl text-white" />
          <span className="text-md font-medium">Print Wandajat</span>
        </li>

        <li
          className="flex items-center gap-3 cursor-pointer bg-white/10 hover:bg-red-500/60 transition-all duration-200 px-4 py-3 rounded-xl"
          onClick={() => setActiveSection('signOut')}
        >
          <FaSignOutAlt className="text-xl text-white" />
          <span className="text-md font-medium">Sign Out</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
