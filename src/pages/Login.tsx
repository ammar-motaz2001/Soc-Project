import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetMessageType, setResetMessageType] = useState<'error' | 'success'>('error');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setMessage('Please enter username and password');
      setMessageType('error');
      return;
    }

    if (login(username, password)) {
      navigate('/');
    } else {
      setMessage('Invalid username or password');
      setMessageType('error');
    }
  };

  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      setResetMessageType('error');
      return;
    }

    if (resetPassword(resetEmail)) {
      setResetMessage('Password reset link has been sent to your email');
      setResetMessageType('success');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } else {
      setResetMessage('Email address not found in the system');
      setResetMessageType('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F1722]">
      <div className="w-full max-w-[600px] bg-gradient-to-b from-white/[0.03] to-white/[0.01] py-12 px-10 rounded-[20px] shadow-[0_8px_26px_rgba(0,0,0,0.45)] border border-white/[0.04] backdrop-blur-[6px] text-center">
        
        <h1 className="text-4xl m-0 mb-2">Login to IRAS</h1>
        <div className="text-sm text-[#98A0AC] mb-8">
          Incident Response Automation System
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="text-left mb-5">
            <label htmlFor="login-username" className="text-[#98A0AC] text-sm mb-2 block">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setMessage('');
              }}
              placeholder="username"
              className="w-full py-4 px-4 bg-[#0f1a22] border border-white/[0.05] rounded-[10px] text-[#E6EEF6] text-base outline-none focus:border-[#A7EA3B]/30 transition-colors"
            />
          </div>

          <div className="text-left mb-3">
            <label htmlFor="login-password" className="text-[#98A0AC] text-sm mb-2 block">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage('');
              }}
              placeholder="password"
              className="w-full py-4 px-4 bg-[#0f1a22] border border-white/[0.05] rounded-[10px] text-[#E6EEF6] text-base outline-none focus:border-[#A7EA3B]/30 transition-colors"
            />
          </div>

          <div className="text-right mb-5">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-[#A7EA3B] text-sm hover:text-[#98d932] transition-colors cursor-pointer bg-transparent border-0"
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              messageType === 'error' 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-green-500/10 border border-green-500/20 text-green-400'
            }`}>
              {messageType === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#A7EA3B] text-[#07220a] py-4 px-6 rounded-[10px] border-0 cursor-pointer text-base w-full hover:bg-[#98d932] transition-colors font-medium"
            >
              Sign in
            </button>
          </div>

        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-[500px] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-8 rounded-[20px] shadow-[0_8px_26px_rgba(0,0,0,0.45)] border border-white/[0.04] backdrop-blur-[6px] relative">
            
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetMessage('');
              }}
              className="absolute top-6 right-6 text-[#98A0AC] hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#A7EA3B]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#A7EA3B]" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl m-0">Reset Password</h2>
                <p className="text-sm text-[#98A0AC] m-0 mt-1">Forgot your password?</p>
              </div>
            </div>

            <p className="text-[#98A0AC] text-sm mb-6 text-left">
              Enter your registered email address and we'll send you a password reset link
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="text-left mb-5">
                <label htmlFor="reset-email" className="text-[#98A0AC] text-sm mb-2 block">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetMessage('');
                  }}
                  placeholder="e.g. admin@iras.com"
                  className="w-full py-4 px-4 bg-[#0f1a22] border border-white/[0.05] rounded-[10px] text-[#E6EEF6] text-base outline-none focus:border-[#A7EA3B]/30 transition-colors"
                  dir="ltr"
                />
              </div>

              {resetMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                  resetMessageType === 'error' 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                    : 'bg-green-500/10 border border-green-500/20 text-green-400'
                }`}>
                  {resetMessageType === 'error' ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{resetMessage}</span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="flex-1 bg-white/[0.05] text-white py-3 px-6 rounded-[10px] border border-white/[0.1] cursor-pointer text-base hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#A7EA3B] text-[#07220a] py-3 px-6 rounded-[10px] border-0 cursor-pointer text-base hover:bg-[#98d932] transition-colors font-medium"
                >
                  Send Reset Link
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}