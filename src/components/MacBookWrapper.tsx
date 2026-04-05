import { ReactNode } from 'react';

interface MacBookWrapperProps {
  children: ReactNode;
}

export default function MacBookWrapper({ children }: MacBookWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0f1419] to-[#1a1f2e] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#A7EA3B]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#60A5FA]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] scale-[0.75] md:scale-[0.85] lg:scale-95 xl:scale-100">
        {/* MacBook Air 13" Mockup */}
        <div className="relative" style={{ perspective: '2000px' }}>
          {/* Laptop Screen Container */}
          <div 
            className="relative"
            style={{
              transform: 'rotateX(2deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Screen Bezel */}
            <div className="relative bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] rounded-t-2xl p-2.5 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full mt-2"></div>
              </div>

              {/* Screen */}
              <div className="relative bg-[#0F1722] rounded-xl overflow-hidden border-[3px] border-black shadow-inner">
                {/* Content Container - No scroll, scaled content */}
                <div 
                  className="relative bg-[#0F1722] overflow-hidden"
                  style={{ 
                    height: '550px',
                    width: '100%'
                  }}
                >
                  {/* Scale the content to fit without scroll */}
                  <div 
                    className="origin-top-left"
                    style={{
                      transform: 'scale(0.6)',
                      width: '166.67%',
                      height: '166.67%'
                    }}
                  >
                    {children}
                  </div>
                </div>

                {/* Screen Glare Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl"></div>
              </div>
            </div>

            {/* Laptop Base/Keyboard */}
            <div 
              className="relative bg-gradient-to-b from-[#2a2a2a] via-[#1e1e1e] to-[#1a1a1a] pt-2 pb-2 rounded-b-2xl"
              style={{
                boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              {/* Keyboard hint (simplified) */}
              <div className="flex justify-center items-center gap-1 px-8 mb-1.5">
                <div className="flex-1 h-8 bg-gradient-to-b from-[#252525] to-[#1a1a1a] rounded border border-[#1a1a1a]"></div>
                <div className="flex-1 h-8 bg-gradient-to-b from-[#252525] to-[#1a1a1a] rounded border border-[#1a1a1a]"></div>
                <div className="flex-1 h-8 bg-gradient-to-b from-[#252525] to-[#1a1a1a] rounded border border-[#1a1a1a]"></div>
              </div>

              {/* Trackpad */}
              <div className="mx-auto w-44 h-24 bg-gradient-to-b from-[#282828] to-[#222] rounded-xl border border-[#1a1a1a] shadow-inner"></div>
            </div>

            {/* Bottom Edge */}
            <div 
              className="h-1 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-b-3xl mx-2"
              style={{
                boxShadow: '0 30px 90px rgba(0,0,0,0.7)'
              }}
            ></div>
          </div>

          {/* Desk Shadow */}
          <div className="absolute -bottom-6 left-8 right-8 h-10 bg-black/30 blur-3xl rounded-full"></div>
        </div>

        {/* Device Label */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#19232C] rounded-lg border border-white/[0.03]">
            <div className="w-2 h-2 bg-[#A7F3D0] rounded-full animate-pulse"></div>
            <span className="text-[#98A0AC] text-xs">MacBook Air 13" • Live System</span>
          </div>
        </div>
      </div>

      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-gradient-to-r from-[#A7EA3B]/8 to-[#60A5FA]/8 blur-3xl opacity-40"></div>
      </div>
    </div>
  );
}