
import React from 'react';

const ResourcesManagement = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Resources Management</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold">Resources</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Resource</button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border-b">Resource ID</th>
              <th className="p-2 border-b">Resource Key</th>
              <th className="p-2 border-b">Category</th>
              <th className="p-2 border-b">Action</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">1</td>
              <td className="p-2 border-b">user.create</td>
              <td className="p-2 border-b">USER</td>
              <td className="p-2 border-b">CREATE</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">2</td>
              <td className="p-2 border-b">application.view</td>
              <td className="p-2 border-b">APPLICATION</td>
              <td className="p-2 border-b">VIEW</td>
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

export default ResourcesManagement;
