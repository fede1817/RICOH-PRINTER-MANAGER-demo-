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
} from "@fortawesome/free-solid-svg-icons";
import "./ServerStatusTable.css";
import { createClient } from "@supabase/supabase-js";

// ✅ Configuración de Supabase (usa la misma que en App.js)
const supabaseUrl = "https://yracfsgdejnnpsjzqpin.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYWNmc2dkZWpubnBzanpxcGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDk1MTQsImV4cCI6MjA3Nzk4NTUxNH0.Awd-_7qbY2tHkE8CmWz98uzFwz21e01lhKFi-f-X8qg";
const supabase = createClient(supabaseUrl, supabaseKey);

const ServerStatusTable = () => {
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [verifyingServers, setVerifyingServers] = useState(new Set());

  // ✅ Función para generar estado aleatorio (70% activo, 30% inactivo)
  const generateRandomStatus = () => {
    return Math.random() > 0.3 ? "activo" : "inactivo";
  };

  // ✅ Función para generar latencia aleatoria (solo si está activo)
  const generateRandomLatency = (estado) => {
    if (estado === "inactivo") {
      return "timeout";
    }
    // Latencia entre 1-1000ms con diferentes rangos de probabilidad
    const random = Math.random();
    if (random < 0.6) {
      // 60% de probabilidad: latencia baja (1-100ms)
      return `${Math.floor(Math.random() * 100) + 1}ms`;
    } else if (random < 0.9) {
      // 30% de probabilidad: latencia media (101-500ms)
      return `${Math.floor(Math.random() * 400) + 101}ms`;
    } else {
      // 10% de probabilidad: latencia alta (501-1000ms)
      return `${Math.floor(Math.random() * 500) + 501}ms`;
    }
  };

  // ✅ Función para cargar servidores desde Supabase
  const loadServers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔍 Cargando servidores desde Supabase...");

      const { data, error: supabaseError } = await supabase
        .from("servidores")
        .select("*")
        .order("id", { ascending: true });

      if (supabaseError) throw supabaseError;

      console.log(`✅ ${data?.length || 0} servidores cargados`);
      setServers(data || []);
    } catch (err) {
      console.error("❌ Error cargando servidores:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Función para cargar estadísticas desde Supabase
  const loadStats = useCallback(async () => {
    try {
      const { data: servidores, error: supabaseError } = await supabase
        .from("servidores")
        .select("estado");

      if (supabaseError) throw supabaseError;

      const total = servidores?.length || 0;
      const activos =
        servidores?.filter((s) => s.estado === "activo").length || 0;
      const inactivos = total - activos;
      const porcentajeSalud =
        total > 0 ? Math.round((activos / total) * 100) : 0;

      setStats({
        total,
        activos,
        inactivos,
        porcentajeSalud,
      });
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }, []);

  // ✅ Función para cargar todos los datos
  const loadAllData = useCallback(async () => {
    await loadServers();
    await loadStats();
  }, [loadServers, loadStats]);

  // ✅ Función para verificar servidor individual con datos aleatorios
  const verifyServer = async (serverId) => {
    try {
      setVerifyingServers((prev) => new Set(prev).add(serverId));

      // Generar estado y latencia aleatorios
      const nuevoEstado = generateRandomStatus();
      const latencia = generateRandomLatency(nuevoEstado);

      // Actualizar en Supabase
      const { error: supabaseError } = await supabase
        .from("servidores")
        .update({
          estado: nuevoEstado,
          latencia: latencia,
          ultima_verificacion: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", serverId);

      if (supabaseError) throw supabaseError;

      // Actualizar estado local
      setServers((prevServers) =>
        prevServers.map((server) =>
          server.id === serverId
            ? {
                ...server,
                estado: nuevoEstado,
                latencia: latencia,
                ultima_verificacion: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : server
        )
      );

      // Recargar estadísticas
      await loadStats();

      console.log(
        `✅ Servidor ${serverId} verificado: ${nuevoEstado} - ${latencia}`
      );
    } catch (err) {
      console.error("Error verificando servidores:", err);
      alert("❌ Error al verificar el servidor");
    } finally {
      setVerifyingServers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }
  };

  // ✅ Función para verificar todos los servidores con datos aleatorios
  const verifyAllServers = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setIsLoading(true);

      // Verificar cada servidor individualmente con datos aleatorios
      const verificationPromises = servers.map(async (server) => {
        const nuevoEstado = generateRandomStatus();
        const latencia = generateRandomLatency(nuevoEstado);

        return {
          id: server.id,
          estado: nuevoEstado,
          latencia: latencia,
        };
      });

      const resultados = await Promise.all(verificationPromises);
      const timestamp = new Date().toISOString();

      // Actualizar todos los servidores en Supabase
      const updatePromises = resultados.map((result) =>
        supabase
          .from("servidores")
          .update({
            estado: result.estado,
            latencia: result.latencia,
            ultima_verificacion: timestamp,
            updated_at: timestamp,
          })
          .eq("id", result.id)
      );

      await Promise.all(updatePromises);

      // Actualizar estado local
      setServers((prevServers) =>
        prevServers.map((server) => {
          const resultado = resultados.find((r) => r.id === server.id);
          return resultado
            ? {
                ...server,
                estado: resultado.estado,
                latencia: resultado.latencia,
                ultima_verificacion: timestamp,
                updated_at: timestamp,
              }
            : server;
        })
      );

      await loadStats();

      // Mostrar resumen de la verificación
      const activos = resultados.filter((r) => r.estado === "activo").length;
      const inactivos = resultados.filter(
        (r) => r.estado === "inactivo"
      ).length;

      alert(
        `✅ Verificación completada:\n• ${activos} servidores activos\n• ${inactivos} servidores inactivos`
      );
    } catch (err) {
      console.error("Error verificando todos los servidores:", err);
      alert("❌ Error al verificar los servidores");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función para agregar nuevo servidor con estado aleatorio
  const addServer = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const ip = prompt("Ingrese la IP del nuevo servidor:");
    const sucursal = prompt("Ingrese la sucursal:");

    if (ip && sucursal) {
      try {
        // Generar estado y latencia inicial aleatorios
        const estadoInicial = generateRandomStatus();
        const latenciaInicial = generateRandomLatency(estadoInicial);

        const nuevoServidor = {
          ip,
          sucursal,
          estado: estadoInicial,
          latencia: latenciaInicial,
          ultima_verificacion: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: supabaseError } = await supabase
          .from("servidores")
          .insert([nuevoServidor])
          .select();

        if (supabaseError) throw supabaseError;

        await loadAllData();
      } catch (err) {
        console.error("Error agregando servidor:", err);
        alert("❌ Error al agregar servidor");
      }
    }
  };

  // ✅ Función para eliminar servidor
  const deleteServer = async (serverId, serverIp, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (window.confirm(`¿Está seguro de eliminar el servidor ${serverIp}?`)) {
      try {
        const { error: supabaseError } = await supabase
          .from("servidores")
          .delete()
          .eq("id", serverId);

        if (supabaseError) throw supabaseError;

        await loadAllData();
        alert("✅ Servidor eliminado correctamente");
      } catch (err) {
        console.error("Error eliminando servidor:", err);
        alert("❌ Error al eliminar servidor");
      }
    }
  };

  // ✅ Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "Sin verificar";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";

      return date.toLocaleString("es-ES");
    } catch (err) {
      console.error("Error formateando fecha:", err);
      return "Error en fecha";
    }
  };

  // Manejar cambio de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const clearSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchTerm("");
  };

  // ✅ Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ✅ Efecto para actualización automática cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Actualización automática de servidores");
      loadAllData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [loadAllData]);

  // Filtrar servidores
  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.sucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (server.nombre &&
        server.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="server-status-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>
            <FontAwesomeIcon icon={faCog} spin /> Cargando información de
            servidores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="server-status-container">
      <header>
        <div className="header-title">
          <h1>
            <FontAwesomeIcon icon={faServer} /> Monitor de Estado de Servidores
          </h1>
          <p>Sistema de verificación en tiempo real del estado de la red</p>
        </div>
        <div className="controls">
          <button className="btn btn-primary" onClick={addServer}>
            <FontAwesomeIcon icon={faPlus} /> Agregar Servidor
          </button>
          <button className="btn btn-success" onClick={verifyAllServers}>
            <FontAwesomeIcon icon={faSync} /> Verificar Todos
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} /> Error: {error}
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">
                <FontAwesomeIcon icon={faServer} /> Total Servidores
              </span>
            </div>
            <div className="stat-card active">
              <span className="stat-number">{stats.activos}</span>
              <span className="stat-label">
                <FontAwesomeIcon icon={faCheckCircle} /> Activos
              </span>
            </div>
            <div className="stat-card inactive">
              <span className="stat-number">{stats.inactivos}</span>
              <span className="stat-label">
                <FontAwesomeIcon icon={faTimesCircle} /> Inactivos
              </span>
            </div>
            <div className="stat-card health">
              <span className="stat-number">{stats.porcentajeSalud}%</span>
              <span className="stat-label">
                <FontAwesomeIcon icon={faSignal} /> Salud de Red
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="filters-container">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por IP, sucursal o nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={clearSearch}
              title="Limpiar búsqueda"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="server-table">
          <thead>
            <tr>
              <th>IP</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th>Latencia</th>
              <th>Última Verificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => (
                <tr key={server.id} className={server.estado}>
                  <td>
                    <span className="ip-address">
                      <FontAwesomeIcon icon={faDesktop} /> {server.ip}
                    </span>
                  </td>
                  <td>
                    <span className="sucursal-name">
                      <FontAwesomeIcon icon={faBuilding} /> {server.sucursal}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${server.estado}`}>
                      <FontAwesomeIcon
                        icon={
                          server.estado === "activo"
                            ? faCheckCircle
                            : faTimesCircle
                        }
                      />
                      {server.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <span className={`latencia ${server.estado}`}>
                      <FontAwesomeIcon icon={faSignal} /> {server.latencia}
                    </span>
                  </td>
                  <td>
                    <span className="ultima-verificacion">
                      <FontAwesomeIcon icon={faClock} />
                      {formatDate(server.ultima_verificacion)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-info"
                        onClick={() => verifyServer(server.id)}
                        title="Verificar estado"
                        disabled={verifyingServers.has(server.id)}
                      >
                        {verifyingServers.has(server.id) ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />{" "}
                            Verificando...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faEye} /> Verificar
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => deleteServer(server.id, server.ip, e)}
                        title="Eliminar servidor"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  No se encontraron servidores que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>
          Mostrando {filteredServers.length} de {servers.length} servidores
          {verifyingServers.size > 0 &&
            ` • Verificando ${verifyingServers.size} servidor(es)...`}
        </p>
      </div>
    </div>
  );
};

export default ServerStatusTable;
