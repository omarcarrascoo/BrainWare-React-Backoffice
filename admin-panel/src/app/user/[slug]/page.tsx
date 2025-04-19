"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Interfaces de datos
interface User {
  _id: string;
  username: string;
  profileImg?: string;
  companyCode?: string;
}

interface CompletedRule {
  status: string;
}

interface ProgressEntry {
  date: string;
  completedRules: CompletedRule[];
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  image?: string;
  progress?: ProgressEntry[];
  rules?: unknown[]; // puedes reemplazar unknown por una interfaz más específica si la conoces
}

const AdminUserDashboard: React.FC = () => {
  // Extraer y normalizar el slug
  const params = useParams() as { slug?: string | string[] };
  const rawSlug = params.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : undefined;

  const router = useRouter();

  // Estado con tipos adecuados
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndChallenges = async (): Promise<void> => {
      try {
        // Petición tipada para User
        const userResponse = await axios.get<User>(`http://134.199.238.36:9090/api/user/findByUsername/${slug}`);
        const userData = userResponse.data;
        setUser(userData);

        // Petición tipada para Challenge[]
        const challengesResponse = await axios.get<Challenge[]>(
          `http://134.199.238.36:9090/api/challenges/userChallenge?userId=${userData._id}`
        );
        setChallenges(challengesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchUserAndChallenges();
    } else {
      setLoading(false);
      setError('Invalid slug');
    }
  }, [slug]);

  // Calcula el progreso diario general
  const calculateDailyProgress = (): string => {
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = challenges.reduce((sum, ch) => {
      const entries = ch.progress ?? [];
      const todayEntries = entries.filter(e => e.date.slice(0, 10) === today);
      const count = todayEntries.reduce((acc, e) => {
        return acc + e.completedRules.filter(r => r.status === 'HECHO' || r.status === 'NA').length;
      }, 0);
      return sum + count;
    }, 0);

    const totalRules = challenges.reduce((sum, ch) => sum + (ch.rules?.length ?? 0), 0);
    return `${completedToday} / ${totalRules}`;
  };

  // Calcula el progreso de un desafío individual
  const calculateChallengeProgress = (challenge: Challenge): string => {
    const today = new Date().toISOString().slice(0, 10);
    const entries = challenge.progress ?? [];
    const todayEntries = entries.filter(e => e.date.slice(0, 10) === today);
    const count = todayEntries.reduce((acc, e) => {
      return acc + e.completedRules.filter(r => r.status === 'HECHO' || r.status === 'NA').length;
    }, 0);
    const total = challenge.rules?.length ?? 0;
    return `${count} / ${total}`;
  };

  // Renderizado condicional
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Usuario no encontrado</div>;
  }

  // UI final
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-4">
          <Image
            src={user.profileImg ?? 'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg'}
            alt="Foto de perfil"
            layout="fill"
            className="rounded-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
        <p className="text-gray-500">
          {user.companyCode ? `Equipo: ${user.companyCode}` : 'Sin equipo asignado'}
        </p>
      </div>

      {/* Progreso diario */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">COMPORTAMIENTOS DE DÍA</h2>
        <p className="text-gray-600 mt-2">
          Estos son los comportamientos diarios que ha cumplido hoy en todos sus desafíos.
        </p>
        <p className="text-green-600 font-bold text-xl mt-4">{calculateDailyProgress()}</p>
      </div>

      {/* Desafíos */}
      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Desafíos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {challenges.map(challenge => (
            <div
              key={challenge._id}
              className="bg-gray-50 shadow-md rounded-lg p-4 cursor-pointer"
              onClick={() => router.push(`/user/desafio/${challenge._id}`)}
            >
              <div className="relative w-full h-32 mb-4">
                <Image
                  src={challenge.image ?? 'https://via.placeholder.com/300x200'}
                  alt="Imagen del desafío"
                  layout="fill"
                  className="rounded-lg object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
              <p className="text-sm text-gray-600">{challenge.description}</p>
              <p className="text-sm text-gray-700 mt-2">Comportamientos</p>
              <p className="text-green-600 font-bold">{calculateChallengeProgress(challenge)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Soporte */}
      <div className="w-full bg-white shadow-md rounded-lg p-4 text-center">
        <p className="text-gray-700">
          <span className="text-green-600">ℹ️</span> Si llega a tener algún problema con su licencia, contacte a{' '}
          <a href="mailto:soporte@brainware.com" className="text-blue-600">
            soporte@brainware.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminUserDashboard;
