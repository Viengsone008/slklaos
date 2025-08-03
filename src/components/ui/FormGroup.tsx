// components/ui/FormGroup.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

interface Props extends React.HTMLProps<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  icon: LucideIcon;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;          // only used when as === "select"
}

const base =
  "w-full rounded-lg bg-white/50 border border-gray-300 pl-11 pr-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400";

export default function FormGroup({
  label,
  icon: Icon,
  as = "input",
  children,
  ...rest
}: Props) {
  const Tag = as as any;

  return (
    <label className="space-y-1 text-sm font-medium text-gray-700">
      {label}
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Tag className={base} {...rest}>
          {children}
        </Tag>
      </div>
    </label>
  );
}
