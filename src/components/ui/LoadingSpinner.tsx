import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'currentColor' }) => {
  let spinnerSize;
  switch (size) {
    case 'sm':
      spinnerSize = 'w-4 h-4';
      break;
    case 'lg':
      spinnerSize = 'w-10 h-10';
      break;
    case 'md':
    default:
      spinnerSize = 'w-6 h-6';
      break;
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${spinnerSize}`}
      style={{ color: color }}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};
