import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 
import { createMedicamento, searchMedicamentos, deleteMedicamento } from "../services/adminService"; 

export function useRegistroMedicamento() {
  const { user } = useAuth(); 

  const [form, setForm] = useState({
    nombreGenerico: "",
    nombreComercial: "",
    laboratorio: "",
    precio: ""
  });

  const [resultados, setResultados] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSearch = async (nombre = "") => {
    try {
        const token = user?.access || localStorage.getItem("accessToken");
        const data = await searchMedicamentos(token, nombre);        
        const listaMedicamentos = Array.isArray(data) ? data : (data.results || []);
        setResultados(listaMedicamentos);
    } catch (err) {
        console.error("Error en la búsqueda:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreGenerico.trim() || !form.nombreComercial.trim()) {
      setError("Los nombres genérico y comercial son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = user?.access || localStorage.getItem("accessToken"); 
      await createMedicamento(token, form);
      setSuccess(true);
      setForm({ nombreGenerico: "", nombreComercial: "", laboratorio: "", precio: "" }); 
      handleSearch(""); 
    } catch (err) {
      setError(err?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este medicamento?")) return;

    try {
      const token = user?.access || localStorage.getItem("accessToken");
      await deleteMedicamento(token, id);
      setResultados((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("No se pudo eliminar el medicamento.");
      console.error(err);
    }
  };

  return { 
    form, 
    resultados, 
    loading, 
    error, 
    success, 
    handleFormChange, 
    handleSubmit, 
    handleSearch,
    handleDelete 
  };
}