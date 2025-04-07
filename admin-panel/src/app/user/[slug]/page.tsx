"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const AdminUserDashboard = () => {
  // Get dynamic slug (username) from the URL
  const { slug } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndChallenges = async () => {
      try {
        // Fetch user data by username using your custom route
        const userResponse = await axios.get(`http://localhost:9090/api/user/findByUsername/${slug}`);
        const userData = userResponse.data;
        console.log(userData);
        setUser(userData);
        
        // Fetch challenges for that user using the /userChallenge endpoint
        const challengesResponse = await axios.get(
          `http://localhost:9090/api/challenges/userChallenge?userId=${userData._id}`
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
    }
  }, [slug]);

  // Calculate overall daily progress across all challenges
  const calculateDailyProgress = () => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const totalCompletedRulesToday = challenges.reduce((total, challenge) => {
      if (!challenge.progress) return total;
      const progressToday = challenge.progress.filter(
        (prog) => prog.date && prog.date.slice(0, 10) === todayDate
      );
      const completedRulesToday = progressToday.reduce((acc, prog) => {
        const validRules = (prog.completedRules || []).filter(
          (rule) => rule.status === 'HECHO' || rule.status === 'NA'
        );
        return acc + validRules.length;
      }, 0);
      return total + completedRulesToday;
    }, 0);

    const totalRulesAllChallenges = challenges.reduce((total, challenge) => {
      return total + (challenge.rules ? challenge.rules.length : 0);
    }, 0);

    return `${totalCompletedRulesToday} / ${totalRulesAllChallenges}`;
  };

  // Calculate individual challenge progress for today
  const calculateChallengeProgress = (challenge) => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const progressToday = (challenge.progress || []).filter(
      (prog) => prog.date && prog.date.slice(0, 10) === todayDate
    );
    const completedRulesToday = progressToday.reduce((acc, prog) => {
      const validRules = (prog.completedRules || []).filter(
        (rule) => rule.status === 'HECHO' || rule.status === 'NA'
      );
      return acc + validRules.length;
    }, 0);
    const totalRules = challenge.rules ? challenge.rules.length : 0;
    return `${completedRulesToday} / ${totalRules}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Usuario no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Section with user information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-4">
          <Image
            src={user.profileImg || 'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg'}
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

      {/* Daily Progress Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">COMPORTAMIENTOS DE DÍA</h2>
        <p className="text-gray-600 mt-2">
          Estos son los comportamientos diarios que ha cumplido hoy en todos sus desafíos.
        </p>
        <p className="text-green-600 font-bold text-xl mt-4">{calculateDailyProgress()}</p>
      </div>

      {/* Challenges Section */}
      <div className="w-full bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Desafíos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {challenges.map((challenge) => (
            <div
              key={challenge._id}
              className="bg-gray-50 shadow-md rounded-lg p-4 cursor-pointer"
              onClick={() => router.push(`/user/desafio/${challenge._id}`)}
            >
              <div className="relative w-full h-32 mb-4">
                <Image
                  src={challenge.image || 'https://via.placeholder.com/300x200'}
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

      {/* Support Section */}
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
