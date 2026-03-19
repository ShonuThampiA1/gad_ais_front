
import React from 'react';

const UserMenuOverride = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">User Menu Override</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <input type="text" placeholder="Search User" className="p-2 border border-gray-300 rounded" />
          <div>
            <span className="font-bold">Role:</span> Admin
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border-b">Menu</th>
              <th className="p-2 border-b">Access</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">Dashboard</td>
              <td className="p-2 border-b">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Inherited (Allowed)
                </label>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">Administration</td>
              <td className="p-2 border-b">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Inherited (Allowed)
                </label>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">Reports</td>
              <td className="p-2 border-b">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Override (Denied)
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save Overrides</button>
        </div>
      </div>
    </div>
  );
};

export default UserMenuOverride;
