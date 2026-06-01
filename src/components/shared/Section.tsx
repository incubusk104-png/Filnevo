import { PropsWithChildren } from 'react';

interface SectionProps extends PropsWithChildren {
  className?: string;
  py?: string; // padding y-axis
  containerClassName?: string;
  bgVariant?: 'default' | 'muted' | 'dark';
}

export default function Section({
  children,
  className = '',
  py = 'py-16 lg:py-20',
  containerClassName = '',
  bgVariant = 'default',
}: SectionProps) {
  const bgClasses = {
    default: '',
    muted: 'bg-neutral-950/50 backdrop-blur-sm',
    dark: 'bg-neutral-900/30 backdrop-blur'
  };

  return (
    <section className={`${py} ${bgClasses[bgVariant]} ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 {containerClassName}">
        {children}
      </div>
    </section>
  );
}