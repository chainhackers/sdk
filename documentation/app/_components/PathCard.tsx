import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PathCardProps {
  title: string;
  icon: LucideIcon;
  gradient: 'blue' | 'purple';
  iconGradient: 'yellow' | 'purple';
  href: string;
  children: ReactNode;
}

const gradients = {
  blue: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-800',
  purple: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-800',
};

const iconGradients = {
  yellow: 'bg-gradient-to-br from-yellow-400 to-orange-500',
  purple: 'bg-gradient-to-br from-purple-500 to-pink-500',
};

export default function PathCard({ title, icon: IconComponent, gradient, iconGradient, href, children }: PathCardProps) {
  return (
    <div className={`group relative ${gradients[gradient]} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center justify-center w-12 h-12 ${iconGradients[iconGradient]} rounded-lg`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {children}
      </div>
      
      <a href={href} className="absolute inset-0 rounded-xl" aria-label={`Go to ${title}`} />
    </div>
  );
}

export function PathCardSection({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {children}
    </div>
  );
}

export function PathCardContent({ label, content }: { label: string; content: string }) {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}:</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{content}</p>
    </div>
  );
}

export function PathCardTitle({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
      <p className="font-semibold text-gray-900 dark:text-white">{children}</p>
    </div>
  );
}
