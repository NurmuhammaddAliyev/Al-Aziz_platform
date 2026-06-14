import React from 'react';

export default function TestPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#030303',
            color: '#fff',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <h1>🧪 Frontend Test Page</h1>
            <p>Frontend ishlaydi!</p>
            <button
                onClick={() => alert('Button ishlaydi!')}
                style={{
                    padding: '12px 24px',
                    background: '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Test Button
            </button>
            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <h3>Masalalar:</h3>
                <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                    <li>AuthModal ishlamaydi</li>
                    <li>LandingPage render xatosi</li>
                    <li>Header component error</li>
                </ul>
            </div>
        </div>
    );
}
