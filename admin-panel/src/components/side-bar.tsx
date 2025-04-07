"use client"
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaUsers, FaFileAlt, FaPowerOff } from 'react-icons/fa';

const Sidebar = () => {

  const router = useRouter();
  return (
    <div className="w-64 h-screen bg-[#2C3E50] text-white flex flex-col">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAYddVQcp6UqMkho642Hos0P6N08MgyQhkMmzQkej07I_y-qolKa4GS6VwAGgk89GCyh4&usqp=CAU" // Replace with actual path
          alt="Monica Carrasco"
          className="w-20 h-20 rounded-full object-cover"
        />
        <h3 className="mt-4 text-lg">Monica Carrasco</h3>
        <span className="text-sm text-green-400">Administrador</span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1">
        <ul>
          <li onClick={() => router.push("/panel")} className="p-4 flex items-center hover:bg-[#34495E] cursor-pointer">
            <FaUsers className="mr-4" /> Usuarios
          </li>
          <li onClick={()=> router.push("/licencias")} className="p-4 flex items-center hover:bg-[#34495E] cursor-pointer">
            <FaFileAlt className="mr-4" /> Licencias
          </li>
          <li className="p-4 flex items-center hover:bg-[#34495E] cursor-pointer">
            <FaPowerOff className="mr-4" /> Cerrar Sesión
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
