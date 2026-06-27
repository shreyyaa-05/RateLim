import React from 'react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-6">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-neutral-900"></div>
        <span className="font-semibold text-neutral-900">API Traffic Manager</span>
      </div>

      {/* Center Search / Placeholder info */}
      <div className="hidden md:block w-72">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <div className="h-4 w-4 rounded-full border-2 border-neutral-400"></div>
          </div>
          <input
            type="text"
            placeholder="Search resources..."
            disabled
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-3 text-sm text-neutral-400 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Right Actions / User Profile */}
      <div className="flex items-center gap-4">
        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500 font-medium">
          <span className="h-2 w-2 rounded-full bg-neutral-900"></span>
          <span>System Online</span>
        </div>

        {/* User avatar placeholder */}
        <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
          <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-neutral-900 leading-none">Admin User</p>
            <p className="text-[10px] text-neutral-400 leading-none mt-1">system@admin.local</p>
          </div>
        </div>
      </div>
    </header>
  );
}
