import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import RegistroMedicamentoForm from "../../components/admin/productos/RegistroMedicamentoForm";
import { useRegistroMedicamento } from "../../hooks/useRegistroMedicamento"; 

export default function AdminRegistroMedicamentosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const { 
    form, resultados, loading, error, success, 
    handleFormChange, handleSubmit, handleSearch, handleDelete 
  } = useRegistroMedicamento();

  // Cargar todos al iniciar la página
  useEffect(() => {
    handleSearch(""); 
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Función para limpiar búsqueda y regresar a la lista completa
  const handleRegresar = () => {
    setTextoBusqueda("");
    handleSearch("");
  };

  return (
    <AdminLayout activeSection="productos-registro" currentUser={user} onLogout={handleLogout}>
      <section className="space-y-6">
        
        {/* 1. FORMULARIO DE REGISTRO */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <header className="mb-4">
            <h1 className="text-2xl font-black text-slate-900">Registro de Nuevo Medicamento</h1>
          </header>
          <RegistroMedicamentoForm 
            form={form} onChange={handleFormChange} onSubmit={handleSubmit}
            loading={loading} error={error} success={success}
          />
        </div>

        {/* 2. LISTA GENERAL Y GESTIÓN */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Inventario Actual</h3>
              <p className="text-sm text-slate-500">Lista completa de marcas y precios.</p>
            </div>
            
            {/* Buscador integrado en la lista con botón de regresar */}
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Buscar genérico..."
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm w-full pr-10"
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(textoBusqueda)}
                />
              </div>

              <button 
                onClick={() => handleSearch(textoBusqueda)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 text-sm transition-colors"
              >
                Buscar
              </button>

              {/* Botón de Regresar: Solo se muestra si hay texto de búsqueda */}
              {textoBusqueda && (
                <button 
                  onClick={handleRegresar}
                  className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 text-sm transition-colors whitespace-nowrap"
                >
                  Ver todos
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                  <th className="py-3 px-4">Marca / Comercial</th>
                  <th className="py-3 px-4">Principio Activo</th>
                  <th className="py-3 px-4">Laboratorio</th>
                  <th className="py-3 px-4 text-right">Precio</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resultados?.length > 0 ? (
                  resultados.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-4 font-bold text-slate-800">{med.nombre_comercial}</td>
                      <td className="py-4 px-4 text-slate-600 text-sm">{med.nombre_generico}</td>
                      <td className="py-4 px-4 text-slate-500 text-xs font-semibold">{med.laboratorio}</td>
                      <td className="py-4 px-4 text-right font-black text-teal-600">Bs {med.precio}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => handleDelete(med.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 italic text-sm">
                      No hay medicamentos registrados o que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}