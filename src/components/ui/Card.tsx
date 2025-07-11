import { ComponentProps } from "react";
import { tv, VariantProps } from "tailwind-variants";

const card = tv({
  base: "rounded-lg bg-white p-4 shadow-md",
  variants: {
    variant: {
      default: "",
      outline: "border border-gray-200",
      flat: "shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CardProps = ComponentProps<"div"> & VariantProps<typeof card>;

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={card({ variant, className })} {...props} />;
}
