import React, { HTMLAttributes, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  variant?: 'default' | 'glass' | 'outline';
  hover?: boolean;
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hover = false,
      clickable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300';
    
    // Variant classes
    const variantClasses = {
      default: 'bg-white/10 backdrop-blur-lg border border-white/10',
      glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
      outline: 'bg-transparent border border-white/20',
    };
    
    // Hover effect
    const hoverClasses = hover ? 'hover:transform hover:-translate-y-1 hover:shadow-xl' : '';
    
    // Clickable effect
    const clickableClasses = clickable ? 'cursor-pointer' : '';
    
    // Combine all classes
    const cardClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`;
    
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;