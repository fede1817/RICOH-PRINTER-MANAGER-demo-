import React, { useEffect, useState } from "react";
import "./App.css";
import PrinterTable from "./components/PrinterTable";
import PrinterForm from "./components/PrinterForm";
import InfoModal from "./components/InfoModal";
import LoadingModal from "./components/LoadingModal";
import Swal from "sweetalert2";
import { IoIosAdd } from "react-icons/io";
import ServerStatusTable from "./components/ServerStatusTable";
import { createClient } from "@supabase/supabase-js";

// ✅ CONFIGURACIÓN CORRECTA CON TU API KEY
const supabaseUrl = "https://yracfsgdejnnpsjzqpin.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYWNmc2dkZWpubnBzanpxcGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDk1MTQsImV4cCI6MjA3Nzk4NTUxNH0.Awd-_7qbY2tHkE8CmWz98uzFwz21e01lhKFi-f-X8qg";

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [impresoras, setImpresoras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ip: "",
    sucursal: "",
    modelo: "",
    drivers_url: "",
    tipo: "principal",
    toner_reserva: "",
    direccion: "",
    numero_serie: "",
    contador_paginas: "",
    ultimo_pedido_fecha: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [infoModal, setInfoModal] = useState({ visible: false, data: null });
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [tablaActiva, setTablaActiva] = useState("principal");

  // ✅ Función para cargar impresoras
  const fetchImpresoras = async (showMessage = false) => {
    if (showMessage) {
      setShowLoadingMessage(true);
    }

    try {
      console.log("🔍 Cargando impresoras desde Supabase...");

      const { data, error } = await supabase
        .from("impresoras")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} impresoras cargadas correctamente`);
      console.log("📊 Datos recibidos:", data);
      setImpresoras(data || []);
    } catch (err) {
      console.error("❌ Error al cargar impresoras:", err);

      Swal.fire({
        title: "Error",
        text: `Error al cargar impresoras: ${err.message}`,
        icon: "error",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    } finally {
      if (showMessage) {
        setTimeout(() => setShowLoadingMessage(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchImpresoras();

    const interval = setInterval(() => {
      fetchImpresoras();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: editingId
        ? "¿Guardar cambios en la impresora?"
        : "¿Agregar nueva impresora?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "No, cancelar",
      background: "#2c2c2c",
      color: "#fff",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      let error;

      if (editingId) {
        // ✅ Actualizar impresora existente
        const { data, error: updateError } = await supabase
          .from("impresoras")
          .update(formData)
          .eq("id", editingId)
          .select();

        error = updateError;
      } else {
        // ✅ Insertar nueva impresora
        const { data, error: insertError } = await supabase
          .from("impresoras")
          .insert([formData])
          .select();

        error = insertError;
      }

      if (error) throw error;

      await Swal.fire({
        title: editingId ? "¡Cambios guardados!" : "¡Impresora agregada!",
        text: editingId
          ? "Los datos fueron actualizados correctamente."
          : "La nueva impresora fue guardada correctamente.",
        icon: "success",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#3085d6",
      });

      fetchImpresoras(true);

      // Limpiar y cerrar modal
      setShowModal(false);
      setFormData({
        ip: "",
        sucursal: "",
        modelo: "",
        drivers_url: "",
        tipo: "principal",
        toner_reserva: "",
        direccion: "",
        numero_serie: "",
        contador_paginas: "",
        ultimo_pedido_fecha: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      Swal.fire({
        title: "Error",
        text: `Hubo un problema al guardar la impresora: ${err.message}`,
        icon: "error",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la impresora permanentemente.",
      icon: "warning",
      background: "#2c2c2c",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("impresoras")
          .delete()
          .eq("id", id);

        if (error) throw error;

        await Swal.fire({
          title: "¡Eliminado!",
          text: "La impresora fue eliminada correctamente.",
          icon: "success",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
        });

        fetchImpresoras(true);
      } catch (error) {
        console.error("Error al eliminar la impresora:", error);
        Swal.fire({
          title: "Error",
          text: `No se pudo eliminar la impresora: ${error.message}`,
          icon: "error",
          background: "#2c2c2c",
          color: "#fff",
        });
      }
    }
  };

  const handleEdit = (impresora) => {
    setFormData({
      ip: impresora.ip || "",
      sucursal: impresora.sucursal || "",
      modelo: impresora.modelo || "",
      drivers_url: impresora.drivers_url || "",
      tipo: impresora.tipo || "principal",
      toner_reserva: impresora.toner_reserva || "",
      direccion: impresora.direccion || "",
      numero_serie: impresora.numero_serie || "",
      contador_paginas: impresora.contador_paginas || "",
      ultimo_pedido_fecha: impresora.ultimo_pedido_fecha || "",
    });
    setEditingId(impresora.id);
    setShowModal(true);
  };

  const handleCopyPedido = async (impresora) => {
    const pedidoData = {
      impresora_id: impresora.id,
      modelo: impresora.modelo,
      numero_serie: impresora.numero_serie || "N/A",
      contador_total: impresora.contador_paginas || "N/A",
      nombre: impresora.sucursal || "Sucursal Desconocida",
      direccion: impresora.direccion || "Dirección no especificada",
      telefono: "0987 200316",
      correo: "bryan.medina@surcomercial.com.py",
      ultimo_pedido_fecha: impresora.ultimo_pedido_fecha,
    };

    let fechaFormateada = "N/A";
    if (pedidoData.ultimo_pedido_fecha) {
      const fecha = new Date(pedidoData.ultimo_pedido_fecha);
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = String(fecha.getFullYear()).slice(-2);
      fechaFormateada = `${dia}/${mes}/${anio}`;
    }

    const textoParaCopiar = `
Sucursal: ${pedidoData.nombre}
Modelo: ${pedidoData.modelo}
Número de Serie: ${pedidoData.numero_serie}
Contador: ${pedidoData.contador_total}
Dirección: ${pedidoData.direccion}
Teléfono: ${pedidoData.telefono}
Correo: ${pedidoData.correo}
Último Pedido: ${fechaFormateada}
  `.trim();

    const confirmacion = await Swal.fire({
      title: "¿Confirmar pedido de tóner?",
      html: `<pre style="text-align:left; color: white; background: #333; padding: 15px; border-radius: 5px;">${textoParaCopiar}</pre>`,
      icon: "question",
      background: "#2c2c2c",
      color: "#fff",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      showCancelButton: true,
      confirmButtonText: "Confirmar y Copiar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        // ✅ Copiar al portapapeles
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textoParaCopiar);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = textoParaCopiar;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }

        // ✅ Actualizar fecha del último pedido en Supabase
        const { error } = await supabase
          .from("impresoras")
          .update({
            ultimo_pedido_fecha: new Date().toISOString(),
          })
          .eq("id", pedidoData.impresora_id);

        if (error) throw error;

        await Swal.fire({
          icon: "success",
          title: "Pedido confirmado",
          text: "Los datos fueron copiados al portapapeles y la fecha actualizada.",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          showConfirmButton: false,
        });

        fetchImpresoras(true);
      } catch (error) {
        console.error("Error al procesar el pedido:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al procesar el pedido. Intenta nuevamente.",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
        });
      }
    }
  };

  return (
    <div className="App dark-mode">
      <h1>PrinterManager + Supabase(demo)</h1>

      {/* Panel de estado */}

      <button className="add-btn" onClick={() => setShowModal(true)}>
        <IoIosAdd />
        Agregar impresora
      </button>

      <div className="tab-column-header">
        <div
          className={`tab-column ${
            tablaActiva === "principal" ? "active" : ""
          }`}
          onClick={() => setTablaActiva("principal")}
        >
          Principales
        </div>
        <div
          className={`tab-column ${tablaActiva === "backup" ? "active" : ""}`}
          onClick={() => setTablaActiva("backup")}
        >
          Backup
        </div>
        <div
          className={`tab-column ${
            tablaActiva === "comercial" ? "active" : ""
          }`}
          onClick={() => setTablaActiva("comercial")}
        >
          Comercial
        </div>
      </div>

      {showLoadingMessage && <LoadingModal />}

      <div>
        {tablaActiva === "principal" && (
          <PrinterTable
            impresoras={impresoras.filter((imp) => imp.tipo === "principal")}
            tipo="principal"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}

        {tablaActiva === "backup" && (
          <PrinterTable
            impresoras={impresoras.filter((imp) => imp.tipo === "backup")}
            tipo="backup"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}

        {tablaActiva === "comercial" && (
          <PrinterTable
            impresoras={impresoras.filter((imp) => imp.tipo === "comercial")}
            tipo="comercial"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}
      </div>

      <ServerStatusTable />

      {showModal && (
        <PrinterForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setFormData({
              ip: "",
              sucursal: "",
              modelo: "",
              drivers_url: "",
              tipo: "principal",
              toner_reserva: "",
              direccion: "",
              numero_serie: "",
              contador_paginas: "",
              ultimo_pedido_fecha: "",
            });
          }}
          isEditing={editingId !== null}
        />
      )}

      <InfoModal
        visible={infoModal.visible}
        data={infoModal.data}
        onClose={() => setInfoModal({ visible: false, data: null })}
      />
    </div>
  );
}

export default App;
