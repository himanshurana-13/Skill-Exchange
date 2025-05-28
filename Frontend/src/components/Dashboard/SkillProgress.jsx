import React from 'react';
import { 
  CodeBracketIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  MegaphoneIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SkillIcon = ({ skill }) => {
  const icons = {
    'Web Development': CodeBracketIcon,
    'Graphic Design': PaintBrushIcon,
    'Content Writing': PencilSquareIcon,
    'Digital Marketing': MegaphoneIcon,
    'UI/UX Design': ComputerDesktopIcon
  };
  
  const Icon = icons[skill] || CodeBracketIcon;
  return <Icon className="w-5 h-5" />;
};

const SkillProgress = ({ skills }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Skill Progress</h3>
        <p className="mt-1 text-sm text-gray-500">Track your skill development</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <SkillIcon skill={skill.name} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                </div>
                <span className="text-sm text-gray-500">{skill.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all skills →
        </button>
      </div>
    </div>
  );
};

export default SkillProgress; 