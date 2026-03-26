import { quickActions } from "../../data/homeData";
import { HeadsetIcon, StoreIcon, TruckIcon } from "../ui/Icons";

const actionIcons = [StoreIcon, TruckIcon, HeadsetIcon];

export default function QuickActions() {
  return (
    <section className="rounded-[28px] border border-sky-100 bg-white/97 p-5 shadow-2xl shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-900">Servicios destacados</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
      {quickActions.map((item, index) => {
        const Icon = actionIcons[index] || StoreIcon;
        return (
          <article
            key={item.title}
            className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/40 p-4 shadow-sm transition hover:border-sky-200"
          >
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
            </div>
          </article>
        );
      })}
      </div>
    </section>
  );
}
