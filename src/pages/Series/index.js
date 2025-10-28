import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const Series = () => {
    const [seriesList, setSeriesList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        category_id: '',
        description: ''
    });

    const API_BASE = 'https://site2demo.in/livestreaming/api';

    // Fetch series
    const fetchSeries = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/series-list`, {
                headers: { Accept: 'application/json' }
            });
            if (res.data && res.data.data) setSeriesList(res.data.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to fetch series');
        }
        setLoading(false);
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories-list`, {
                headers: { Accept: 'application/json' }
            });
            if (res.data && res.data.data) setCategories(res.data.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchSeries();
        fetchCategories();
    }, []);

    // Open modal for create or edit
    const openModal = (series = { id: '', title: '', category_id: '', description: '' }) => {
        setFormData({
            id: series.id || '',
            title: series.title || '',
            category_id: series.category_id || series.category?.id || '',
            description: series.description || ''
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Create or update series
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.category_id || !formData.description) {
            toast.error('All fields are required');
            return;
        }

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category_id', formData.category_id);
            data.append('description', formData.description);

            let url = '';
            if (formData.id) {
                // Update
                data.append('id', formData.id);
                url = `${API_BASE}/series-update`;
            } else {
                // Create
                url = `${API_BASE}/series`;
            }

            const res = await axios.post(url, data, {
                headers: { Accept: 'application/json' }
            });

            if (res.data.status) {
                toast.success(`Series ${formData.id ? 'updated' : 'created'} successfully!`);
                fetchSeries();
                closeModal();
            } else {
                toast.error(res.data.message || 'Failed to save series');
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to save series');
        }
    };

    // Delete series
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete the series permanently!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.post(`${API_BASE}/series-delete`, { id }, {
                    headers: { Accept: 'application/json' }
                });

                if (res.data.status) {
                    toast.success('Series deleted successfully!');
                    fetchSeries();
                } else {
                    toast.error(res.data.message || 'Failed to delete series');
                }
            } catch (error) {
                console.error(error.response?.data || error.message);
                toast.error('Failed to delete series');
            }
        }
    };

    // Search filter
    const filteredSeries = seriesList.filter(s =>
        (s.title || '').toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const indexOfLast = currentPage * perPage;
    const indexOfFirst = indexOfLast - perPage;
    const currentSeries = filteredSeries.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredSeries.length / perPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3">
                <h3>Series</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>Create Series</button>
            </div>

            {/* Search */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                            <th>Category</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSeries.length > 0 ? (
                            currentSeries.map((s, idx) => (
                                <tr key={s.id}>
                                    <td>{idx + 1 + (currentPage - 1) * perPage}</td>
                                    <td>{s.title}</td>
                                    <td>{s.category?.name || '-'}</td>
                                    <td>{s.description}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => openModal(s)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">No series found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination">
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{formData.id ? 'Update Series' : 'Create Series'}</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <select name="category_id" className="form-select" value={formData.category_id} onChange={handleChange} required>
                                            <option value="">-- Select Category --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange} required></textarea>
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

export default Series;
