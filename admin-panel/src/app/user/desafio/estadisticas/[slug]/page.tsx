"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminStatsPage = () => {
  const { slug } = useParams(); // Get the challenge ID from the slug
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeProgress, setChallengeProgress] = useState(null);
  const [ruleProgress, setRuleProgress] = useState<any>(null);
  const [ruleMapping, setRuleMapping] = useState([]); // Stores the original rule data for mapping
  const [cycleStats, setCycleStats] = useState<any>(null);
  const [selectedCycle, setSelectedCycle] = useState("1"); // Default to cycle 1
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch challenge info
        const challengeRes = await axios.get(
          `http://administracionalpha.com/api/challenges/${slug}`
        );
        setChallenge(challengeRes.data);

        // Fetch challenge progress filtered by cycle
        const progressRes = await axios.get(
          `http://administracionalpha.com/api/analisis/challengeProgress?challengeId=${slug}&ciclo=${selectedCycle}`
        );
        setChallengeProgress(progressRes.data);

        // Fetch rule progress filtered by cycle
        const ruleRes = await axios.get(
          `http://administracionalpha.com/api/analisis/ruleProgress?challengeId=${slug}&ciclo=${selectedCycle}`
        );
        const ruleData = ruleRes.data;
        // Save the original rule data for our mapping table
        setRuleMapping(ruleData);
        // Set the chart labels to numeric indices
        setRuleProgress({
          labels: ruleData.map((_:any, index:any) => `${index + 1}`),
          datasets: [
            {
              label: "Comportamientos",
              data: ruleData.map((item:any) => item.accomplishmentPercentage),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Fetch cycle stats
        const cycleRes = await axios.get(
          `http://administracionalpha.com/api/analisis/cycleStats?challengeId=${slug}`
        );
        const cycleData = cycleRes.data;
        setCycleStats({
          labels: cycleData.map((item:any) => `Ciclo ${item.ciclo}`),
          datasets: [
            {
              label: "Promedio de Desempeño",
              data: cycleData.map((item:any) => item.accomplishmentPercentage),
              fill: false,
              borderColor: "rgba(75, 192, 192, 192)",
              tension: 0.1,
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudo cargar la información del desafío.");
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, selectedCycle]); 

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!challenge) {
    return <div className="p-6 text-red-600">Desafío no encontrado.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">{challenge.title}</h1>
      <p className="text-gray-600 mb-6">
        {new Date(challenge.startDate).toLocaleDateString()} -{" "}
        {new Date(challenge.endDate).toLocaleDateString()}
      </p>

      {/* Cycle Selector */}
      <div className="mb-6">
        <label htmlFor="cycle-select" className="block text-sm font-medium text-gray-700 ">
          Seleccionar Ciclo
        </label>
        <select
          id="cycle-select"
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-1 border-gray-400  focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {challenge.cycles.map((cycle:any) => (
            <option key={cycle.ciclo} value={cycle.ciclo}>
              Ciclo {cycle.ciclo}
            </option>
          ))}
        </select>
      </div>

      {/* Bar Chart: Desempeño por desafío */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Desempeño por Desafío</h2>
        {challengeProgress ? (
          <Bar
            data={challengeProgress}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: "Desempeño por Desafío" },
              },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </div>

      {/* Vertical Bar Chart: Comportamientos */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Comportamientos</h2>
        {ruleProgress?.datasets[0]?.data.length > 0 ? (
          <>
            <Bar
              data={ruleProgress}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: "Comportamientos" },
                },
                scales: {
                  y: { beginAtZero: true, max: 100 },
                },
              }}
            />
            {/* Legend Table for Rule Descriptions */}
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Leyenda de Comportamientos</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ínidce
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ruleMapping.map((item:any, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 py-2 whitespace">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </div>

      {/* Line Chart: Promedio de Desempeño por Ciclo */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Promedio de Desempeño por Ciclo</h2>
        {cycleStats ? (
          <Line
            data={cycleStats}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: "Promedio de Desempeño por Ciclo" },
              },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStatsPage;
