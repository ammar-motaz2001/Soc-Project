import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useSOC } from '../context/SOCContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { getStats } = useSOC();
  const stats = getStats();

  return (
    <div className="flex min-h-screen bg-[#0F1722]">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-auto pt-[70px] pb-[80px] lg:pt-8 lg:pb-8">
        {children}
      </main>
    </div>
  );
}