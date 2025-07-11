import { ComponentProps } from "react";
import { tv, VariantProps } from "tailwind-variants";

const button = tv({
  base: "rounded-lg px-4 py-2 text-sm font-semibold shadow-sm",
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
      ghost: "hover:bg-gray-100",
    },
    size: {
      default: "px-4 py-2",
      sm: "px-2 py-1",
      lg: "px-6 py-3",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />;
}
