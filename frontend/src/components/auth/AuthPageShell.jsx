import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import farmaciaAtencionImage from "../../assets/auth/farmacia-atencion.jpg";

function PharmacyIllustration() {
  return (
    <div className="overflow-hidden rounded-3xl border border-teal-100/70 bg-white">
      <img
        src={farmaciaAtencionImage}
        alt="Farmacéutica atendiendo a una cliente en el mostrador"
        className="h-56 w-full object-cover object-center"
        loading="eager"
      />
      <div className="bg-[linear-gradient(90deg,rgba(15,118,110,0.08),rgba(14,165,233,0.08))] px-4 py-3 text-xs font-semibold tracking-wide text-slate-700">
        Atención farmacéutica personalizada y asesoramiento confiable
      </div>
    </div>
  );
}

export default function AuthPageShell({ eyebrow = "Acceso", title, description, children }) {
  return (
    <main className="farm-bg min-h-screen px-4 py-4 text-slate-800 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
        <section className="rounded-[32px] border border-teal-100/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-8">
          {/* Pharmacy illustration */}
          <div className="mb-6 flex justify-center lg:justify-start">
            <PharmacyIllustration />
          </div>

          {/* Main heading */}
          <h1 className="max-w-xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            Tu cuenta personal en <span className="text-teal-700">Farmacia SaludPlus</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Accede a tu perfil y disfruta de beneficios exclusivos. Gestiona tus compras, guarda tus datos y acumula puntos.
          </p>

          {/* Benefits grid */}
          <div className="mt-8 space-y-3">
            <article className="flex gap-3 rounded-2xl border border-emerald-100/60 bg-emerald-50/50 p-4 transition hover:bg-emerald-50">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 00-1 1v2h-2v-2a1 1 0 00-2 0v2H7v-2a1 1 0 00-1-1H3a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1v-4a1 1 0 00-1-1z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Historial de compra</p>
                <p className="text-xs text-emerald-700">Accede a todos tus pedidos, recibos y detalles de compra en un solo lugar.</p>
              </div>
            </article>

            <article className="flex gap-3 rounded-2xl border border-blue-100/60 bg-blue-50/50 p-4 transition hover:bg-blue-50">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-900">Perfil personalizado</p>
                <p className="text-xs text-blue-700">Guarda direcciones, métodos de pago y preferencias de entrega.</p>
              </div>
            </article>

            <article className="flex gap-3 rounded-2xl border border-amber-100/60 bg-amber-50/50 p-4 transition hover:bg-amber-50">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <svg className="h-5 w-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">Programa de puntos</p>
                <p className="text-xs text-amber-700">Acumula puntos en cada compra y canjéalos por premios exclusivos.</p>
              </div>
            </article>
          </div>

          {/* Footer links */}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <Link to="/" className="text-teal-700 transition hover:text-teal-600">
              ← Volver al inicio
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/admin" className="text-slate-500 transition hover:text-slate-700">
              Panel administrativo
            </Link>
          </div>
        </section>

        {/* Form card */}
        <Card>
          <CardHeader className="border-b border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,249,255,0.95))]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">{eyebrow}</p>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}