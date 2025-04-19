// pages/preguntas.tsx
"use client"
import React, { useEffect, useState } from 'react';

interface Survey {
  id: string;
  ruleId: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  status: string;
}

const Preguntas: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    // Llama al endpoint que devuelve las bitácoras de hoy.
    // Ajusta la ruta según la configuración de tus endpoints.
    fetch('http://administracionalpha.com/api/questions')
      .then((response) => response.json())
      .then((data) => setSurveys(data))
      .catch((error) => console.error('Error al obtener las encuestas:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
            alt="Perfil Admin"
            className="w-12 h-12 rounded-full"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Respuestas de la Encuesta
          </h1>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mt-8 max-w-4xl mx-auto px-6">
        {surveys.length > 0 ? (
          surveys.map((survey) => (
            <div key={survey.id} className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Encuesta: {survey.ruleId}
                </h2>
                <p className="text-sm text-gray-500">Estado: {survey.status}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium">
                    CREEDAS QUE EMERGIERON EN EL EVENTO QUE TE LIMITÓ EL USO DEL MÉTODO:
                  </p>
                  <p className="text-gray-800">{survey.q1}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    EMOCIÓN PRIMARIA SENTIDA:
                  </p>
                  <p className="text-gray-800">{survey.q2}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    HISTORIAS QUE TE CONTASTE (PERCEPCIÓN):
                  </p>
                  <p className="text-gray-800">{survey.q3}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">
                    DESCRIPCIÓN DE LOS HECHOS DE LA SITUACIÓN:
                  </p>
                  <p className="text-gray-800">{survey.q4}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay encuestas para mostrar hoy.</p>
        )}
      </main>
    </div>
  );
};

export default Preguntas;
