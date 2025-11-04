import React, { useState } from 'react';
import {
    FaHome,
    FaProjectDiagram,
    FaBriefcase,
    FaTasks,
    FaSignOutAlt,
    FaChevronDown,
    FaChevronUp,
    FaTv,        // Series icon
    FaClock      // Sessions icon
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Sidebar = ({ collapsed }) => {
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const navItems = [
        { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
        { icon: <FaProjectDiagram />, label: 'Categories', path: '/category' },

        // Series Management
        {
            icon: <FaTv />,
            label: 'Series Management',
            key: 'series',
            isDropdown: true,
            subItems: [
                { label: 'All Series', path: '/series' },
            ],
        },

        // Sessions Management (new)
        {
            icon: <FaClock />,
            label: 'Season Management',
            key: 'season',
            isDropdown: true,
            subItems: [
                { label: 'All Season', path: '/season' },
                // { label: 'Add New Session', path: '/sessions/add' },
            ],
        },
        // Episodes Management
        {
            icon: <FaBriefcase />,
            label: 'Episodes Management',
            key: 'episodes',
            isDropdown: true,
            subItems: [
                { label: 'Add New Episode', path: '/episodes' },
                //  { label: 'All Episodes', path: '/episodes/all' },
                //  { label: 'Pending Approval', path: '/episodes/pending' },
                // { label: 'Published Episodes', path: '/episodes/published' },
            ],
        },

        { icon: <FaTasks />, label: 'Banner Management', path: '/banners' },
        { icon: <FaTasks />, label: 'Plan Management', path: '/plans' },

        { icon: <FaTasks />, label: 'User Management', path: '/users-list' },
    ];

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                navigate('/');
                Swal.fire('Logged out!', 'You have been successfully logged out.', 'success');
            }
        });
    };

    return (
        <div
            className="bg-white border-end position-fixed top-0 start-0 d-flex flex-column"
            style={{
                width: collapsed ? '80px' : '20%',
                height: '100vh',
                zIndex: 1040,
                boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                transition: 'width 0.3s ease',
            }}
        >
            {/* Logo */}
            <div className="w-100 text-center py-3 border-bottom">
                {!collapsed && (
                    <span className="fw-bold text-primary fs-5">
                        <img src="/logo.jpg" alt="Logo" width={100} height={100} />
                    </span>
                )}
            </div>

            {/* Navigation Items */}
            <ul className="nav flex-column w-100 px-3 mt-3">
                {navItems.map((item, index) => (
                    <li key={index} className="nav-item mb-2">
                        {item.isDropdown ? (
                            <>
                                <button
                                    onClick={() => toggleDropdown(item.key)}
                                    className="btn btn-link nav-link d-flex align-items-center text-dark w-100 text-start"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span className="me-2 fs-5">{item.icon}</span>
                                    {!collapsed && (
                                        <>
                                            <span className="flex-grow-1">{item.label}</span>
                                            {openDropdown === item.key ? <FaChevronUp /> : <FaChevronDown />}
                                        </>
                                    )}
                                </button>

                                {!collapsed && openDropdown === item.key && (
                                    <ul className="nav flex-column ms-4">
                                        {item.subItems.map((sub, i) => (
                                            <li key={i} className="nav-item mb-1">
                                                <Link
                                                    to={sub.path}
                                                    className="nav-link text-secondary small"
                                                >
                                                    {sub.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                className="nav-link d-flex align-items-center text-dark"
                            >
                                <span className="me-2 fs-5">{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )}
                    </li>
                ))}

                {/* Logout */}
                <li className="nav-item mt-auto mb-2">
                    <button
                        onClick={handleLogout}
                        className="btn btn-link nav-link d-flex align-items-center text-dark"
                        style={{ cursor: 'pointer', textDecoration: 'none' }}
                    >
                        <span className="me-2 fs-5"><FaSignOutAlt /></span>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
