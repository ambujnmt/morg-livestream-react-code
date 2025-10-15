import React from 'react';
import { FaBars, FaBell } from 'react-icons/fa';

const Header = ({ onToggle, collapsed, sidebarWidth }) => {
    const user = JSON.parse(localStorage.getItem('user')) || { name: '', email: '', mobile: '' };

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        const initials = names.map(n => n[0].toUpperCase());
        return initials.slice(0, 2).join('');
    };

    return (
        <div
            className="bg-white shadow-sm d-flex align-items-center justify-content-between px-4 position-fixed top-0"
            style={{
                height: '64px',
                left: sidebarWidth,
                width: `calc(100% - ${sidebarWidth})`,
                zIndex: 1050,
                borderBottom: '1px solid #dee2e6',
                transition: 'all 0.3s ease',
            }}
        >
            <div className="d-flex align-items-center gap-3">
                <button className="btn btn-outline-success btn-sm" onClick={onToggle}>
                    <FaBars />
                </button>

                <img src="/logo.jpg" alt="Logo" width={36} height={36} />
                <span className="fw-bold fs-5 text-dark">Live stream App</span>
            </div>

            <div className="d-flex align-items-center gap-3">
                <button className="btn btn-outline-success btn-sm position-relative">
                    <FaBell />
                    <span
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                        style={{ width: '10px', height: '10px' }}
                    ></span>
                </button>
                <button className="btn btn-success btn-sm">EN</button>
                <div
                    className="d-flex align-items-center px-3 py-1 rounded-pill"
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                    <div
                        className="rounded-circle bg-white fw-bold d-flex align-items-center justify-content-center me-2"
                        style={{ width: 32, height: 32, color: '#10b981' }}
                    >
                        {getInitials(user.name)}
                    </div>
                    <div className="text-start">
                        <div className="fw-bold">{user.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.75rem' }}>{user.email || user.mobile || ''}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
