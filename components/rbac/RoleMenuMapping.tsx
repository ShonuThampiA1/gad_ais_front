
import React from 'react';

const RoleMenuMapping = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Role Menu Mapping</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Role</h3>
          <select className="w-full p-2 border border-gray-300 rounded">
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
        </div>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">Menu Tree</h3>
          <ul>
            <li>
              <input type="checkbox" className="mr-2" />
              Dashboard
            </li>
            <li>
              <input type="checkbox" className="mr-2" />
              Administration
              <ul className="ml-4">
                <li>
                  <input type="checkbox" className="mr-2" />
                  User Management
                </li>
                <li>
                  <input type="checkbox" className="mr-2" />
                  RBAC
                  <ul className="ml-4">
                    <li>
                      <input type="checkbox" className="mr-2" />
                      Menus
                    </li>
                    <li>
                      <input type="checkbox" className="mr-2" />
                      Pages
                    </li>
                    <li>
                      <input type="checkbox" className="mr-2" />
                      Permissions
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <input type="checkbox" className="mr-2" />
              Reports
            </li>
          </ul>
          <div className="flex justify-end mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save Mapping</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleMenuMapping;
