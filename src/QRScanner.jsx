import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from "html5-qrcode";
import './App.css';

const QRScanner = () => {
    const [notification, setNotification] = useState({ show: false, type: '', msg: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const scannerRef = useRef(null);
    const navigate = useNavigate();

    const startScanner = () => {
        setCameraError(false);
        // Initialize Scanner
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => handleScan(decodedText, html5QrCode)
        ).catch(err => {
            console.error("Camera failed", err);
            setCameraError(true);
            showNotif('error', 'Camera access denied');
        });
    };

    useEffect(() => {
        startScanner();

        // Cleanup on unmount
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current.clear());
            }
        };
    }, []);

    const showNotif = (type, msg) => {
        setNotification({ show: true, type, msg });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
    };

    const handleScan = async (decodedText, scannerInstance) => {
        if (isProcessing) return;
        setIsProcessing(true);

        scannerInstance.pause(); // Pause camera

        try {
            const res = await fetch("https://api-officeless-dev.mekari.com/28086/scanQR", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: decodedText })
            });

            if (res.ok) {
                showNotif('success', 'Verified Successfully');
            } else {
                showNotif('error', 'Verification Failed');
            }
        } catch (err) {
            showNotif('error', 'Network Error');
        }
    };

    const handleReset = () => {
        setIsProcessing(false);
        if (scannerRef.current) scannerRef.current.resume();
    };

    return (
        <div className="scanner-page">
            {/* Notification */}
            <div className={`dynamic-island ${notification.show ? 'show' : ''} ${notification.type}`}>
                {notification.type === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
                <span>{notification.msg}</span>
            </div>

            {/* Persistent Back Button */}
            <div className="scanner-header">
                <Link to="/" className="cancel-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back
                </Link>
            </div>

            {/* Camera Mount Point */}
            <div id="reader" style={{ width: '100%', height: '100vh', objectFit: 'cover' }}></div>

            {/* Visual Overlays */}
            <div className="scanner-overlay">
                {!isProcessing ? (
                    <>
                        {!cameraError ? (
                            <div className="viewfinder">
                                <div className="corner tl"></div><div className="corner tr"></div>
                                <div className="corner bl"></div><div className="corner br"></div>
                                <div className="laser"></div>
                            </div>
                        ) : (
                            <div className="error-container">
                                <div className="error-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                </div>
                                <h3>Camera Access Required</h3>
                                <p>Please enable camera permissions in your browser settings to use the scanner.</p>
                                <div className="error-actions">
                                    <button className="reset-btn" onClick={startScanner}>Try Again</button>
                                    <button className="reset-btn secondary" onClick={() => navigate('/')}>Back to Calendar</button>
                                </div>
                            </div>
                        )}
                        {!cameraError && <div className="hint-text">Position QR code within frame</div>}
                    </>
                ) : (
                    <button className="reset-btn" onClick={handleReset}>Scan Again</button>
                )}
            </div>

            <style>{`
        .scanner-page { position: fixed; inset: 0; background: black; color: white; z-index: 999; overflow: hidden; }
        
        .scanner-header { position: absolute; top: 0; left: 0; right: 0; padding: 40px 20px 20px; z-index: 20; }
        .cancel-link { color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 18px; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }
        
        #reader__scan_region { background: transparent !important; }
        #reader video { object-fit: cover !important; height: 100vh !important; }
        
        .scanner-overlay { position: absolute; inset: 0; pointer-events: none; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; }
        
        .viewfinder { width: 260px; height: 260px; border-radius: 30px; box-shadow: 0 0 0 4000px rgba(0,0,0,0.6); position: relative; }
        
        .corner { position: absolute; width: 40px; height: 40px; border: 5px solid var(--accent); border-radius: 4px; }
        .tl { top: -2px; left: -2px; border-bottom: none; border-right: none; border-top-left-radius: 30px; }
        .tr { top: -2px; right: -2px; border-bottom: none; border-left: none; border-top-right-radius: 30px; }
        .bl { bottom: -2px; left: -2px; border-top: none; border-right: none; border-bottom-left-radius: 30px; }
        .br { bottom: -2px; right: -2px; border-top: none; border-left: none; border-bottom-right-radius: 30px; }
        
        .laser { width: 100%; height: 2px; background: var(--accent); box-shadow: 0 0 20px var(--accent); position: absolute; animation: scan 2s infinite ease-in-out; }
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        
        .hint-text { margin-top: 30px; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 20px; font-size: 13px; color: rgba(255,255,255,0.9); }
        
        .error-container { 
          pointer-events: auto; 
          text-align: center; 
          padding: 30px; 
          background: rgba(28, 28, 30, 0.8); 
          backdrop-filter: blur(20px); 
          border-radius: 30px; 
          width: 80%; 
          max-width: 320px; 
          border: 1px solid rgba(255,255,255,0.1);
        }
        .error-icon { color: var(--danger); margin-bottom: 20px; }
        .error-container h3 { margin: 0 0 10px; font-size: 18px; font-weight: 700; }
        .error-container p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 24px; }
        
        .error-actions { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        
        .reset-btn { 
          pointer-events: auto; 
          background: var(--accent); 
          border: none;
          color: white; 
          padding: 14px 24px; 
          border-radius: 30px; 
          font-size: 16px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: transform 0.2s, background 0.2s;
        }
        .reset-btn:active { transform: scale(0.95); }
        .reset-btn.secondary { background: rgba(255,255,255,0.1); }
      `}</style>
        </div>
    );
};

export default QRScanner;
