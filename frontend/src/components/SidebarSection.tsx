import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  matchPaths?: string[]; // e.g. ['/orders', '/products']
};

function SidebarSection({
  title,
  children,
  defaultOpen = false,
  matchPaths = [],
}: SidebarSectionProps) {
  const location = useLocation();
  const [open, setOpen] = useState(defaultOpen);

  const isActive = matchPaths.some((path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  });

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`group w-full flex items-center justify-between px-6 py-2 text-xs uppercase text-left rounded-none 
    ${
      isActive && !open
        ? 'bg-clearcut-light border-r-4 border-clearcut-dark text-clearcut font-semibold'
        : 'text-black hover:bg-clearcut-light hover:text-clearcut'
    }`}
      >
        <span>{title}</span>

        <ChevronRight
          className={`
      w-4 h-4 transform transition-transform duration-500
      ${open ? 'rotate-90' : 'rotate-0'}
      ${isActive && !open ? 'text-clearcut' : 'text-black'} 
      group-hover:text-clearcut
    `}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col">{children}</ul>
      </div>
    </div>
  );
}

export default SidebarSection;
