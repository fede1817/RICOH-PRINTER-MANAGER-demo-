import { useState } from "react";
import '../App.css';
export default function PingApp() {
  const [host, setHost] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hacerPing = async () => {
    if (!host.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setResult({
        host,
        alive: false,
        time: "N/A",
        error: "Error de conexión con el servidor"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      hacerPing();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">
        Herramienta de Ping de Red
      </h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dirección IP o Hostname
          </label>
          <input
            type="text"
            placeholder="Ej: 192.168.8.166 o google.com"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Presiona Enter para hacer ping directamente
          </p>
        </div>

        <button
          onClick={hacerPing}
          disabled={!host.trim() || isLoading}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Haciendo Ping...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Hacer Ping</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 bg-gray-900/50 border border-gray-700 rounded-xl p-5 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resultado del Ping
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Host:</span>
              <span className="font-mono text-white">{result.host}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Estado:</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  result.alive 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  result.alive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.alive ? "Activo ✓" : "Inactivo ✗"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Tiempo:</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono text-white">
                  {result.time} ms
                </span>
              </div>
            </div>

            {/* Información adicional de latencia */}
            {result.time !== "N/A" && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Calidad de Conexión:</span>
                  <span className={`text-sm font-medium ${
                    result.time < 50 ? 'text-green-400' :
                    result.time < 100 ? 'text-yellow-400' :
                    result.time < 200 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {result.time < 50 ? 'Excelente' :
                     result.time < 100 ? 'Buena' :
                     result.time < 200 ? 'Regular' : 'Mala'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      result.time < 50 ? 'bg-green-500' :
                      result.time < 100 ? 'bg-yellow-500' :
                      result.time < 200 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (result.time / 2))}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {result.time < 50 ? 'Conexión óptima para aplicaciones críticas' :
                   result.time < 100 ? 'Conexión adecuada para la mayoría de usos' :
                   result.time < 200 ? 'Conexión aceptable para uso básico' : 
                   'Conexión pobre, puede afectar el rendimiento'}
                </p>
              </div>
            )}

            {/* Mostrar error si existe */}
            {result.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-300 text-sm">{result.error}</p>
              </div>
            )}

            {/* Botón para limpiar resultados */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setResult(null);
                  setHost("");
                }}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                Realizar nuevo ping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}