'use client';
import { motion } from 'framer-motion';

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-slate-700 rounded" />
        <div className="h-8 w-16 bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
      <div className="h-3 w-32 bg-slate-700 rounded" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-12 bg-slate-700 rounded" />
          <div className="h-6 w-12 bg-slate-700 rounded" />
        </div>
        <div className="h-4 w-16 bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-full bg-slate-700 rounded mb-2" />
      <div className="h-3 w-32 bg-slate-700 rounded" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <div className="h-6 w-48 bg-slate-700 rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div 
              className="h-8 bg-slate-700 rounded animate-pulse"
              style={{ width: `${Math.random() * 60 + 40}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-700 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-700 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-64 bg-slate-700 rounded animate-pulse mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      <ChartSkeleton />
    </div>
  );
}
