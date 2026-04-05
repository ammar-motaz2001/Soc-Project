import { useState } from 'react';
import { Monitor, X } from 'lucide-react';

interface DevicePreviewProps {
  children: React.ReactNode;
}

interface LaptopDevice {
  name: string;
  screenWidth: number;
  screenHeight: number;
  frameColor: string;
  brand: string;
  baseColor: string;
}

const laptopDevices: LaptopDevice[] = [
  { name: 'MacBook Pro 16"', screenWidth: 1728, screenHeight: 1117, frameColor: '#1d1d1f', brand: 'Apple', baseColor: '#2d2d2f' },
  { name: 'MacBook Air 13"', screenWidth: 1440, screenHeight: 900, frameColor: '#1d1d1f', brand: 'Apple', baseColor: '#2d2d2f' },
  { name: 'Dell XPS 15"', screenWidth: 1920, screenHeight: 1200, frameColor: '#2c2c2c', brand: 'Dell', baseColor: '#383838' },
  { name: 'HP Spectre 14"', screenWidth: 1920, screenHeight: 1280, frameColor: '#1a1a1a', brand: 'HP', baseColor: '#2a2a2a' },
  { name: 'Lenovo ThinkPad X1', screenWidth: 1920, screenHeight: 1200, frameColor: '#000000', brand: 'Lenovo', baseColor: '#1a1a1a' },
  { name: 'Surface Laptop 5', screenWidth: 1536, screenHeight: 1024, frameColor: '#5e5e5e', brand: 'Microsoft', baseColor: '#6e6e6e' },
  { name: 'ASUS ZenBook', screenWidth: 1920, screenHeight: 1080, frameColor: '#2d3748', brand: 'ASUS', baseColor: '#3d4758' },
  { name: 'Razer Blade 15"', screenWidth: 1920, screenHeight: 1080, frameColor: '#000000', brand: 'Razer', baseColor: '#0a0a0a' },
];

export default function DevicePreview({ children }: DevicePreviewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(1); // MacBook Air 13"
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const currentDevice = laptopDevices[selectedDevice];

  // Calculate scale to fit the laptop on screen
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1400;
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800;
  
  const scale = Math.min(maxWidth / currentDevice.screenWidth, maxHeight / currentDevice.screenHeight, 1) * 0.85;

  if (!isPreviewMode) {
    return (
      <>
        {/* Toggle to Preview Mode Button */}
        <button
          onClick={() => setIsPreviewMode(true)}
          className="fixed bottom-4 right-4 z-[100] px-4 py-2 bg-[#19232C] border border-white/10 rounded-lg text-[#E6EEF6] hover:bg-[#1f2937] transition-colors flex items-center gap-2 shadow-xl"
        >
          <Monitor className="w-4 h-4" />
          Device Preview
        </button>
        {children}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1722] to-[#0a0e1a] overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsPreviewMode(false)}
        className="fixed top-4 right-4 z-[100] px-4 py-2 bg-[#19232C] border border-white/10 rounded-lg text-[#E6EEF6] hover:bg-[#1f2937] transition-colors flex items-center gap-2 shadow-xl"
      >
        <X className="w-4 h-4" />
        Exit Preview Mode
      </button>

      {/* Device Selector */}
      <div className="fixed top-4 left-4 z-[100]">
        <button
          onClick={() => setShowDeviceMenu(!showDeviceMenu)}
          className="px-4 py-2 bg-[#19232C] border border-white/10 rounded-lg text-[#E6EEF6] hover:bg-[#1f2937] transition-colors flex items-center gap-2 shadow-xl"
        >
          <Monitor className="w-4 h-4" />
          {currentDevice.name}
          <span className="text-xs opacity-60">▾</span>
        </button>

        {showDeviceMenu && (
          <div className="absolute top-full left-0 mt-2 bg-[#19232C] border border-white/10 rounded-lg overflow-hidden min-w-[220px] shadow-2xl">
            {laptopDevices.map((device, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedDevice(index);
                  setShowDeviceMenu(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                  index === selectedDevice ? 'bg-white/5 text-[#A7EA3B]' : 'text-[#E6EEF6]'
                }`}
              >
                <div className="font-medium">{device.name}</div>
                <div className="text-xs text-[#98A0AC] mt-0.5">
                  {device.screenWidth} × {device.screenHeight} • {device.brand}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Laptop Frame Container */}
      <div className="w-full h-full flex items-center justify-center p-8">
        <div
          className="relative transition-all duration-500"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          {/* Complete Laptop */}
          <div className="relative">
            {/* Screen Section */}
            <div className="relative">
              {/* Screen Bezel */}
              <div
                className="relative rounded-xl shadow-2xl"
                style={{
                  backgroundColor: currentDevice.frameColor,
                  padding: '8px 8px 8px 8px',
                  width: currentDevice.screenWidth + 16,
                }}
              >
                {/* Camera Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0a0a0a] border border-white/20 z-10 shadow-inner" />

                {/* Screen */}
                <div
                  className="relative overflow-hidden shadow-lg rounded-sm"
                  style={{
                    width: currentDevice.screenWidth,
                    height: currentDevice.screenHeight,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Screen Content */}
                  <div className="w-full h-full overflow-hidden">
                    {children}
                  </div>
                </div>
              </div>
            </div>

            {/* Shadow under laptop */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-2xl opacity-30"
              style={{
                width: currentDevice.screenWidth * 0.8,
                height: '40px',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Device Info */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[#98A0AC] text-sm font-medium">
              {currentDevice.brand} • {currentDevice.screenWidth} × {currentDevice.screenHeight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}