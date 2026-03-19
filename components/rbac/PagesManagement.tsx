
import React from 'react';

const PagesManagement = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Pages Management</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <input type="text" placeholder="Search by name or URL" className="p-2 border border-gray-300 rounded" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Page</button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border-b">Page ID</th>
              <th className="p-2 border-b">Page Name</th>
              <th className="p-2 border-b">Page URL</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">1</td>
              <td className="p-2 border-b">Dashboard</td>
              <td className="p-2 border-b">/dashboard</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">2</td>
              <td className="p-2 border-b">User Management</td>
              <td className="p-2 border-b">/admin/users</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagesManagement;
