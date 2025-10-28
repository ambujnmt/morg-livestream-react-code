import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [sessionsWithSeries, setSessionsWithSeries] = useState([]); // merged data
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        series_id: '',
        title: '',
        description: ''
    });

    const API_BASE = 'https://site2demo.in/livestreaming/api';

    // Fetch series list
    const fetchSeries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/series-list`);
            if (res.data && res.data.data) setSeriesList(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch series');
        }
    };

    // Fetch sessions list
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/sessions-list`);
            if (res.data && res.data.data) {
                setSessions(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    // Merge series title into sessions
    const mergeSeriesIntoSessions = () => {
        const seriesMap = {};
        seriesList.forEach(series => {
            seriesMap[series.id] = series;
        });
        const merged = sessions.map(session => ({
            ...session,
            series: seriesMap[session.series_id] // attach series object
        }));
        setSessionsWithSeries(merged);
    };

    useEffect(() => {
        fetchSeries();
        fetchSessions();
    }, []);

    // Re-merge whenever sessions or seriesList change
    useEffect(() => {
        if (seriesList.length && sessions.length) {
            mergeSeriesIntoSessions();
        }
    }, [sessions, seriesList]);

    // Open modal for create/edit
    const openModal = (session = { id: '', series_id: '', title: '', description: '' }) => {
        setFormData({
            id: session.id || '',
            series_id: session.series_id || '',
            title: session.title || '',
            description: session.description || ''
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save create/update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.series_id || !formData.title || !formData.description) {
            toast.error('All fields are required');
            return;
        }

        try {
            const data = new FormData();
            data.append('series_id', formData.series_id);
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.id) data.append('id', formData.id);

            const url = formData.id
                ? `${API_BASE}/session-update`
                : `${API_BASE}/session-create`;

            const res = await axios.post(url, data, {
                headers: { Accept: 'application/json' }
            });

            if (res.data.status) {
                toast.success(`Session ${formData.id ? 'updated' : 'created'} successfully!`);
                fetchSessions(); // refetch sessions
                setTimeout(() => fetchSeries(), 500); // optional: refresh series as well
                closeModal();
            } else {
                toast.error(res.data.message || 'Failed to save session');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save session');
        }
    };

    // Delete session
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete the session permanently!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                const res = await axios.post(`${API_BASE}/session-delete`, { id });
                if (res.data.status) {
                    toast.success('Session deleted successfully!');
                    fetchSessions();
                } else {
                    toast.error(res.data.message || 'Failed to delete session');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete session');
            }
        }
    };

    // Filter and paginate
    const filteredSessions = sessionsWithSeries.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSessions.length / perPage);
    const indexOfLast = currentPage * perPage;
    const indexOfFirst = indexOfLast - perPage;
    const currentSessions = filteredSessions.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h3>Sessions</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>Create Session</button>
            </div>

            {/* Search */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
            />

            {/* Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table table-bordered table-striped align-middle">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Series</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSessions.length > 0 ? (
                            currentSessions.map((s, idx) => (
                                <tr key={s.id}>
                                    <td>{idx + 1 + (currentPage - 1) * perPage}</td>
                                    <td>{s.title}</td>
                                    {/* Display series title */}
                                    <td>{s.series?.title || '-'}</td>
                                    <td>{s.description}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => openModal(s)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">No sessions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Modal for create/edit */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{formData.id ? 'Update Session' : 'Create Session'}</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    {/* Series dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label">Series</label>
                                        <select
                                            className="form-select"
                                            name="series_id"
                                            value={formData.series_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Series</option>
                                            {seriesList.map((series) => (
                                                <option key={series.id} value={series.id}>{series.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Title input */}
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    {/* Description textarea */}
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{formData.id ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sessions;