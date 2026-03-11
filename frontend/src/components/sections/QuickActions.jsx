import { quickActions } from "../../data/homeData";
import { HeadsetIcon, StoreIcon, TruckIcon } from "../ui/Icons";

const actionIcons = [StoreIcon, TruckIcon, HeadsetIcon];

export default function QuickActions() {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {quickActions.map((item, index) => {
        const Icon = actionIcons[index] || StoreIcon;
        return (
          <article key={item.title} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              <Icon className="h-3.5 w-3.5" />
              Servicio
            </span>
            <h3 className="text-sm font-extrabold text-emerald-900">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
          </article>
        );
      })}
    </section>
  );
}
