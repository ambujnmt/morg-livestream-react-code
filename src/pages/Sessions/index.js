import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [sessionsWithSeries, setSessionsWithSeries] = useState([]);
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
        full_season_price: '',
        image: null,
        old_image: ''
    });

    // LOCAL BACKEND URL
    const API_BASE = 'https://site2demo.in/livestreaming/api';
    const IMG_BASE = 'https://site2demo.in/livestreaming/';

    // Fetch series
    const fetchSeries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/series-list`);
            if (res.data?.data) setSeriesList(res.data.data);
        } catch {
            toast.error('Failed to load series');
        }
    };

    // Fetch Sessions
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/sessions-list`);
            if (res.data?.data) setSessions(res.data.data);
        } catch {
            toast.error('Failed to load sessions');
        }
        setLoading(false);
    };

    // Merge Series
    const mergeSeriesIntoSessions = () => {
        const map = {};
        seriesList.forEach(s => (map[s.id] = s));
        setSessionsWithSeries(
            sessions.map(sess => ({
                ...sess,
                series: map[sess.series_id]
            }))
        );
    };

    useEffect(() => {
        fetchSeries();
        fetchSessions();
    }, []);

    useEffect(() => {
        if (sessions.length && seriesList.length) mergeSeriesIntoSessions();
    }, [sessions, seriesList]);

    // Open Modal
    const openModal = (s = null) => {
        if (s) {
            setFormData({
                id: s.id,
                series_id: s.series_id,
                title: s.title,
                description: s.description,
                free_episodes: s.free_episodes,
                price_per_episode: s.price_per_episode,
                full_season_price: s.full_season_price,
                image: null,
                old_image: s.image || ''
            });
        } else {
            setFormData({
                id: '',
                series_id: '',
                title: '',
                description: '',
                free_episodes: '',
                price_per_episode: '',
                full_season_price: '',
                image: null,
                old_image: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Handle input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setFormData(prev => ({ ...prev, image: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append("series_id", formData.series_id);
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("free_episodes", formData.free_episodes);
            data.append("price_per_episode", formData.price_per_episode);
            data.append("full_season_price", formData.full_season_price);

            if (formData.image) data.append("image", formData.image);
            if (formData.id) data.append("id", formData.id);

            const url = formData.id
                ? `${API_BASE}/session-update`
                : `${API_BASE}/create-sessions`;

            const res = await axios.post(url, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.status) {
                toast.success(formData.id ? "Updated!" : "Created!");
                fetchSessions();
                closeModal();
            } else {
                toast.error(res.data.message || "Failed");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    // Delete
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete?",
            text: "This session will be deleted permanently!",
            icon: "warning",
            showCancelButton: true
        });

        if (confirm.isConfirmed) {
            try {
                const res = await axios.post(`${API_BASE}/session-delete`, { id });
                if (res.data.status) {
                    toast.success("Deleted");
                    fetchSessions();
                }
            } catch {
                toast.error("Delete failed");
            }
        }
    };

    // Filtering + Pagination
    const filtered = sessionsWithSeries.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / perPage);

    const current = filtered.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between mb-3">
                <h3>Seasons / Sessions</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    Create Session
                </button>
            </div>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search session..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Series</th>
                        <th>Description</th>
                        <th>Free Episodes</th>
                        <th>Price/Episode</th>
                        <th>Full Season Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {current.length ? (
                        current.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>

                                <td>
                                    {s.image ? (
                                        <img
                                            src={`${IMG_BASE}${s.image}`}
                                            width="60"
                                            height="60"
                                            style={{ objectFit: "cover", borderRadius: 6 }}
                                        />
                                    ) : "No Image"}
                                </td>

                                <td>{s.title}</td>
                                <td>{s.series?.title}</td>
                                <td>{s.description}</td>
                                <td>{s.free_episodes}</td>
                                <td>{s.price_per_episode}</td>
                                <td>{s.full_season_price}</td>

                                <td>
                                    <button className="btn btn-warning btn-sm me-2"
                                        onClick={() => openModal(s)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(s.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="9" className="text-center">No Sessions</td></tr>
                    )}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && (
                <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5>{formData.id ? "Update Session" : "Create Session"}</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <label>Series</label>
                                        <select className="form-select" name="series_id" value={formData.series_id} onChange={handleChange}>
                                            <option value="">Select Series</option>
                                            {seriesList.map(s => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label>Title</label>
                                        <input className="form-control" name="title" value={formData.title} onChange={handleChange} />
                                    </div>

                                    <div className="mb-3">
                                        <label>Description</label>
                                        <textarea className="form-control" rows="3" name="description" value={formData.description} onChange={handleChange}></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label>Free Episodes</label>
                                        <input type="number" className="form-control" name="free_episodes" value={formData.free_episodes} onChange={handleChange} />
                                    </div>

                                    <div className="mb-3">
                                        <label>Price per Episode</label>
                                        <input type="number" className="form-control" name="price_per_episode" value={formData.price_per_episode} onChange={handleChange} />
                                    </div>

                                    <div className="mb-3">
                                        <label>Full Season Price</label>
                                        <input type="number" className="form-control" name="full_season_price" value={formData.full_season_price} onChange={handleChange} />
                                    </div>

                                    <div className="mb-3">
                                        <label>Image</label>
                                        <input type="file" className="form-control" name="image" accept="image/*" onChange={handleChange} />
                                    </div>

                                    {formData.old_image && (
                                        <div className="mb-2 text-center">
                                            <img src={`${IMG_BASE}${formData.old_image}`} width="120" className="rounded" />
                                        </div>
                                    )}

                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{formData.id ? "Update" : "Create"}</button>
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
