import {
    BanknotesIcon,
    ClockIcon,
    InboxIcon,
    ArrowPathIcon,
  } from '@heroicons/react/24/outline';

import { lusitana } from '../font';
import clsx from 'clsx';
import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

const iconMap = {
  yearly: BanknotesIcon,
  // monthly: UserGroupIcon,
  monthly: CalendarDays,
  released: ClockIcon,
  recent: InboxIcon,
};

const cardStyles = {
  yearly: 'from-blue-50 to-blue-100',
  monthly: 'from-purple-50 to-purple-100',
  released: 'from-green-50 to-green-100',
  recent: 'from-orange-50 to-orange-100',
};

const iconStyles = {
  yearly: 'text-blue-600 bg-blue-50',
  monthly: 'text-purple-600 bg-purple-50',
  released: 'text-green-600 bg-green-50',
  recent: 'text-orange-600 bg-orange-50',
};

export default async function CardWrapper() {
  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      {/* <Card title="yearly" value={totalPaidInvoices} type="yearly" />
      <Card title="released" value={totalReleasedInvoices} type="released" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total monthly"
        value={numberOfmonthly}
        type="monthly"
      /> */}
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'recent' | 'monthly' | 'released' | 'yearly';
}) {
  const Icon = iconMap[type];
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${cardStyles[type].split(' ')[0].replace('from-', '')} 0%, ${cardStyles[type].split(' ')[1].replace('to-', '')} 100%)`
        }}
      />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'rounded-lg p-2.5',
              iconStyles[type]
            )}>
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Refresh data"
          >
            <ArrowPathIcon 
              className={clsx(
                "h-4 w-4 text-gray-500",
                isRefreshing && "animate-spin"
              )} 
            />
          </button>
        </div>
        <div className="mt-4">
          <p className={`${lusitana.className} text-2xl font-bold text-gray-900`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Updated {format(lastUpdated, 'HH:mm:ss')}
          </p>
        </div>
      </div>
    </div>
  );
}
  