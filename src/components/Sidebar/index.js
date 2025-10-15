import React from 'react';
import { FaHome, FaProjectDiagram, FaBriefcase, FaTasks, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Sidebar = ({ collapsed }) => {
    const navigate = useNavigate();

    const navItems = [
        { icon: <FaHome />, label: 'Homepage' },
        { icon: <FaProjectDiagram />, label: 'Projects' },
        { icon: <FaBriefcase />, label: 'Jobs' },
        { icon: <FaTasks />, label: 'Tasks' },
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
                Swal.fire(
                    'Logged out!',
                    'You have been successfully logged out.',
                    'success'
                );
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
            <div className="w-100 text-center py-3 border-bottom">
                {!collapsed && <span className="fw-bold text-primary fs-5">

                    <img src="/logo.jpg" alt="Logo" width={100} height={100} />

                </span>}
            </div>

            <ul className="nav flex-column w-100 px-3 mt-3">
                {navItems.map((item, index) => (
                    <li key={index} className="nav-item mb-2">
                        <a href="#" className="nav-link d-flex align-items-center text-dark">
                            <span className="me-2 fs-5">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </a>
                    </li>
                ))}

                {/* Logout Item */}
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
