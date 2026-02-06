import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from "html5-qrcode";
import './App.css';

const QRScanner = () => {
    const [notification, setNotification] = useState({ show: false, type: '', msg: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
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
            showNotif('error', 'Camera access denied');
        });

        // Cleanup on unmount
        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => html5QrCode.clear());
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

            {/* Camera Mount Point */}
            <div id="reader" style={{ width: '100%', height: '100vh', objectFit: 'cover' }}></div>

            {/* Visual Overlays */}
            <div className="scanner-overlay">
                {!isProcessing ? (
                    <>
                        <div className="viewfinder">
                            <div className="corner tl"></div><div className="corner tr"></div>
                            <div className="corner bl"></div><div className="corner br"></div>
                            <div className="laser"></div>
                        </div>
                        <div className="hint-text">Position QR code within frame</div>
                    </>
                ) : (
                    <button className="reset-btn" onClick={handleReset}>Scan Again</button>
                )}
            </div>

            <style>{`
        .scanner-page { position: fixed; inset: 0; background: black; color: white; z-index: 999; }
        
        .scanner-header { position: absolute; top: 0; left: 0; right: 0; padding: 50px 20px 20px; z-index: 20; }
        .cancel-link { color: white; text-decoration: none; display: flex; align-items: center; gap: 6px; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        
        /* Hide html5-qrcode standard UI elements */
        #reader__scan_region { background: transparent !important; }
        #reader video { object-fit: cover; height: 100vh !important; }
        
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
        
        .reset-btn { pointer-events: auto; background: rgba(255,255,255,0.2); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 12px 24px; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; }
      `}</style>
        </div>
    );
};

export default QRScanner;
