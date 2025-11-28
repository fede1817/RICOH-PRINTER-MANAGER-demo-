import React, { useState } from 'react';
import { IoIosLock, IoIosMail, IoIosLogIn } from "react-icons/io";
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAdminLogin = () => {
    // Simular datos de usuario admin
    const adminUser = {
      usuario: 'admin',
      nombrepersona: 'Administrador',
      rol: { nombrerol: 'ADMINISTRADOR' }
    };

    // Guardar datos del usuario en localStorage
    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('tablaActiva', 'impresoras');

    Swal.fire({
      icon: 'success',
      title: `¡Bienvenido Administrador!`,
      text: 'Acceso completo como Administrador',
      background: "#2c2c2c",
      color: "#fff",
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Continuar'
    }).then(() => {
      onLogin(adminUser, true, 'impresoras');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔥 NUEVO: Verificar si son credenciales de admin
    if (credentials.email === 'admin' && credentials.password === 'admin') {
      handleAdminLogin();
      return;
    }

    if (!credentials.email || !credentials.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor ingresa tu correo y contraseña',
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setLoading(true);

    try {
      // Codificar credenciales en Base64 para Basic Auth
      const credentialsBase64 = btoa(`${credentials.email}:${credentials.password}`);
      
      // Llamar a la API de autenticación con Basic Auth
      const response = await fetch('https://apps.mobile.com.py:8443/mbusiness/rest/private/usuarios?codempresa=15', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentialsBase64}`
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        
        // La API devuelve un array de usuarios, buscar el que coincide con el email
        const userData = Array.isArray(usersData) 
          ? usersData.find(user => user.usuario === credentials.email)
          : usersData;

        if (!userData) {
          throw new Error('Usuario no encontrado');
        }

        // Verificar si el usuario es administrador
        const isAdmin = userData.rol?.nombrerol === 'ADMINISTRADOR';
        
        // 🔥 DETECTAR SI HAY PARÁMETROS DE CENSO EN LA URL
        const urlParams = new URLSearchParams(window.location.search);
        const censoParam = urlParams.get('censo');
        const sectionParam = urlParams.get('section');
        
        // 🔥 SI HAY PARÁMETROS DE CENSO, FORZAR LA SECCIÓN DE CENSOS
        let seccionInicial = isAdmin ? "impresoras" : "pedidos";
        if (censoParam || sectionParam === 'censos') {
          seccionInicial = "censos";
        }
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', isAdmin.toString());
        localStorage.setItem('authCredentials', credentialsBase64);
        localStorage.setItem('tablaActiva', seccionInicial); // 🔥 Guardar sección inicial
        
        await Swal.fire({
          icon: 'success',
          title: `¡Bienvenido ${userData.nombrepersona}!`,
          text: isAdmin ? 'Acceso completo como Administrador' : 'Acceso limitado a pedidos',
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Continuar'
        });

        // 🔥 PASAR LA SECCIÓN INICIAL AL onLogin
        onLogin(userData, isAdmin, seccionInicial);
      } else if (response.status === 401) {
        throw new Error('Credenciales incorrectas');
      } else {
        throw new Error('Error del servidor');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: error.message === 'Credenciales incorrectas' 
          ? 'Correo o contraseña incorrectos' 
          : error.message === 'Usuario no encontrado'
          ? 'Usuario no encontrado en el sistema'
          : 'Error al conectar con el servidor',
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Intentar nuevamente'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <IoIosLock className="text-2xl text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">PrinterManager</h1>
          <p className="text-gray-400">Inicia sesión con tus credenciales de Mbusiness</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoIosMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@surcomercial.com.py"
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoIosLock className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors duration-200 ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <IoIosLogIn className="text-lg" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Botón de acceso rápido Admin */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleAdminLogin}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            <IoIosLogIn className="text-lg" />
            <span>Acceso Rápido: Admin</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Usar para demo: admin / admin
          </p>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Solo personal autorizado de SUR COMERCIAL
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;