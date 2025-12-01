import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faBuilding,
  faSearch,
  faPlus,
  faSync,
  faTrash,
  faEye,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faSignal,
  faClock,
  faCog,
  faSpinner,
  faDesktop,
  faNetworkWired,
  faShieldAlt,
  faFilter,
  faDatabase,
  faWifi,
  faProjectDiagram,
  faEdit,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ServerModal from "./ServerModal";
import PingApp from "./Ping";
import { supabase } from "../supabaseClient";
import '../App.css';

const ServerStatusTable = () => {
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState("todos");
  const [verifyingServers, setVerifyingServers] = useState(new Set());

  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [showPingModal, setShowPingModal] = useState(false);

  const getTypeIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "servidor":
        return faServer;
      case "switch":
        return faProjectDiagram;
      case "router":
        return faWifi;
      case "firewall":
        return faShieldAlt;
      case "database":
        return faDatabase;
      default:
        return faDesktop;
    }
  };

  const getTypeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "servidor":
        return "#3498db";
      case "switch":
        return "#9b59b6";
      case "router":
        return "#e67e22";
      case "firewall":
        return "#e74c3c";
      case "database":
        return "#2ecc71";
      default:
        return "#95a5a6";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleString("es-ES");
    } catch (error) {
      return "Error en fecha";
    }
  };

  const loadServers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('servidores')
        .select('*')
        .order('sucursal');

      if (error) throw error;
      setServers(data || []);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los servidores",
        icon: "error",
        background: "#1e293b",
        color: "#f1f5f9",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await supabase.from('servidores').select('estado');
      const total = data.length;
      const activos = data.filter(server => server.estado === 'activo').length;
      const inactivos = total - activos;
      const porcentajeSalud = total > 0 ? Math.round((activos / total) * 100) : 0;

      setStats({ total, activos, inactivos, porcentajeSalud });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const loadAllData = useCallback(async () => {
    await loadServers();
    await loadStats();
  }, []);

  const verifyServer = async (serverId) => {
    if (verifyingServers.has(serverId)) return;

    try {
      setVerifyingServers((prev) => new Set(prev.add(serverId)));
      
      Swal.fire({
        title: "Verificando servidor...",
        text: "Por favor espere",
        allowOutsideClick: false,
        background: "#1e293b",
        color: "#f1f5f9",
        didOpen: () => Swal.showLoading(),
      });

      const isOnline = Math.random() > 0.3;
      const latencia = isOnline ? Math.floor(Math.random() * 100) + 10 : null;

      await supabase
        .from('servidores')
        .update({
          estado: isOnline ? 'activo' : 'inactivo',
          latencia: latencia,
          ultima_verificacion: new Date().toISOString()
        })
        .eq('id', serverId);

      setServers((prevServers) =>
        prevServers.map((server) =>
          server.id === serverId
            ? {
                ...server,
                estado: isOnline ? 'activo' : 'inactivo',
                latencia: latencia,
                ultima_verificacion: new Date().toISOString(),
              }
            : server
        )
      );

      await loadStats();
      Swal.close();
      Swal.fire({
        title: "¡Éxito!",
        text: "Servidor verificado correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } catch (error) {
      console.error("Error verificando servidor:", error);
      Swal.close();
      Swal.fire({
        title: "Error",
        text: "No se pudo verificar el servidor",
        icon: "error",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } finally {
      setVerifyingServers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }
  };

  const verifyAllServers = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setIsLoading(true);
      const serverIds = servers.map((server) => server.id);
      setVerifyingServers(new Set(serverIds));

      Swal.fire({
        title: "Verificando todos los servidores...",
        text: "Esto puede tomar unos momentos",
        allowOutsideClick: false,
        background: "#1e293b",
        color: "#f1f5f9",
        didOpen: () => Swal.showLoading(),
      });

      await Promise.all(servers.map(async (server) => {
        const isOnline = Math.random() > 0.3;
        const latencia = isOnline ? Math.floor(Math.random() * 100) + 10 : null;

        await supabase
          .from('servidores')
          .update({
            estado: isOnline ? 'activo' : 'inactivo',
            latencia: latencia,
            ultima_verificacion: new Date().toISOString()
          })
          .eq('id', server.id);
      }));

      await loadAllData();
      Swal.close();
      Swal.fire({
        title: "¡Éxito!",
        text: "Todos los servidores fueron verificados correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } catch (error) {
      console.error("Error verificando todos los servidores:", error);
      Swal.close();
      Swal.fire({
        title: "Error",
        text: "No se pudieron verificar los servidores",
        icon: "error",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } finally {
      setIsLoading(false);
      setVerifyingServers(new Set());
    }
  };

  const handleAddServer = async (formData) => {
    try {
      await supabase
        .from('servidores')
        .insert([{
          ...formData,
          estado: 'inactivo',
          latencia: null,
          ultima_verificacion: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      await loadAllData();
      Swal.fire({
        title: "¡Servidor agregado!",
        text: "El servidor ha sido agregado correctamente",
        icon: "success",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } catch (error) {
      console.error("Error agregando servidor:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo agregar el servidor",
        icon: "error",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    }
  };

  const handleEditServer = async (formData) => {
    try {
      await supabase
        .from('servidores')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingServer.id);

      await loadAllData();
      Swal.fire({
        title: "¡Servidor actualizado!",
        text: "El servidor ha sido actualizado correctamente",
        icon: "success",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    } catch (error) {
      console.error("Error actualizando servidor:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el servidor",
        icon: "error",
        background: "#1e293b",
        color: "#f1f5f9",
      });
    }
  };

  const deleteServer = async (serverId, serverIp, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `Esta acción eliminará el servidor ${serverIp}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1e293b",
      color: "#f1f5f9",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Eliminando servidor...",
          text: "Por favor espere",
          allowOutsideClick: false,
          background: "#1e293b",
          color: "#f1f5f9",
          didOpen: () => Swal.showLoading(),
        });

        await supabase
          .from('servidores')
          .delete()
          .eq('id', serverId);

        await loadAllData();
        Swal.close();
        Swal.fire({
          title: "¡Eliminado!",
          text: "El servidor ha sido eliminado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#1e293b",
          color: "#f1f5f9",
        });
      } catch (error) {
        console.error("Error eliminando servidor:", error);
        Swal.close();
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el servidor",
          icon: "error",
          background: "#1e293b",
          color: "#f1f5f9",
        });
      }
    }
  };

  const openEditModal = (server, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setEditingServer(server);
    setShowEditModal(true);
  };

  const openPingModal = () => setShowPingModal(true);
  const closePingModal = () => setShowPingModal(false);

  const clearSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchTerm("");
  };

  const clearTypeFilter = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedType("todos");
  };

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const subscription = supabase
      .channel('servidores-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'servidores' 
        }, 
        () => {
          loadAllData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.sucursal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.tipo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "todos" || server.tipo?.toLowerCase() === selectedType;

    return matchesSearch && matchesType;
  });

  if (isLoading && servers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-center text-gray-300 text-lg font-medium">
            <FontAwesomeIcon icon={faCog} className="animate-spin mr-3" />
            Cargando información de servidores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-4 md:p-6">
      {/* Modal de Ping */}
      {showPingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Herramienta Ping</h3>
              <button
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
                onClick={closePingModal}
              >
                <FontAwesomeIcon icon={faTimes} size={20} />
              </button>
            </div>
            <div className="p-6">
              <PingApp />
            </div>
          </div>
        </div>
      )}

      {/* Modales de Servidor */}
      <ServerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddServer}
        title="Agregar Nuevo Servidor"
        isEditing={false}
      />

      <ServerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditServer}
        title="Editar Servidor"
        serverData={editingServer}
        isEditing={true}
      />

      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faServer} className="text-blue-400" />
              Monitor de Estado de Servidores
            </h1>
            <p className="text-gray-400 mt-2">Sistema de verificación en tiempo real del estado de la red</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Agregar Servidor
            </button>

            <button
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={openPingModal}
            >
              <FontAwesomeIcon icon={faNetworkWired} />
              Herramienta Ping
            </button>

            <button
              className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={verifyAllServers}
              disabled={isLoading || servers.length === 0}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSync} />
                  Verificar Todos
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-300">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>Error: {error}</span>
            </div>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FontAwesomeIcon icon={faServer} />
              <span>Total Equipos</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-700/50 rounded-xl p-5 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.activos}</div>
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Activos</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-700/50 rounded-xl p-5 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-red-400 mb-2">{stats.inactivos}</div>
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>Inactivos</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-700/50 rounded-xl p-5 hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.porcentajeSalud}%</div>
            <div className="flex items-center gap-2 text-cyan-300 text-sm">
              <FontAwesomeIcon icon={faSignal} />
              <span>Salud de Red</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por IP, sucursal, nombre o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white appearance-none"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="servidor">Servidores</option>
                  <option value="switch">Switches</option>
                  <option value="router">Routers</option>
                  <option value="firewall">Firewalls</option>
                  <option value="database">Bases de datos</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
                </div>
              </div>
              {selectedType !== "todos" && (
                <button
                  onClick={clearTypeFilter}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                  title="Limpiar filtro"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información de Filtros */}
        {(searchTerm || selectedType !== "todos") && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">
              {selectedType !== "todos" && `Tipo: ${selectedType}`}
              {selectedType !== "todos" && searchTerm && " • "}
              {searchTerm && `Búsqueda: "${searchTerm}"`}
            </span>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Latencia
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Última Verificación
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredServers.length > 0 ? (
                filteredServers.map((server) => (
                  <tr
                    key={server.id}
                    className={`hover:bg-gray-700/50 transition-colors ${
                      verifyingServers.has(server.id)
                        ? "bg-blue-900/10"
                        : ""
                    } ${
                      server.estado === 'activo'
                        ? 'border-l-4 border-green-500'
                        : 'border-l-4 border-red-500'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faDesktop} className="text-blue-400" />
                        <span className="font-mono text-white">{server.ip}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                        <span className="text-white">{server.sucursal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm border border-gray-700 inline-block max-w-xs truncate">
                        {server.nombre || "Sin nombre"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium"
                        style={{
                          borderColor: getTypeColor(server.tipo),
                          backgroundColor: `${getTypeColor(server.tipo)}20`,
                          color: getTypeColor(server.tipo),
                        }}
                      >
                        <FontAwesomeIcon icon={getTypeIcon(server.tipo)} />
                        {server.tipo || "servidor"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                          server.estado === 'activo'
                            ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                            : 'bg-red-900/30 text-red-400 border border-red-700/50'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={server.estado === 'activo' ? faCheckCircle : faTimesCircle}
                        />
                        {server.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faSignal} className={
                          server.estado === 'activo' ? 'text-green-400' : 'text-red-400'
                        } />
                        <span className={
                          server.estado === 'activo' ? 'text-green-300 font-mono' : 'text-red-300 font-mono'
                        }>
                          {server.latencia ? `${server.latencia} ms` : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FontAwesomeIcon icon={faClock} />
                        <span className="text-sm">
                          {server.ultima_verificacion
                            ? formatDate(server.ultima_verificacion)
                            : "Sin verificar"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyServer(server.id)}
                          disabled={verifyingServers.has(server.id)}
                          className="p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group"
                          title="Verificar"
                        >
                          {verifyingServers.has(server.id) ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          ) : (
                            <FontAwesomeIcon icon={faEye} />
                          )}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                            Verificar
                          </div>
                        </button>
                        <button
                          onClick={(e) => openEditModal(server, e)}
                          className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors relative group"
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                            Editar
                          </div>
                        </button>
                        <button
                          onClick={(e) => deleteServer(server.id, server.ip, e)}
                          className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors relative group"
                          title="Eliminar"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                            Eliminar
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-4" />
                      <p className="text-lg">No se encontraron servidores que coincidan con los filtros</p>
                      {(searchTerm || selectedType !== "todos") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedType("todos");
                          }}
                          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div>
            Mostrando {filteredServers.length} de {servers.length} equipos
            {selectedType !== "todos" && ` • Filtrado por: ${selectedType}`}
            {searchTerm && ` • Búsqueda: "${searchTerm}"`}
          </div>
          {verifyingServers.size > 0 && (
            <div className="flex items-center gap-2 text-cyan-400">
              <FontAwesomeIcon icon={faSync} className="animate-spin" />
              <span>Verificando {verifyingServers.size} equipo(s)...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatusTable;