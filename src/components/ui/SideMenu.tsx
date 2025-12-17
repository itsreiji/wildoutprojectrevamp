import React from 'react';

/** SideMenu component matching the provided HTML structure with toggle functionality. */
export default function SideMenu() {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <aside
      id="side-menu"
      className={`
        fixed left-0 top-0 h-full bg-gray-900 md:bg-transparent text-white flex flex-col dark:border-gray-700 
        transition-transform duration-300 ease-in-out z-30 w-64 ${isOpen ? 'translate-x-0' : '[-translate-x-full]'}
      `}
    >
      <div className="flex items-center justify-between py-2 px-[12px] dark:border-gray-700 bg-transparent flex-shrink-0">
        <span className="w-full text-lg font-bold">
          APRICOT <span className="font-normal text-sm ml-2">V1.4</span>
        </span>
        <button
          type="button"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="side-menu-nav"
          className="p-2 rounded-md m-0 mx-auto md:block hidden"
          onClick={toggleMenu}
        >
          <i className="bi bi-list text-xl" aria-label="Open menu"></i>
        </button>
        <button
          type="button"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="side-menu-nav"
          className="p-2 rounded-md m-0 ml-auto md:hidden block"
          onClick={toggleMenu}
        >
          <i className="bi bi-x-lg text-xl" aria-label="Close menu"></i>
        </button>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Search */}
        <div className="flex-shrink-0 p-2">
          <div className="relative pr-2">
            <input
              placeholder="Search Menu..."
              className="w-full text-sm rounded-full px-4 text-white placeholder-white/60 bg-black bg-opacity-25 p-3 rounded-full border-[1px] border-[solid] border-[rgba(0,0,0,0.05)] [box-shadow:0_1px_0_rgba(255,_255,_255,_0.1)]"
              type="text"
              value=""
            />
            <i className="bi bi-search absolute top-1/2 right-6 -translate-y-1/2 text-white" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-black/30 scrollbar-track-transparent hover:scrollbar-thumb-black/50">
          <nav
            id="side-menu-nav"
            className="flex flex-col px-2 pb-2"
            role="navigation"
            aria-label="Main menu"
          >
            {/* DESIGN KIT MENU */}
            <div className="mb-3 bg-black bg-opacity-25 p-2 rounded-2xl border-[1px] border-[solid] border-[rgba(0,0,0,0.05)] [box-shadow:0_1px_0_rgba(255,_255,_255,_0.1)]">
              <div className="flex items-center justify-between text-xs font-semibold text-white dark:text-white uppercase px-3 py-2">
                <span className="px-3 py-1 bg-black bg-opacity-30 rounded-xl">DESIGN KIT MENU</span>
                <i className="bi bi-gear-fill" />
              </div>
              <ul className="flex flex-col space-y-1" role="menu">
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-speedometer2 text-lg" aria-label="Dashboard" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Dashboard</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-envelope text-lg" aria-label="Mail" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Mail</span>
                    <span className="text-xs font-medium bg-blue-500 text-white px-2 py-0.5 rounded-full ml-auto">289</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-gem text-lg" aria-label="Icons" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Icons</span>
                    <span className="text-xs font-medium bg-green-500 text-white px-2 py-0.5 rounded-full ml-auto">New</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-file-earmark-plus text-lg" aria-label="Extra Page" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Extra Page</span>
                    <i className="bi bi-chevron-down text-sm ml-auto transition-transform duration-200" aria-label="Submenu" />
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-box-arrow-in-right text-lg" aria-label="Login" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Login</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-person-plus text-lg" aria-label="Sign Up" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Sign Up</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* WIDGET MENU */}
            <div className="mb-3 bg-black bg-opacity-25 p-2 rounded-2xl border-[1px] border-[solid] border-[rgba(0,0,0,0.05)] [box-shadow:0_1px_0_rgba(255,_255,_255,_0.1)]">
              <div className="flex items-center justify-between text-xs font-semibold text-white dark:text-white uppercase px-3 py-2">
                <span className="px-3 py-1 bg-black bg-opacity-30 rounded-xl">WIDGET MENU</span>
                <i className="bi bi-gear-fill" />
              </div>
              <ul className="flex flex-col space-y-1" role="menu">
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-journal-richtext text-lg" aria-label="Blog App" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Blog App</span>
                    <i className="bi bi-chevron-down text-sm ml-auto transition-transform duration-200" aria-label="Submenu" />
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-puzzle text-lg" aria-label="UI Element" />
                    <span className="ml-3 flex-grow whitespace-nowrap">UI Element</span>
                    <i className="bi bi-chevron-down text-sm ml-auto transition-transform duration-200" aria-label="Submenu" />
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-image text-lg" aria-label="Media" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Media</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* COMPONENT KIT MENU */}
            <div className="mb-3 bg-black bg-opacity-25 p-2 rounded-2xl border-[1px] border-[solid] border-[rgba(0,0,0,0.05)] [box-shadow:0_1px_0_rgba(255,_255,_255,_0.1)]">
              <div className="flex items-center justify-between text-xs font-semibold text-white dark:text-white uppercase px-3 py-2">
                <span className="px-3 py-1 bg-black bg-opacity-30 rounded-xl">COMPONENT KIT MENU</span>
                <i className="bi bi-gear-fill" />
              </div>
              <ul className="flex flex-col space-y-1" role="menu">
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-pencil-square text-lg" aria-label="Form" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Form</span>
                    <i className="bi bi-chevron-down text-sm ml-auto transition-transform duration-200" aria-label="Submenu" />
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-table text-lg" aria-label="Tables" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Tables</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-bar-chart-line text-lg" aria-label="Map" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Map</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* SYSTEM MENU */}
            <div className="mb-3 bg-black bg-opacity-25 p-2 rounded-2xl border-[1px] border-[solid] border-[rgba(0,0,0,0.05)] [box-shadow:0_1px_0_rgba(255,_255,_255,_0.1)]">
              <div className="flex items-center justify-between text-xs font-semibold text-white dark:text-white uppercase px-3 py-2">
                <span className="px-3 py-1 bg-black bg-opacity-30 rounded-xl">SYSTEM MENU</span>
                <i className="bi bi-gear-fill" />
              </div>
              <ul className="flex flex-col space-y-1" role="menu">
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-box-arrow-in-right text-lg" aria-label="Login" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Login</span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="/"
                    role="menuitem"
                    className="group relative text-sm flex items-center py-2 px-3 rounded-md text-white dark:text-white hover:rounded-2xl hover:bg-black/20 hover:text-white dark:hover:text-white"
                  >
                    <i className="bi bi-person-plus text-lg" aria-label="Sign Up" />
                    <span className="ml-3 flex-grow whitespace-nowrap">Sign Up</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Visitor Count */}
            <div className="p-3 mt-auto flex-shrink-0 bg-black/20">
              <div className="bg-white/10 dark:bg-gray-700/50 rounded-lg p-3 text-center text-white">
                <div className="relative inline-block">
                  <svg className="w-24 h-24" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-200 dark:text-gray-600" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="339.292" strokeDashoffset="101.787" className="text-cyan-400 transform -rotate-90 origin-center" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">369</span>
                    <span className="text-xs text-white">VISITORS</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
}