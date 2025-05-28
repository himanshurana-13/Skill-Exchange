import React from 'react';
import { 
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ActivityItem = ({ type, title, description, time, icon: Icon }) => (
  <div className="flex space-x-3">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
      type === 'message' ? 'bg-blue-100' :
      type === 'rating' ? 'bg-yellow-100' :
      type === 'update' ? 'bg-purple-100' :
      'bg-green-100'
    }`}>
      <Icon className={`w-5 h-5 ${
        type === 'message' ? 'text-blue-600' :
        type === 'rating' ? 'text-yellow-600' :
        type === 'update' ? 'text-purple-600' :
        'text-green-600'
      }`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-0.5">{time}</p>
    </div>
  </div>
);

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'rating':
        return StarIcon;
      case 'update':
        return ArrowPathIcon;
      case 'exchange':
        return CheckCircleIcon;
      default:
        return CheckCircleIcon;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-500">Track your latest interactions and updates</p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={index}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  )}
                  <ActivityItem
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    icon={getActivityIcon(activity.type)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed; 