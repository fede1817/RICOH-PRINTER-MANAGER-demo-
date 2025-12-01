import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

const ServerModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  serverData, 
  isEditing = false 
}) => {
  const [formData, setFormData] = React.useState({
    ip: '',
    sucursal: '',
    nombre: '',
    tipo: 'servidor'
  });
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (isOpen) {
      if (isEditing && serverData) {
        setFormData({
          ip: serverData.ip || '',
          sucursal: serverData.sucursal || '',
          nombre: serverData.nombre || '',
          tipo: serverData.tipo || 'servidor'
        });
      } else {
        setFormData({
          ip: '',
          sucursal: '',
          nombre: '',
          tipo: 'servidor'
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, serverData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ip.trim()) {
      newErrors.ip = 'La IP es requerida';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) {
      newErrors.ip = 'Formato de IP inválido';
    }

    if (!formData.sucursal.trim()) {
      newErrors.sucursal = 'La sucursal es requerida';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-modal-appear">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Servidor' : 'Agregar Nuevo Servidor'}
          </h2>
          <button 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            onClick={handleClose}
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Campo IP */}
            <div className="mb-5">
              <label htmlFor="ip" className="block text-sm font-medium text-gray-300 mb-2">
                Dirección IP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border ${
                  errors.ip ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'
                } rounded-lg focus:ring-2 focus:ring-opacity-30 outline-none transition-all text-white placeholder-gray-500`}
                placeholder="Ej: 192.168.1.1"
              />
              {errors.ip && (
                <span className="mt-1.5 text-sm text-red-400 block">{errors.ip}</span>
              )}
            </div>

            {/* Campo Sucursal */}
            <div className="mb-5">
              <label htmlFor="sucursal" className="block text-sm font-medium text-gray-300 mb-2">
                Sucursal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sucursal"
                name="sucursal"
                value={formData.sucursal}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border ${
                  errors.sucursal ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'
                } rounded-lg focus:ring-2 focus:ring-opacity-30 outline-none transition-all text-white placeholder-gray-500`}
                placeholder="Ej: Sucursal Central"
              />
              {errors.sucursal && (
                <span className="mt-1.5 text-sm text-red-400 block">{errors.sucursal}</span>
              )}
            </div>

            {/* Campo Nombre */}
            <div className="mb-5">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Equipo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border ${
                  errors.nombre ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/30'
                } rounded-lg focus:ring-2 focus:ring-opacity-30 outline-none transition-all text-white placeholder-gray-500`}
                placeholder="Ej: Servidor Principal"
              />
              {errors.nombre && (
                <span className="mt-1.5 text-sm text-red-400 block">{errors.nombre}</span>
              )}
            </div>

            {/* Campo Tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Equipo <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px]"
              >
                <option value="servidor">Servidor</option>
                <option value="switch">Switch</option>
                <option value="router">Router</option>
                <option value="firewall">Firewall</option>
                <option value="database">Base de Datos</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              className="flex-1 px-5 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServerModal;