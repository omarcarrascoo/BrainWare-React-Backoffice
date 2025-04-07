'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaInfoCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const Panel = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/user');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get unique company codes
  const companyOptions = Array.from(new Set(users.map(user => user.companyCode)));

  // Filter users by name and company code
  const filteredUsers = users.filter(user => {
    const matchesName = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === "" || user.companyCode === selectedCompany;
    return matchesName && matchesCompany;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:9090/api/user/${id}`, {
        headers: {
          token: `Bearer ${user?.accessToken}`
        }
      });
      setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold">
          Usuarios <span className="text-green-500">{filteredUsers.length}</span>
        </h1>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAYddVQcp6UqMkho642Hos0P6N08MgyQhkMmzQkej07I_y-qolKa4GS6VwAGgk89GCyh4&usqp=CAU"
          alt="Brainware Logo"
          className="h-20"
        />
      </header>

      <p className="text-gray-500 mb-4">
        <FaInfoCircle className="inline text-green-500 mr-2" /> Aquí pueden checar la información de todos los usuarios
      </p>

      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Ej. Omar Carrasco"
          className="p-2 border border-gray-300 rounded-l-lg w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-r-lg bg-white"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Todos los equipos</option>
          {companyOptions.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500">
            <th>Integrantes</th>
            <th>Comportamientos hoy</th>
            <th>Status</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr
              key={user._id || index}
              className="border-t cursor-pointer"
              onClick={() => router.push(`/user/${user.username}`)}
            >
              <td className="py-4 flex items-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/10337/10337609.png"
                  alt={user.username}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-green-500 text-sm">{user.isAdmin ? 'Admin' : 'User'}</p>
                  <p className="text-gray-400 text-xs"># equipo: {user.companyCode}</p>
                </div>
              </td>
              <td className="text-green-500">N/A</td>
              <td className="text-green-500">Activo</td>
              <td onClick={(e) => e.stopPropagation()}>
                <FaTrash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDelete(user._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-8 text-gray-500">
        <FaInfoCircle className="inline text-green-500 mr-2" /> Si llega a tener algún problema con su licencia, contacte a soporte@brainware.com
      </footer>
    </div>
  );
};

export default Panel;
