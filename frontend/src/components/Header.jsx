import React from 'react';
import { Plus, UserPlus } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>
      </div>
    </header>
  );
};

export default Header;