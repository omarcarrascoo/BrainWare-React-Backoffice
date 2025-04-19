"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

// Interfaces de datos
interface Rule {
  _id: string;
  description: string;
  points: number;
}

interface CompletedRuleEntry {
  rule: { _id: string };
  status: "HECHO" | "NA" | string;
}

interface ProgressEntry {
  date: string;
  completedRules: CompletedRuleEntry[];
}

interface Challenge {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  logoUrl?: string;
  rules: Rule[];
  progress?: ProgressEntry[];
}

interface BehaviorRow extends Rule {
  value: string;
  status: string;
  color: string;
}

const ChallengeLog: React.FC = () => {
  const router = useRouter();
  const params = useParams() as { slug?: string | string[] };
  const rawSlug = params.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : undefined;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [behaviors, setBehaviors] = useState<BehaviorRow[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch challenge
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    axios
      .get<Challenge>(`https://administracionalpha.com/api/challenges/${encodeURIComponent(slug)}`)
      .then((res) => {
        setChallenge(res.data);
      })
      .catch((err) => {
        console.error("Error fetching challenge:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Compute behaviors for the current date
  useEffect(() => {
    if (!challenge) return;

    const progressForDate = challenge.progress?.find(
      (p) => p.date.slice(0, 10) === currentDate
    );

    const rows: BehaviorRow[] = challenge.rules.map((rule) => {
      const completed = progressForDate?.completedRules.find(
        (cr) => cr.rule._id === rule._id
      );
      const status = completed?.status ?? "FALLO";
      const color =
        status === "HECHO"
          ? "bg-green-500"
          : status === "NA"
          ? "bg-gray-800"
          : "bg-red-500";

      return {
        ...rule,
        value: `${rule.points}%`,
        status,
        color,
      };
    });

    setBehaviors(rows);
  }, [challenge, currentDate]);

  // Navigate dates
  const handleDateChange = (deltaDays: number) => {
    const dateObj = new Date(currentDate);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    const newDate = dateObj.toISOString().slice(0, 10);

    if (challenge) {
      const start = challenge.startDate.slice(0, 10);
      const end = challenge.endDate.slice(0, 10);
      if (newDate < start || newDate > end) return;
    }

    setCurrentDate(newDate);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!challenge) {
    return <div className="min-h-screen flex items-center justify-center">No challenge found</div>;
  }

  const totalDays = challenge.progress?.length ?? 1;
  const dayIndex =
    (challenge.progress?.findIndex((p) => p.date.slice(0, 10) === currentDate) ?? -1) + 1 ||
    1;

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

      {/* Date Navigation */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-700">
            <button onClick={() => handleDateChange(-1)} className="text-green-600 text-xl">
              ←
            </button>
            <span className="ml-2 text-lg font-semibold">
              {new Date(currentDate).toLocaleDateString()}
            </span>
            <button onClick={() => handleDateChange(1)} className="text-green-600 text-xl ml-2">
              →
            </button>
          </div>
          <span className="text-green-600 text-2xl font-bold">
            {dayIndex}/{totalDays}
          </span>
        </div>
      </div>

      {/* Behaviors Table */}
      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Comportamiento</th>
            <th className="p-3 text-center">Valor %</th>
            <th className="p-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {behaviors.map((row) => (
            <tr key={row._id} className="border-t border-gray-200">
              <td className="p-3">{row.description}</td>
              <td className="p-3 text-center">{row.value}</td>
              <td
                className={`p-3 text-white text-center font-semibold rounded-md w-24 ${row.color}`}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Links */}
      <div className="mt-6 flex justify-end gap-3.5">
        <Link
          href={`/user/desafio/estadisticas/${encodeURIComponent(slug ?? "")}`}
        >
          <button className="border-2 border-green-600 hover:bg-green-500 text-green-600 font-bold py-2 px-4 rounded hover:text-white">
            Estadísticas
          </button>
        </Link>
        <Link href={`/user/desafio/bitacora/${encodeURIComponent(slug ?? "")}`}>
          <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">
            Bitácora de Día
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ChallengeLog;
