import { cn } from "../../lib/utils";

const tones = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export function Alert({ className, tone = "default", ...props }) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border px-4 py-3 text-sm shadow-sm", tones[tone] || tones.default, className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return <p className={cn("font-bold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return <div className={cn("mt-1 text-sm leading-6", className)} {...props} />;
}