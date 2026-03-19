
import React from 'react';

const MenusManagement = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Menus Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Menu Tree</h3>
          <ul>
            <li>Dashboard</li>
            <li>
              Administration
              <ul className="ml-4">
                <li>User Management</li>
                <li>
                  RBAC
                  <ul className="ml-4">
                    <li>Menus</li>
                    <li>Pages</li>
                    <li>Permissions</li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>Reports</li>
          </ul>
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Menu Details</h3>
          <form>
            <div className="mb-4">
              <label className="block text-gray-700">Menu Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Menu Path</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Parent Menu</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>None</option>
                <option>Administration</option>
                <option>RBAC</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Menu Type</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>MODULE</option>
                <option>MENU</option>
                <option>SUBMENU</option>
                <option>LINK</option>
                <option>BUTTON</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Sort Order</label>
              <input type="number" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenusManagement;
