"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const ChallengeLog = () => {
  const router = useRouter();
  // Extract the slug from the URL query parameters (e.g., /admin/[slug])
  const { slug } = useParams();

  // State to hold the challenge data, behaviors for the selected day, current date, and loading state
  const [challenge, setChallenge] = useState(null);
  const [behaviors, setBehaviors] = useState([]);
  const [currentDate, setCurrentDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);

  // Fetch the challenge details (including progress and rules) using the slug
  useEffect(() => {
    if (slug) {
      axios
        .get(`http://localhost:9090/api/challenges/${slug}`)
        .then((response) => {
          setChallenge(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching challenge:", err);
          setLoading(false);
        });
    }
  }, [slug]);

  // Update the behaviors for the currently selected date.
  useEffect(() => {
    if (challenge && challenge.rules) {
      const progressForDate = challenge.progress?.find(
        (p) => p.date.slice(0, 10) === currentDate
      );
      const behaviorsForDate = challenge.rules.map((rule) => {
        const completedRule = progressForDate?.completedRules.find(
          (cr) => cr.rule._id === rule._id
        );
        return {
          ...rule,
          value: rule.points + "%", // assuming each rule has a "points" property
          status: completedRule ? completedRule.status : "FALLO",
          color: completedRule
            ? completedRule.status === "HECHO"
              ? "bg-green-500"
              : "bg-red-500"
            : "bg-gray-800",
        };
      });
      setBehaviors(behaviorsForDate);
    }
  }, [challenge, currentDate]);

  // Function to change the current date (for navigation)
  const handleDateChange = (direction) => {
    const dateObj = new Date(currentDate);
    dateObj.setDate(dateObj.getDate() + direction);
    const newDate = dateObj.toISOString().slice(0, 10);

    // Optionally, check if newDate falls within challenge start/end dates
    if (challenge) {
      const startDate = new Date(challenge.startDate).toISOString().slice(0, 10);
      const endDate = new Date(challenge.endDate).toISOString().slice(0, 10);
      if (newDate < startDate || newDate > endDate) return;
    }

    setCurrentDate(newDate);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!challenge) {
    return <div>No challenge found</div>;
  }

  // Calculate day index for display (e.g., day 1 of total days in the challenge)
  const totalDays = challenge.progress?.length || 1;
  const dayIndex =
    challenge.progress?.findIndex(
      (p) => p.date.slice(0, 10) === currentDate
    ) + 1 || 1;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Back Button */}
      <div
        className="flex items-center text-green-600 cursor-pointer"
        onClick={() => router.back()}
      >
        <span className="text-xl">←</span>
        <span className="ml-2 text-lg font-semibold">Volver</span>
      </div>

      {/* Header */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Desafío:</h2>
          <p className="text-gray-600">{challenge.title}</p>
          <p className="text-gray-500 flex items-center">
            📅 {new Date(challenge.startDate).toLocaleDateString()} |{" "}
            {new Date(challenge.endDate).toLocaleDateString()}
          </p>
        </div>
        <Image
          src={
            challenge.logoUrl ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAYddVQcp6UqMkho642Hos0P6N08MgyQhkMmzQkej07I_y-qolKa4GS6VwAGgk89GCyh4&usqp=CAU"
          }
          alt="Logo"
          width={120}
          height={40}
        />
      </div>

      {/* Log Date & Progress with Navigation */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-700">
            <button
              onClick={() => handleDateChange(-1)}
              className="text-green-600 text-xl"
            >
              ←
            </button>
            <span className="ml-2 text-lg font-semibold">
              {new Date(currentDate).toLocaleDateString()}
            </span>
            <button
              onClick={() => handleDateChange(1)}
              className="text-green-600 text-xl ml-2"
            >
              →
            </button>
          </div>
          <span className="text-green-600 text-2xl font-bold">
            {dayIndex}/{totalDays}
          </span>
        </div>
      </div>

      {/* Table of Behaviors */}
      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Comportamiento</th>
            <th className="p-3">Valor %</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {behaviors.map((row, index) => (
            <tr key={index} className="border-t border-gray-200">
              <td className="p-8 ">{row.description}</td>
              <td className="p-3 text-center">{row.value}</td>
              <td
                className={`p-3 max-h-3 text-white text-center font-semibold rounded-md w-24 ${row.color}`}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Link to Bitácora view if needed */}
      <div className="mt-6 flex justify-end gap-3.5">
        <Link href="/user/desafio/estadisticas/[slug]" as={`/user/desafio/estadisticas/${slug}`}>
          <button className="bg-none border-2 border-green-600 hover:bg-green-500 text-green-600 font-bold py-2 px-4 rounded hover:text-white">
            Estadisticas 
          </button>
        </Link>
        <Link href="bitacora">
          <button className="bg-green-600 border-2 border-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">
            Bitácora de Día
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ChallengeLog;
