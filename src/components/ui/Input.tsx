import { ComponentProps } from "react";
import { tv, VariantProps } from "tailwind-variants";

const input = tv({
  base: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none",
});

type InputProps = ComponentProps<"input"> & VariantProps<typeof input>;

export function Input({ className, ...props }: InputProps) {
  return <input className={input({ className })} {...props} />;
}
