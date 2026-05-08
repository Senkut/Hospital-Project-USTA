import React from 'react';
import { useState } from 'react';
import { Lock, User, Building2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (documento: string, password: string, role: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'director', label: '👨‍⚕️ Director', color: 'from-purple-500 to-purple-600' },
    { value: 'administrador', label: '💼 Administrador', color: 'from-blue-500 to-blue-600' },
    { value: 'medico', label: '🩺 Personal de la Salud', color: 'from-teal-500 to-teal-600' },
    { value: 'docente', label: '👨‍🏫 Docente', color: 'from-cyan-500 to-cyan-600' },
    { value: 'estudiante', label: '🎓 Estudiante', color: 'from-green-500 to-emerald-600' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Por favor selecciona un tipo de usuario');
      return;
    }

    if (!documento) {
      setError('Por favor ingresa tu número de documento');
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    onLogin(documento, password, role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/50">
          {/* Logo Area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
              {/* Aquí puedes colocar tu logo */}
              <Building2 className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
              Hospital Universitario San Rafael
            </h1>
            <p className="text-gray-600 font-medium">Sistema de Gestión Hospitalaria</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3" style={{fontFamily: 'Poppins, sans-serif'}}>
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                      role === r.value
                        ? `bg-gradient-to-r ${r.color} text-white border-transparent shadow-lg scale-105`
                        : 'bg-white border-gray-200 text-gray-700 hover:border-cyan-300 hover:shadow-md'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Ingresa tu número de identificación
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-cyan-500" />
                </div>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ingresa tu cédula"
                  maxLength={12}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all outline-none font-medium bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-cyan-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all outline-none font-medium bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 transform hover:-translate-y-1"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

        {/* Version Info */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm font-medium">
            Sistema v1.0 - Hospital Universitario San Rafael © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
