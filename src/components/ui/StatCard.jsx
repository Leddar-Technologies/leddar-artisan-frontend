"use client";

import React from "react";
import { Card, CardContent } from "./Card";

/**
 * A dashboard component that displays a single metric with an icon.
 * Standard JavaScript version for the artisan dashboard.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-stone-700",
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-ink mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-surface-100 ${iconColor}`}>
          {/* Render the Lucide icon passed as a prop */}
          {Icon && <Icon size={24} />}
        </div>
      </CardContent>
    </Card>
  );
}
