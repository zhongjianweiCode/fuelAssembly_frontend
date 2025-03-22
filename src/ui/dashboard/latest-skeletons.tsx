'use client';

import { SkeletonItem } from '@/types/skeleton';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '../font';
import { format } from 'date-fns';

const statusColors = {
  CMM: 'bg-blue-100 text-blue-800',
  Laboratory: 'bg-cyan-100 text-cyan-800',
  Customer: 'bg-purple-100 text-purple-800',
  Released: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Used: 'bg-gray-200 text-gray-700',
};

export default function LatestSkeletons({
  latestSkeletons,
}: {
  latestSkeletons: SkeletonItem[];
}) {
  return (
    <div className="flex w-full flex-col h-full">
      <h2 className={`${lusitana.className} mb-4 text-2xl md:text-3xl font-bold text-gray-800`}>
        Latest Skeletons
      </h2>
      <div className="flex grow flex-col justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 shadow-lg">
        <div className="bg-white rounded-xl border border-gray-100 shadow-inner">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 text-xs font-medium text-gray-500">
              <div className="col-span-1 md:col-span-3">Sk_Number</div>
              <div className="hidden md:block md:col-span-3">Platform</div>
              <div className="col-span-1 md:col-span-3">Status</div>
              <div className="hidden md:block md:col-span-3 text-right">Manufacture Date</div>
            </div>
          </div>
          <div className="h-[350px] overflow-y-auto">
            {latestSkeletons.map((skeleton, i) => (
              <div
                key={skeleton.id}
                className={clsx(
                  'px-4 py-3 grid grid-cols-2 md:grid-cols-12 gap-2 items-center hover:bg-gray-50 transition-colors duration-150',
                  { 'border-t border-gray-50': i !== 0 }
                )}
              >
                <div className="col-span-1 md:col-span-3">
                  <p className="text-sm font-medium text-gray-900">
                    {skeleton.sk_number}
                  </p>
                  <p className="hidden md:block text-xs text-gray-500">{skeleton.type}</p>
                </div>
                <div className="hidden md:block md:col-span-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                    {skeleton.platform}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-3">
                  <span className={clsx(
                    'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                    statusColors[skeleton.status as keyof typeof statusColors]
                  )}>
                    {skeleton.status}
                  </span>
                </div>
                <div className="hidden md:block md:col-span-3 text-right">
                  <p className="text-sm text-gray-600">
                    {format(new Date(skeleton.created_at), 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Live Updates</span>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center space-x-1">
                <span className={clsx('w-2 h-2 rounded-full', color.split(' ')[0])} />
                <span className="text-xs text-gray-500">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}