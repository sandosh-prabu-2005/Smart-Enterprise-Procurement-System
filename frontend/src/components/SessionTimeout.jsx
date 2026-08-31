import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const TIMEOUT_LIMIT = 14.5 * 60 * 1000; // 14.5 minutes of idle

export default function SessionTimeout({ user, onLogout }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    onLogout();
  }, [onLogout]);

  const triggerWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(30);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleLogout]);

  const resetIdleTimer = useCallback(() => {
    if (showWarning) return; // Don't reset if warning modal is active

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      triggerWarning();
    }, TIMEOUT_LIMIT);
  }, [showWarning, triggerWarning]);

  const extendSession = () => {
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    resetIdleTimer();
  };

  useEffect(() => {
    if (!user) return;

    // Track user inputs
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, resetIdleTimer]);

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--border-radius-card)',
        padding: '28px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-hover)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: 'var(--primary-light)',
            padding: '10px',
            borderRadius: '50%',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: 'var(--color-black)' }}>
              Session Timeout Warning
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
              Your session has been idle for a while. You will be automatically signed out in <strong>{countdown} seconds</strong> due to inactivity.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleLogout}
            className="btn-enterprise secondary"
            style={{ height: '36px', padding: '0 16px' }}
          >
            Sign Out
          </button>
          <button
            onClick={extendSession}
            className="btn-enterprise primary"
            style={{ height: '36px', padding: '0 16px' }}
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
}
