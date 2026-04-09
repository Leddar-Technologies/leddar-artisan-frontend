import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-stone-700' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-ink mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-surface-100 ${iconColor}`}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );
}
