import React from "react";
import { X } from "lucide-react";
import '../App.css';
export default function PrinterForm({
  formData,
  onChange,
  onSubmit,
  onClose,
  isEditing,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 text-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isEditing ? "Editar impresora" : "Agregar nueva impresora"}
          </h2>
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              IP
            </label>
            <input
              type="text"
              name="ip"
              placeholder="Ej: 192.168.1.100"
              value={formData.ip}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sucursal
            </label>
            <input
              type="text"
              name="sucursal"
              placeholder="Ej: Sucursal Central"
              value={formData.sucursal}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Modelo
            </label>
            <input
              type="text"
              name="modelo"
              placeholder="Ej: HP LaserJet Pro M404"
              value={formData.modelo}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL de Drivers
            </label>
            <input
              type="url"
              name="drivers_url"
              placeholder="https://www.hp.com/drivers/..."
              value={formData.drivers_url}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white"
            >
              <option value="principal">Principal</option>
              <option value="backup">Backup</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tóner de reserva (%)
            </label>
            <input
              type="number"
              name="toner_reserva"
              placeholder="Ej: 50"
              value={formData.toner_reserva}
              onChange={onChange}
              min="0"
              max="100"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              placeholder="Dirección de la sucursal"
              value={formData.direccion}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-white placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isEditing ? "Guardar cambios" : "Agregar impresora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}