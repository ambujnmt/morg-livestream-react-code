// src/components/Layout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    // dynamically compute widths
    const sidebarWidth = collapsed ? '80px' : '20%';

    return (
        <div>
            {/* Sidebar */}
            <Sidebar collapsed={collapsed} />

            {/* Header */}
            <Header
                onToggle={toggleSidebar}
                collapsed={collapsed}
                sidebarWidth={sidebarWidth}
            />

            {/* Main Content */}
            <main
                style={{
                    marginLeft: sidebarWidth,
                    paddingTop: '80px',
                    paddingInline: '20px',
                    transition: 'all 0.3s ease',
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
