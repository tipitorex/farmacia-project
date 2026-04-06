export default function RegistroMedicamentoForm({ form = {}, onChange, onSubmit, loading, error, success }) {
  return (
    <form onSubmit={onSubmit} className="mt-4">
      
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600 border border-red-200">
          <p className="text-sm font-bold">✕ {error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl bg-teal-50 p-4 text-teal-700 border border-teal-200">
          <p className="text-sm font-bold">✓ Medicamento registrado con éxito.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Nombre Genérico (Principio Activo) *</label>
          <input
            type="text"
            name="nombreGenerico"
            value={form?.nombreGenerico || ""}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Ej: Omeprazol"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Nombre Comercial (Marca) *</label>
          <input
            type="text"
            name="nombreComercial"
            value={form?.nombreComercial || ""}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Ej: Losec"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Laboratorio</label>
          <input
            type="text"
            name="laboratorio"
            value={form?.laboratorio || ""}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="Ej: AstraZeneca"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Precio (Bs) *</label>
          {/* AQUÍ ESTÁ LA MAGIA PARA QUITAR LAS FLECHITAS EN CLASSNAME */}
          <input
            type="number"
            step="0.01"
            name="precio"
            value={form?.precio || ""}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Ej: 20.50"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : "Guardar Medicamento"}
        </button>
      </div>
      
    </form>
  );
}