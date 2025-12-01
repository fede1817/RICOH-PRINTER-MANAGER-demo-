import React from "react";
import { X } from "lucide-react";

export default function InfoModal({ visible, data, onClose }) {
  if (!visible || !data) return null;
  
  console.log("contador" + data.contador);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 text-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Información del Tóner
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {data.sucursal} - {data.modelo}
            </p>
          </div>
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            onClick={onClose}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna 1 */}
            <div className="space-y-3">
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Sucursal</p>
                <p className="font-medium">{data.sucursal}</p>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Modelo</p>
                <p className="font-medium">{data.modelo}</p>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Tipo</p>
                <p className="font-medium capitalize">{data.tipo}</p>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Número de Serie</p>
                <p className="font-medium">{data?.numero_serie || "N/A"}</p>
              </div>
            </div>
            
            {/* Columna 2 */}
            <div className="space-y-3">
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Contador de Páginas</p>
                <p className="font-medium text-lg">
                  {data?.contador_paginas?.toLocaleString() ?? "N/A"}
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Tóneres de Reserva</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {data.toner_reserva || 0}
                        </span>
                      </div>
                      {data.toner_reserva > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <span className="flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-green-500 items-center justify-center">
                              <span className="text-xs text-white">✓</span>
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {data.toner_reserva === 0 
                          ? "Sin tóneres de reserva"
                          : data.toner_reserva === 1 
                            ? "1 tóner de reserva disponible"
                            : `${data.toner_reserva} tóneres de reserva disponibles`
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {data.toner_reserva === 0 
                          ? "⚠️ Necesita reabastecimiento"
                          : data.toner_reserva === 1 
                            ? "Nivel bajo de reserva"
                            : "Stock suficiente"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Último Cambio de Tóner</p>
                <p className="font-medium">
                  {data.fecha_ultimo_cambio
                    ? new Date(data.fecha_ultimo_cambio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "N/A"}
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Último Pedido</p>
                <p className="font-medium">
                  {data.ultimo_pedido_fecha
                    ? new Date(data.ultimo_pedido_fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          {data.direccion && (
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Dirección</p>
              <p className="font-medium">{data.direccion}</p>
            </div>
          )}
          
          {data.ip && (
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Dirección IP</p>
              <a 
                href={`http://${data.ip}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                {data.ip}
              </a>
            </div>
          )}
          
          
          {/* Información de contacto si existe */}
          {(data.telefono || data.correo) && (
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Contacto</p>
              <div className="space-y-1">
                {data.telefono && (
                  <p className="font-medium">
                    📞 {data.telefono}
                  </p>
                )}
                {data.correo && (
                  <p className="font-medium text-sm break-all">
                    ✉️ {data.correo}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}