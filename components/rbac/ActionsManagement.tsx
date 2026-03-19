
import React from 'react';

const ActionsManagement = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Actions Management</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-bold">Actions</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Action</button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 border-b">Action ID</th>
              <th className="p-2 border-b">Action Name</th>
              <th className="p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">1</td>
              <td className="p-2 border-b">View</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">2</td>
              <td className="p-2 border-b">Add</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">3</td>
              <td className="p-2 border-b">Edit</td>
              <td className="p-2 border-b">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">4</td>
              <td className="p-2 border-b">Delete</td>
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

export default ActionsManagement;
