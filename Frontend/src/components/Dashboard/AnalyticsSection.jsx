import React from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</h4>
        {trend && (
          <p className={`text-sm mt-2 flex items-center ${trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`mr-1 ${trend.type === 'increase' ? 'rotate-0' : 'rotate-180'}`}>↑</span>
            {trend.value}% from last month
          </p>
        )}
      </div>
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const AnalyticsSection = ({ stats }) => {
  const statCards = [
    {
      title: "Total Exchanges",
      value: stats.totalExchanges,
      icon: ChartBarIcon,
      trend: { type: 'increase', value: 12 }
    },
    {
      title: "Active Requests",
      value: stats.activeRequests,
      icon: UserGroupIcon,
      trend: { type: 'increase', value: 8 }
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: ChatBubbleLeftRightIcon,
      trend: { type: 'decrease', value: 3 }
    },
    {
      title: "Profile Views",
      value: stats.profileViews,
      icon: EyeIcon,
      trend: { type: 'increase', value: 24 }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AnalyticsSection; 