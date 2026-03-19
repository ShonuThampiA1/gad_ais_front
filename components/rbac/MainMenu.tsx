
import React from 'react';

const MainMenu = () => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>
      <ul>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">RBAC Dashboard</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Menus Management</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Pages Management</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Actions Management</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Role Menu Mapping</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Role Page Permissions</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">User Menu Override</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">User Page Permission Override</a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">Resources Management</a>
        </li>
      </ul>
    </div>
  );
};

export default MainMenu;
