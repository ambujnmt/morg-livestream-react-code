// src/components/Dashboard.js

import React from 'react';
import './Dashboard.css'; // for custom styling
import 'bootstrap-icons/font/bootstrap-icons.css';

const Dashboard = ({ collapsed }) => {

    // ✅ Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.name || 'Guest';

    const cards = [
        { title: 'Total İşs', value: 24, icon: 'bi-bullseye', color: '#3b82f6', trend: '+150%' },
        { title: 'Active Tasks', value: 156, icon: 'bi-check2-square', color: '#10b981', trend: '+120%' },
        { title: 'Team Members', value: 32, icon: 'bi-people-fill', color: '#8b5cf6', trend: '+15%' },
        { title: 'Completed Tasks', value: 89, icon: 'bi-graph-up-arrow', color: '#f59e0b', trend: '+200%' },
        { title: 'Monthly Revenue', value: '₺245,000', icon: 'bi-cash-stack', color: '#22c55e', trend: '+180%' },
        { title: 'Pending Payments', value: '₺32,500', icon: 'bi-clock-history', color: '#f97316', trend: '+45%' },
        { title: 'Total Expenses', value: '₺67,800', icon: 'bi-credit-card', color: '#ef4444', trend: '+220%' },
        { title: 'Net Profit', value: '₺177,200', icon: 'bi-bar-chart-line', color: '#0ea5e9', trend: '+190%' },
    ];

    return (
        <div className="dashboard-container">
            {/* Top Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Welcome, {userName}</h4>
                <div>
                    <button className="btn btn-outline-secondary btn-sm me-2">EN</button>
                    <button className="btn btn-success btn-sm">Feedback</button>
                </div>
            </div>

            {/* <p className="text-muted mb-3">Overview</p> */}

            {/* Overview Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Overview</h5>
                <select className="form-select form-select-sm w-auto">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>All Time</option>
                </select>
            </div>

            {/* Overview Cards */}
            <div className="row g-4 mb-4">
                {cards.map((card, index) => (
                    <div className="col-xl-3 col-lg-4 col-sm-6" key={index}>
                        <div className="card border-0 shadow-sm p-3 rounded-4">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    style={{
                                        backgroundColor: card.color,
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <i className={`bi ${card.icon} text-white fs-5`}></i>
                                </div>
                                <div>
                                    <div className="fw-bold fs-6">{card.value}</div>
                                    <div className="text-muted small">{card.title}</div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between text-muted small mt-3">
                                <span>All time</span>
                                <span className="text-success fw-semibold">{card.trend}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Row */}
            <div className="row">
                {/* Recent Jobs */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold d-flex justify-content-between">
                            Recent Jobs <a href="#">View All</a>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between">
                                <span>E-Ticaret Platformu</span>
                                <span className="badge bg-primary">85%</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Mobil Uygulama</span>
                                <span className="badge bg-warning text-dark">60%</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>CRM Sistemi</span>
                                <span className="badge bg-success">100%</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold d-flex justify-content-between">
                            Upcoming Deadlines <a href="#">View All</a>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <span className="fw-bold">UI Tasarımı Onayı</span>
                                <br />
                                <small className="text-muted">Today • Mehmet K.</small>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Team Performance */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold">Team Performance</div>
                        <div className="card-body">
                            <p className="mb-1">Mehmet Kaya <small className="text-muted">Frontend Dev</small></p>
                            <div className="progress mb-3">
                                <div className="progress-bar bg-success" style={{ width: '83%' }}>83%</div>
                            </div>
                            <p className="mb-1">Mehmet Kaya <small className="text-muted">Frontend Dev</small></p>
                            <div className="progress">
                                <div className="progress-bar bg-success" style={{ width: '83%' }}>83%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="row">
                {/* Quick Actions */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold">Quick Actions</div>
                        <div className="card-body">
                            <div className="row g-2">
                                {[
                                    { label: 'New Job', icon: 'bi-plus', color: 'primary' },
                                    { label: 'Add Task', icon: 'bi-check2-square', color: 'success' },
                                    { label: 'Create Invoice', icon: 'bi-file-earmark-text', color: 'info' },
                                    { label: 'Add Collection', icon: 'bi-wallet2', color: 'success' },
                                    { label: 'Make Payment', icon: 'bi-credit-card', color: 'danger' },
                                    { label: 'Add Expense', icon: 'bi-cash', color: 'danger' }
                                ].map((action, idx) => (
                                    <div className="col-6" key={idx}>
                                        <button className={`btn btn-outline-${action.color} w-100`}>
                                            <i className={`bi ${action.icon} me-2`}></i>
                                            {action.label}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold">Recent Activity</div>
                        <ul className="list-group list-group-flush">
                            {[
                                'İş tamamlandı • 2 saat önce',
                                'Yeni görev atandı • 4 saat önce',
                                'Fatura #1234 ödendi • 1 gün önce',
                                'Toplantı hatırlatması • 2 gün önce'
                            ].map((text, i) => (
                                <li className="list-group-item" key={i}>{text}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header fw-bold d-flex justify-content-between">
                            Key Metrics <span>Report</span>
                        </div>
                        <div className="card-body">
                            <p>Job Completion Rate</p>
                            <div className="progress mb-3">
                                <div className="progress-bar bg-success" style={{ width: '75%' }}>75%</div>
                            </div>
                            <p>Client Satisfaction</p>
                            <div className="progress">
                                <div className="progress-bar bg-info" style={{ width: '90%' }}>90%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
