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
        description: '',
        free_episodes: '',
        price_per_episode: '',
        full_season_price: ''
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
            if (res.data && res.data.data) setSessions(res.data.data);
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
        seriesList.forEach(series => { seriesMap[series.id] = series; });
        const merged = sessions.map(session => ({
            ...session,
            series: seriesMap[session.series_id]
        }));
        setSessionsWithSeries(merged);
    };

    useEffect(() => {
        fetchSeries();
        fetchSessions();
    }, []);

    useEffect(() => {
        if (seriesList.length && sessions.length) mergeSeriesIntoSessions();
    }, [sessions, seriesList]);

    const openModal = (session = null) => {
        if (session) {
            setFormData({
                id: session.id || '',
                series_id: session.series_id || '',
                title: session.title || '',
                description: session.description || '',
                free_episodes: session.free_episodes || '',
                price_per_episode: session.price_per_episode || '',
                full_season_price: session.full_season_price || ''
            });
        } else {
            setFormData({
                id: '',
                series_id: '',
                title: '',
                description: '',
                free_episodes: '',
                price_per_episode: '',
                full_season_price: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate
        if (!formData.series_id || !formData.title || !formData.description
            || formData.free_episodes === '' || formData.price_per_episode === '' || formData.full_season_price === '') {
            toast.error('All fields are required');
            return;
        }

        try {
            const data = new FormData();
            data.append('series_id', formData.series_id);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('free_episodes', formData.free_episodes);
            data.append('price_per_episode', formData.price_per_episode);
            data.append('full_season_price', formData.full_season_price);
            if (formData.id) data.append('id', formData.id);

            const url = formData.id
                ? `${API_BASE}/session-update`
                : `${API_BASE}/create-sessions`;

            const res = await axios.post(url, data, {
                headers: { Accept: 'application/json' }
            });

            if (res.data.status) {
                toast.success(`Session ${formData.id ? 'updated' : 'created'} successfully!`);
                fetchSessions();
                setTimeout(() => fetchSeries(), 500);
                closeModal();
            } else {
                toast.error(res.data.message || 'Failed to save session');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save session');
        }
    };

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
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h3>Seasons / Sessions</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>Create Season</button>
            </div>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search season..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
            />

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
                            <th>Free Episodes</th>
                            <th>Price per Episode</th>
                            <th>Full Season Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSessions.length > 0 ? (
                            currentSessions.map((s, idx) => (
                                <tr key={s.id}>
                                    <td>{idx + 1 + (currentPage - 1) * perPage}</td>
                                    <td>{s.title}</td>
                                    <td>{s.series?.title || '-'}</td>
                                    <td>{s.description}</td>
                                    <td>{s.free_episodes}</td>
                                    <td>{s.price_per_episode}</td>
                                    <td>{s.full_season_price}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => openModal(s)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center text-muted">No sessions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

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
                                            {seriesList.map(series => (
                                                <option key={series.id} value={series.id}>{series.title}</option>
                                            ))}
                                        </select>
                                    </div>
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
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Free Episodes</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="free_episodes"
                                            value={formData.free_episodes}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Price per Episode</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price_per_episode"
                                            value={formData.price_per_episode}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Full Season Price</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="full_season_price"
                                            value={formData.full_season_price}
                                            onChange={handleChange}
                                            min="0"
                                            required
                                        />
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
