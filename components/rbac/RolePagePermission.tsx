
import React from 'react';

const RolePagePermission = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Role Page Permissions</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <div>
            <label className="mr-2">Role:</label>
            <select className="p-2 border border-gray-300 rounded">
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
          <input type="text" placeholder="Search Page" className="p-2 border border-gray-300 rounded" />
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border-b">Page Name</th>
              <th className="p-2 border-b">URL</th>
              <th className="p-2 border-b">View</th>
              <th className="p-2 border-b">Add</th>
              <th className="p-2 border-b">Edit</th>
              <th className="p-2 border-b">Delete</th>
              <th className="p-2 border-b">Approve</th>
              <th className="p-2 border-b">Export</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">User List</td>
              <td className="p-2 border-b">/users</td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
            </tr>
            <tr>
              <td className="p-2 border-b">Role List</td>
              <td className="p-2 border-b">/roles</td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
              <td className="p-2 border-b text-center"><input type="checkbox" /></td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save Permissions</button>
        </div>
      </div>
    </div>
  );
};

export default RolePagePermission;
