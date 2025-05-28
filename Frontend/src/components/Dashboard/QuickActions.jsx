import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const ActionButton = ({ icon: Icon, label, onClick, color = 'blue', notification }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-full p-3 space-x-3 text-${color}-600 bg-${color}-50 rounded-lg hover:bg-${color}-100 transition-colors duration-200 relative`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
    {notification && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {notification}
      </span>
    )}
  </button>
);

const QuickActions = ({ user }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: PlusCircleIcon,
      label: 'New Request',
      onClick: () => navigate('/requests/new'),
      color: 'blue',
      notification: user?.pendingRequests || 0
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Messages',
      onClick: () => navigate('/messages'),
      color: 'purple',
      notification: user?.unreadMessages || 0
    },
    {
      icon: UserCircleIcon,
      label: 'Profile',
      onClick: () => navigate('/profile'),
      color: 'green'
    },
    {
      icon: ClipboardDocumentCheckIcon,
      label: 'Active Exchanges',
      onClick: () => navigate('/exchanges'),
      color: 'orange',
      notification: user?.activeExchanges || 0
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <p className="mt-1 text-sm text-gray-500">Access frequently used features</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 