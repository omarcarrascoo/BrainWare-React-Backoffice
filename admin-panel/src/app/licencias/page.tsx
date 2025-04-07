"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

const statusColors:any = {
  Activo: "text-green-500",
  Pendiente: "text-yellow-500",
  Vencida: "text-red-500",
};

export default function Licenses() {
  // Holds the list of organizations (mapped to license structure)
  const [licenses, setLicenses] = useState([]);
  
  // State for new organization/license
  const [newLicense, setNewLicense] = useState({
    company: "",
    email: "",
    team: "",
    issueDate: "",
    expiryDate: "",
    status: "Pendiente", // default status
  });

  // Fetch organizations from the backend on mount
  useEffect(() => {
    axios
      .get("http://localhost:9090/api/company")
      .then((response) => {
        console.log(response.data);
        const mapped = response.data.map((org) => ({
          _id: org._id,
          company: org.name,
          email: org.organizationLeaderEmail,
          team: org.code, // adjust mapping if needed
          issueDate: new Date(org.createdAt).toLocaleDateString(),
          expiryDate: "N/A", // no expiry date in our org model
          status: org.status === "active" ? "Activo" : "Pendiente", // adjust as needed
        }));
        setLicenses(mapped);
      })
      .catch((err) => console.error("Error fetching organizations:", err));
  }, []);

  // Handle input change for the new organization form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLicense((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new organization using the POST endpoint
  const handleAddLicense = async () => {
    if (!newLicense.company || !newLicense.email) {
      alert("Por favor completa al menos el nombre de la empresa y el correo líder.");
      return;
    }
    // Map the license data to your organizations model
    const payload = {
      name: newLicense.company,
      code: newLicense.team,
      organizationLeaderEmail: newLicense.email,
    };

    try {
      const response = await axios.post("http://localhost:9090/api/company/", payload, {
        headers: { "Content-Type": "application/json" },
      });
      const savedOrg = response.data;
      // Create a new license entry from the returned organization
      const newEntry = {
        _id: savedOrg._id,
        company: savedOrg.name,
        email: savedOrg.organizationLeaderEmail,
        team: savedOrg.code,
        issueDate: new Date(savedOrg.createdAt).toLocaleDateString(),
        expiryDate: "N/A",
        status: savedOrg.status === "active" ? "Activo" : "Pendiente",
      };
      setLicenses((prev) => [...prev, newEntry]);
      // Reset the form state
      setNewLicense({
        company: "",
        email: "",
        team: "",
        issueDate: "",
        expiryDate: "",
        status: "Pendiente",
      });
    } catch (err) {
      console.error("Error adding organization:", err);
      alert("Error al agregar la organización.");
    }
  };

  // Delete an organization using the DELETE endpoint
  const handleDeleteLicense = async (id) => {
    try {
      await axios.delete(`http://localhost:9090/api/company/${id}`);
      setLicenses((prev) => prev.filter((license) => license._id !== id));
    } catch (err) {
      console.error("Error deleting organization:", err);
      alert("Error al eliminar la organización.");
    }
  };

  // Totals by status for display in the header
  const totalActive = licenses.filter((l) => l.status === "Activo").length;
  const totalPending = licenses.filter((l) => l.status === "Pendiente").length;
  const totalExpired = licenses.filter((l) => l.status === "Vencida").length;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Main Container */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-gray-800">
          Licencias{" "}
          <span className="mx-2 text-green-600">{totalActive}</span>|
          <span className="mx-2 text-yellow-600">{totalPending}</span>|
          <span className="mx-2 text-red-600">{totalExpired}</span>
        </h2>
        <p className="text-gray-600 mb-4">
          Aquí pueden añadir nuevas corporaciones
        </p>

        {/* Form to add a new organization/license */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              name="company"
              placeholder="Empresa / Representante"
              value={newLicense.company}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full sm:w-auto"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo Líder"
              value={newLicense.email}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full sm:w-auto"
            />
            <input
              type="text"
              name="team"
              placeholder="Equipo"
              value={newLicense.team}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full sm:w-auto"
            />
            <button
              onClick={handleAddLicense}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
            >
              Invitar
            </button>
          </div>
        </div>

        {/* Organizations table */}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2">Empresa / Representante</th>
                <th className="p-2">Correo Líder</th>
                <th className="p-2">Equipo</th>
                <th className="p-2">Expedición</th>
                <th className="p-2">Vencimiento</th>
                <th className="p-2">Status</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <p className="font-medium">{license.company}</p>
                  </td>
                  <td className="p-2">{license.email}</td>
                  <td className="p-2">{license.team}</td>
                  <td className="p-2">{license.issueDate}</td>
                  <td className="p-2">{license.expiryDate}</td>
                  <td className={`p-2 font-semibold ${statusColors[license.status]}`}>
                    {license.status}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteLicense(license._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Support Information */}
      <div className="w-full max-w-5xl mt-6 p-4 bg-white shadow-md rounded-lg text-center">
        <p className="text-gray-700">
          <span className="text-green-600">ℹ️</span> Si llega a tener algún problema con su licencia contacte a{" "}
          <a href="mailto:soporte@brainware.com" className="text-blue-600">
            soporte@brainware.com
          </a>
        </p>
      </div>
    </div>
  );
}
