
import React from 'react';

const UserPagePermissionOverride = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">User Page Permission Override</h1>
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
              <th className="p-2 border-b">Page</th>
              <th className="p-2 border-b">View</th>
              <th className="p-2 border-b">Add</th>
              <th className="p-2 border-b">Edit</th>
              <th className="p-2 border-b">Delete</th>
              <th className="p-2 border-b">Approve</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">Beneficiary List</td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
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

export default UserPagePermissionOverride;
