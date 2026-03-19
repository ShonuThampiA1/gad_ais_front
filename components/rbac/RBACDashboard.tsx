
import React from 'react';

const RBACDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">RBAC Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Total Roles</h3>
          <p className="text-2xl">10</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Total Menus</h3>
          <p className="text-2xl">25</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Total Pages</h3>
          <p className="text-2xl">50</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Total Actions</h3>
          <p className="text-2xl">15</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Total Users with Overrides</h3>
          <p className="text-2xl">5</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Recent Menu Additions</h3>
          <ul>
            <li>Menu 1</li>
            <li>Menu 2</li>
            <li>Menu 3</li>
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold">Recent Permission Changes</h3>
          <ul>
            <li>Permission 1</li>
            <li>Permission 2</li>
            <li>Permission 3</li>
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold">Quick Links</h3>
        <div className="flex space-x-4 mt-2">
          <a href="#" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Menu</a>
          <a href="#" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Page</a>
          <a href="#" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Configure Role Permissions</a>
          <a href="#" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Configure User Overrides</a>
        </div>
      </div>
    </div>
  );
};

export default RBACDashboard;
