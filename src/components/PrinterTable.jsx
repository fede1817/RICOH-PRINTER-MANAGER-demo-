import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaPrint, FaSync } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";

export default function PrinterTable({
  impresoras,
  tipo,
  onEdit,
  onDelete,
  onInfo,
  onCopy,
  onUpdatePrinter,
  onUpdateAllPrinters,
}) {
  const [loadingStates, setLoadingStates] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);

  const checkSinglePrinterStatus = async (printerId) => {
    setLoadingStates((prev) => ({ ...prev, [printerId]: true }));

    try {
      const res = await fetch(
        `http://192.168.8.166:3001/api/impresoras/${printerId}/status`
      );

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await res.json();

      if (onUpdatePrinter) {
        onUpdatePrinter(printerId, {
          estado: data.estado,
          ultima_verificacion: data.ultima_verificacion,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `Impresora ${
          data.estado === "conectada" ? "conectada" : "desconectada"
        }`,
        timer: 2000,
        showConfirmButton: false,
        background: "#2c2c2c",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error checking printer status:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo verificar el estado de la impresora",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [printerId]: false }));
    }
  };

  const checkAllPrintersStatus = async () => {
    setLoadingAll(true);

    try {
      const res = await fetch(
        "http://192.168.8.166:3001/api/impresoras/status"
      );

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await res.json();

      if (onUpdateAllPrinters) {
        onUpdateAllPrinters(data);
      }

      Swal.fire({
        icon: "success",
        title: "Estados actualizados",
        text: `Se verificaron ${data.length} impresoras`,
        timer: 2000,
        showConfirmButton: false,
        background: "#2c2c2c",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error checking all printers status:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudieron verificar los estados",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoadingAll(false);
    }
  };

  const getStatusInfo = (estado) => {
    const status = estado || "verificando";

    switch (status) {
      case "conectada":
        return {
          icon: "🟢",
          text: "Conectada",
          bgColor: "bg-green-500/15",
          textColor: "text-green-500",
          borderColor: "border-green-500/30",
        };
      case "desconectada":
        return {
          icon: "🔴",
          text: "Desconectada",
          bgColor: "bg-red-500/15",
          textColor: "text-red-500",
          borderColor: "border-red-500/30",
        };
      default:
        return {
          icon: "🟡",
          text: "Verificando",
          bgColor: "bg-yellow-500/15",
          textColor: "text-yellow-500",
          borderColor: "border-yellow-500/30",
        };
    }
  };

  const getTonerColor = (percentage) => {
    if (percentage <= 0) return "bg-gray-500";
    if (percentage < 10) return "bg-red-600";
    if (percentage < 20) return "bg-orange-500";
    if (percentage < 50) return "bg-yellow-500";
    if (percentage < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const handlePrint = async (impresoraId, file, impresoraEstado) => {
    if (!file) return;

    if (impresoraEstado === "desconectada") {
      Swal.fire({
        icon: "warning",
        title: "Impresora desconectada",
        text: "No se puede imprimir en una impresora desconectada",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const spinner = document.createElement("div");
    spinner.innerHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-8 rounded-xl text-center">
        <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white">Enviando a imprimir...</p>
      </div>
    </div>
  `;

    document.body.appendChild(spinner);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://192.168.8.166:3001/api/impresoras/${impresoraId}/print`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      document.body.removeChild(spinner);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Impresión enviada",
          text: "✅ Archivo enviado a imprimir correctamente",
          timer: 2500,
          showConfirmButton: false,
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error en impresión",
          text: data.error || "Ocurrió un problema",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      document.body.removeChild(spinner);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: error.message,
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg m-4">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <div className="flex items-center justify-between">
                <span>IP</span>
                <div className="relative group">
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      loadingAll
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={checkAllPrintersStatus}
                    disabled={loadingAll}
                  >
                    {loadingAll ? (
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaSync size={12} />
                        <span>Actualizar</span>
                      </>
                    )}
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Actualizar todos los estados
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                  </div>
                </div>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Sucursal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Modelo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Nivel de Tóner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Pedido
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {impresoras
            .filter((i) => i.tipo === tipo)
            .map((impresora, index) => {
              const statusInfo = getStatusInfo(impresora.estado);
              const isLoading = loadingStates[impresora.id];
              const tonerPercentage = impresora.toner_anterior || 0;

              return (
                <tr
                  key={`${tipo}-${index}`}
                  className="hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <a
                        href={`http://${impresora.ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-blue-400 transition-colors ${
                          impresora.estado === "desconectada"
                            ? "opacity-50 pointer-events-none line-through"
                            : ""
                        }`}
                      >
                        {impresora.ip}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {impresora.sucursal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <a
                      href={impresora.drivers_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      {impresora.modelo}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full max-w-xs">
                      {impresora.estado === "desconectada" ? (
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-6">
                            <div className="bg-gray-600 h-6 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-400 px-2">
                                Desconectada
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : tonerPercentage <= 0 ? (
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-6">
                            <div className="bg-gray-600 h-6 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-400 px-2">
                                No disponible
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Barra de progreso completa */}
                          <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner relative">
                            {/* Barra de progreso coloreada */}
                            <div
                              className={`h-6 rounded-full ${getTonerColor(
                                tonerPercentage
                              )} transition-all duration-500 ease-out`}
                              style={{ width: `${tonerPercentage}%` }}
                            />
                            
                            {/* Texto del porcentaje - SIEMPRE centrado sobre toda la barra */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                {tonerPercentage}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Indicador de nivel crítico */}
                          {tonerPercentage < 20 && tonerPercentage > 0 && (
                            <div className="absolute -top-2 -right-2">
                              <span className="flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center">
                                  <span className="text-xs text-white">!</span>
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Etiqueta de estado debajo de la barra */}
                      <div className="mt-1 text-xs text-gray-400">
                        {impresora.estado === "desconectada"
                          ? "Estado: Desconectada"
                          : tonerPercentage <= 0
                          ? "Sin datos de tóner"
                          : tonerPercentage < 10
                          ? "Nivel CRÍTICO"
                          : tonerPercentage < 20
                          ? "Nivel BAJO"
                          : tonerPercentage < 50
                          ? "Nivel MEDIO"
                          : tonerPercentage < 80
                          ? "Nivel ALTO"
                          : "Nivel OPTIMO"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} min-w-[110px]`}
                      >
                        <span className="text-sm">{statusInfo.icon}</span>
                        <span className="text-xs font-medium">
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="relative group">
                        <button
                          className={`p-1.5 rounded transition-colors ${
                            isLoading
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-gray-700/50 hover:bg-gray-600"
                          }`}
                          onClick={() => checkSinglePrinterStatus(impresora.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <FaSync size={12} className="text-gray-300" />
                          )}
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          Verificar estado
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative group">
                      <button
                        className="p-2 bg-gray-700/50 hover:bg-gray-600 rounded transition-colors text-blue-400 hover:text-blue-300"
                        onClick={() => onInfo(impresora)}
                      >
                        <BsInfoCircleFill size={18} />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        Ver información
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="file"
                      id={`file-${impresora.id}`}
                      className="hidden"
                      onChange={(e) =>
                        handlePrint(
                          impresora.id,
                          e.target.files[0],
                          impresora.estado
                        )
                      }
                      disabled={impresora.estado === "desconectada"}
                    />
                    <div className="flex gap-2">
                      <div className="relative group">
                        <button
                          className={`p-2 rounded transition-colors ${
                            impresora.estado === "desconectada"
                              ? "bg-gray-700/30 cursor-not-allowed opacity-50"
                              : "bg-gray-700/50 hover:bg-gray-600"
                          } text-blue-400 hover:text-blue-300`}
                          onClick={() =>
                            document
                              .getElementById(`file-${impresora.id}`)
                              .click()
                          }
                          disabled={impresora.estado === "desconectada"}
                        >
                          <FaPrint size={16} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          Imprimir archivo
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                        </div>
                      </div>
                      <div className="relative group">
                        <button
                          className="p-2 bg-gray-700/50 hover:bg-gray-600 rounded transition-colors text-green-400 hover:text-green-300"
                          onClick={() => onEdit(impresora)}
                        >
                          <FaRegEdit size={16} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          Editar Impresora
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                        </div>
                      </div>
                      <div className="relative group">
                        <button
                          className="p-2 bg-gray-700/50 hover:bg-red-900/30 rounded transition-colors text-red-400 hover:text-red-300"
                          onClick={() => onDelete(impresora.id)}
                        >
                          <RiDeleteBin6Line size={16} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          Eliminar Impresora
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative group">
                      <button
                        className="p-2 bg-gray-700/50 hover:bg-gray-600 rounded transition-colors text-yellow-400 hover:text-yellow-300"
                        onClick={() => onCopy(impresora)}
                      >
                        <FaCartShopping size={16} />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        Generar pedido de tóner
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Si no hay impresoras */}
      {impresoras.filter((i) => i.tipo === tipo).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No hay impresoras del tipo{" "}
          {tipo === "principal"
            ? "Principal"
            : tipo === "backup"
            ? "Backup"
            : "Comercial"}
        </div>
      )}
    </div>
  );
}