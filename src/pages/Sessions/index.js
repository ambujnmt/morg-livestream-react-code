import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const Sessions = () => {
    const API_BASE = 'https://site2demo.in/livestreaming/api';
    const IMG_BASE = 'https://site2demo.in/livestreaming/public/';

    const [sessions, setSessions] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [sessionsWithSeries, setSessionsWithSeries] = useState([]);

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const perPage = 50;

    const initialForm = {
        id: '',
        series_id: '',
        title: '',
        description: '',
        free_episodes: '',
        price_per_episode: '',
        full_season_price: '',
        image: null,
        old_image: '',
        fresh_hote: false,
        season_name: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Fetch Series
    const fetchSeries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/series-list`);
            if (res.data?.data) setSeriesList(res.data.data);
        } catch {
            toast.error("Failed to load series");
        }
    };

    // Fetch Sessions
    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/sessions-list`);
            if (res.data?.data) setSessions(res.data.data);
        } catch {
            toast.error("Failed to load sessions");
        }
    };

    // Merge Series and Sessions Data
    const mergeData = () => {
        const map = {};
        seriesList.forEach(s => (map[s.id] = s));
        setSessionsWithSeries(
            sessions.map(sess => ({ ...sess, series: map[sess.series_id] }))
        );
    };

    useEffect(() => {
        fetchSeries();
        fetchSessions();
    }, []);

    useEffect(() => {
        if (seriesList.length && sessions.length) mergeData();
    }, [seriesList, sessions]);

    // Open Modal
    const openModal = (session = null) => {
        if (session) {
            setFormData({
                id: session.id,
                series_id: session.series_id,
                title: session.title,
                description: session.description,
                free_episodes: session.free_episodes,
                price_per_episode: session.price_per_episode,
                full_season_price: session.full_season_price,
                image: null,
                old_image: session.image,
                fresh_hote: session.fresh_hote == 1 ? true : false,
                season_name: session.season_name || ''
            });
        } else {
            setFormData(initialForm);
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Handle Form Changes
    const handleChange = (e) => {
        const { name, value, files, checked } = e.target;

        if (name === "image") {
            setFormData(prev => ({ ...prev, image: files[0] }));
        } else if (name === "fresh_hote") {
            setFormData(prev => ({ ...prev, fresh_hote: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.series_id) {
            toast.error("Please select series");
            return;
        }

        const data = new FormData();
        data.append("series_id", formData.series_id);
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("free_episodes", formData.free_episodes || 0);
        data.append("price_per_episode", formData.price_per_episode || 0);
        data.append("full_season_price", formData.full_season_price || 0);
        data.append("season_name", formData.season_name);
        data.append("fresh_hote", formData.fresh_hote ? 1 : 0);

        if (formData.image) {
            data.append("image", formData.image);
        }

        let url = `${API_BASE}/session-create`;

        if (formData.id) {
            data.append("id", formData.id);
            url = `${API_BASE}/session-update`;
        }

        try {
            const res = await axios.post(url, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.status) {
                toast.success(formData.id ? "Session Updated" : "Session Created");
                fetchSessions();
                closeModal();
            } else {
                toast.error(res.data.message || "Validation Error");
            }
        } catch (error) {
            toast.error("Server Error");
        }
    };

    // Delete Session
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This will delete this session permanently.",
            icon: "warning",
            showCancelButton: true
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.post(`${API_BASE}/session-delete`, { id });
            if (res.data.status) {
                toast.success("Deleted successfully");
                fetchSessions();
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const filtered = sessionsWithSeries.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const current = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="container mt-4">
            <ToastContainer />

            <div className="d-flex justify-content-between mb-3">
                <h3>Sessions</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    Create Session
                </button>
            </div>

            <input
                className="form-control mb-3"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Series</th>
                        <th>Description</th>
                        <th>Free</th>
                        <th>Price</th>
                        <th>Full</th>
                        <th>Fresh</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {current.length ? current.map((s, i) => (
                        <tr key={s.id}>
                            <td>{i + 1}</td>
                            <td>{s.image ? <img src={`${IMG_BASE}${s.image}`} width="60" alt="Session Image" /> : "No Image"}</td>
                            <td>{s.title}</td>
                            <td>{s.series?.title}</td>
                            <td>{s.description}</td>
                            <td>{s.free_episodes}</td>
                            <td>{s.price_per_episode}</td>
                            <td>{s.full_season_price}</td>
                            <td>{s.fresh_hote == 1 ? 'Yes' : 'No'}</td>
                            <td>
                                <button className="btn btn-warning btn-sm me-1" onClick={() => openModal(s)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="10" className="text-center">No data</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Previous
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>

            {/* Modal for Create/Edit Session */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5>{formData.id ? "Update" : "Create"} Session</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>

                                <div className="modal-body">
                                    <select
                                        className="form-select mb-2"
                                        name="series_id"
                                        value={formData.series_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Series</option>
                                        {seriesList.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>

                                    <input
                                        className="form-control mb-2"
                                        name="title"
                                        placeholder="Title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />

                                    <textarea
                                        className="form-control mb-2"
                                        name="description"
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />

                                    <input
                                        className="form-control mb-2"
                                        type="number"
                                        name="free_episodes"
                                        placeholder="Free Episodes"
                                        value={formData.free_episodes}
                                        onChange={handleChange}
                                    />

                                    <input
                                        className="form-control mb-2"
                                        type="number"
                                        name="price_per_episode"
                                        placeholder="Price Per Episode"
                                        value={formData.price_per_episode}
                                        onChange={handleChange}
                                    />

                                    <input
                                        className="form-control mb-2"
                                        type="number"
                                        name="full_season_price"
                                        placeholder="Full Season Price"
                                        value={formData.full_season_price}
                                        onChange={handleChange}
                                    />

                                    <input
                                        className="form-control mb-2"
                                        name="season_name"
                                        placeholder="Season Name"
                                        value={formData.season_name}
                                        onChange={handleChange}
                                    />

                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="fresh_hote"
                                            checked={formData.fresh_hote}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label">Fresh & Hote</label>
                                    </div>

                                    <input
                                        className="form-control mb-2"
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">
                                        {formData.id ? "Update" : "Create"}
                                    </button>
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
