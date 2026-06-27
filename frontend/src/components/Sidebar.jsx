import React from 'react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const navItems = [
    { name: 'Dashboard', clickable: true },
    { name: 'Analytics', clickable: false },
    { name: 'Algorithms', clickable: true },
    { name: 'Users', clickable: false },
    { name: 'Settings', clickable: false }
  ];

  const handleClick = (name) => {
    if (name === 'Dashboard' || name === 'Algorithms') {
      setCurrentPage(name.toLowerCase());
    }
  };

  return (
    <aside className="hidden md:flex h-[calc(100vh-64px)] w-64 flex-col border-r border-neutral-200 bg-white p-4">
      {/* Sidebar menu items */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.name.toLowerCase() === currentPage;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleClick(item.name)}
              disabled={!item.clickable}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : item.clickable
                    ? 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer'
                    : 'text-neutral-300 cursor-not-allowed'
              }`}
            >
              <span>{item.name}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / version info placeholder */}
      <div className="mt-auto border-t border-neutral-100 pt-4 text-center">
        <p className="text-[10px] text-neutral-400">API Traffic Manager</p>
        <p className="text-[10px] text-neutral-400">v1.2.0-skeleton</p>
      </div>
    </aside>
  );
}
