import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, Database, FileText, BookOpen, FolderOpen, LogOut, Menu, BookMarked, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home, shortLabel: 'Home' },
  { path: '/alert-queue', label: 'Alert queue', icon: Bell, shortLabel: 'Queue' },
  { path: '/automated-actions', label: 'Automated Actions', icon: Zap, shortLabel: 'Auto' },
  { path: '/siem', label: 'SIEM', icon: Database, shortLabel: 'SIEM' },
  { path: '/documentation', label: 'Documentation', icon: FileText, shortLabel: 'Docs' },
  { path: '/playbooks', label: 'Playbooks', icon: BookOpen, shortLabel: 'Books' },
  { path: '/case-reports', label: 'Case reports', icon: FolderOpen, shortLabel: 'Cases' },
];

const guideItem = { path: '/guide', label: 'Guide', icon: BookMarked, shortLabel: 'Guide' };

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-[#0F1722] border-r border-white/[0.03]">
        <div className="p-6 border-b border-white/[0.03]">
          <div className="text-[#A7EA3B] text-xl">IRAS</div>
          <div className="text-[#98A0AC] text-xs mt-1">
            Incident Response Automation System
          </div>
        </div>

        <nav className="flex-1 flex flex-col p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-lg text-[14px] no-underline transition-colors flex items-center gap-3 mb-1 ${
                  isActive
                    ? 'text-[#A7EA3B] bg-gradient-to-r from-[#A7EA3B]/[0.06] to-transparent'
                    : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          
          {/* Separator before Guide */}
          <div className="h-px bg-white/[0.03] my-3 mx-2"></div>
          
          <Link
            key={guideItem.path}
            to={guideItem.path}
            className={`px-4 py-3 rounded-lg text-[14px] no-underline transition-colors flex items-center gap-3 mb-1 ${
              location.pathname === guideItem.path
                ? 'text-[#A7EA3B] bg-gradient-to-r from-[#A7EA3B]/[0.06] to-transparent'
                : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
            }`}
          >
            <BookMarked size={18} />
            {guideItem.label}
          </Link>
        </nav>

        <div className="p-4 border-t border-white/[0.03]">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg text-[14px] text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6] transition-colors flex items-center gap-3"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0F1722] border-b border-white/[0.03] px-4 py-3 flex items-center justify-between z-40">
        <div>
          <div className="text-[#A7EA3B]">IRAS</div>
          <div className="text-[#98A0AC] text-[8px] leading-tight">
            Incident Response Automation System
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6] transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <div className="lg:hidden fixed top-[60px] left-0 right-0 bg-[#19232C] border-b border-white/[0.03] z-40 max-h-[calc(100vh-140px)] overflow-y-auto">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={`px-3 py-3 rounded-lg text-[14px] no-underline transition-colors flex items-center gap-3 ${
                    isActive
                      ? 'text-[#A7EA3B] bg-gradient-to-r from-[#A7EA3B]/[0.06] to-transparent'
                      : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Separator before Guide */}
            <div className="h-px bg-white/[0.03] my-2"></div>
            
            <Link
              key={guideItem.path}
              to={guideItem.path}
              onClick={() => setShowMenu(false)}
              className={`px-3 py-3 rounded-lg text-[14px] no-underline transition-colors flex items-center gap-3 ${
                location.pathname === guideItem.path
                  ? 'text-[#A7EA3B] bg-gradient-to-r from-[#A7EA3B]/[0.06] to-transparent'
                  : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
              }`}
            >
              <BookMarked size={18} />
              {guideItem.label}
            </Link>
            <button
              onClick={() => {
                setShowMenu(false);
                handleLogout();
              }}
              className="px-3 py-3 rounded-lg text-[14px] text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6] transition-colors flex items-center gap-3 border-t border-white/[0.03] mt-2 pt-3"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F1722] border-t border-white/[0.03] px-2 py-2 flex items-center justify-around z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg no-underline transition-colors ${
                isActive
                  ? 'text-[#A7EA3B] bg-[#A7EA3B]/[0.06]'
                  : 'text-[#98A0AC]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}