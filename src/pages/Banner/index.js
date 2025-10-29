import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({ id: '', headline: '', series_id: '', image: null });

    const API_BASE = 'https://site2demo.in/livestreaming/api';

    // ✅ Fetch all banners
    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/banners`, {
                headers: { Accept: 'application/json' },
            });
            if (res.data && res.data.data) setBanners(res.data.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to fetch banners');
        }
        setLoading(false);
    };

    // ✅ Fetch all series for dropdown
    const fetchSeries = async () => {
        try {
            const res = await axios.get(`${API_BASE}/series-list`, {
                headers: { Accept: 'application/json' },
            });
            if (res.data && res.data.data) setSeriesList(res.data.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to fetch series');
        }
    };

    // ✅ Run on mount
    useEffect(() => {
        fetchBanners();
        fetchSeries();
    }, []);

    // ✅ Handle search
    const filteredBanners = banners.filter(b =>
        (b.headline || '').toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Pagination
    const indexOfLast = currentPage * perPage;
    const indexOfFirst = indexOfLast - perPage;
    const currentBanners = filteredBanners.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBanners.length / perPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ✅ Open modal (Create or Edit)
    const openModal = (banner = { id: '', headline: '', series_id: '', image: null }) => {
        setFormData({
            id: banner.id || '',
            headline: banner.headline || '',
            series_id: banner.series_id || banner.series?.id || '',
            image: null,
        });
        // ✅ Set preview to existing image if editing
        setPreviewImage(banner.image || null);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setPreviewImage(null);
    };

    // ✅ Handle input changes (with preview)
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setFormData({ ...formData, [name]: file });
            setPreviewImage(URL.createObjectURL(file)); // ✅ show preview instantly
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // ✅ Create or Update banner
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('headline', formData.headline);
            data.append('series_id', Number(formData.series_id));

            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            if (formData.id) {
                // Update existing banner
                data.append('id', formData.id);
                await axios.post(`${API_BASE}/banners-update`, data, {
                    headers: { Accept: 'application/json' },
                });
                toast.success('Banner updated successfully');
            } else {
                // Create new banner
                await axios.post(`${API_BASE}/create-banners`, data, {
                    headers: { Accept: 'application/json' },
                });
                toast.success('Banner created successfully');
            }

            fetchBanners();
            closeModal();
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to save banner');
        }
    };

    // ✅ Delete banner
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await axios.post(`${API_BASE}/banners-delete`, { id }, {
                headers: { Accept: 'application/json' },
            });
            toast.success('Banner deleted successfully');
            fetchBanners();
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Failed to delete banner');
        }
    };

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between mb-3">
                <h3>Banners</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    Create Banner
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search banner..."
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
                            <th>Headline</th>
                            <th>Series</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBanners.length > 0 ? (
                            currentBanners.map((banner, idx) => (
                                <tr key={banner.id}>
                                    <td>{idx + 1 + (currentPage - 1) * perPage}</td>
                                    <td>{banner.headline}</td>
                                    <td>{banner.series?.title || '-'}</td>
                                    <td>
                                        {banner.image ? (
                                            <img
                                                src={banner.image}
                                                alt={banner.headline}
                                                width={100}
                                                height={60}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            'No image'
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => openModal(banner)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(banner.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">
                                    No banners found
                                </td>
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
                                <button className="page-link" onClick={() => paginate(i + 1)}>
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="modal show fade d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {formData.id ? 'Update Banner' : 'Create Banner'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>

                                <div className="modal-body">
                                    {/* Headline */}
                                    <div className="mb-3">
                                        <label className="form-label">Headline</label>
                                        <input
                                            type="text"
                                            name="headline"
                                            className="form-control"
                                            value={formData.headline}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Series Dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label">Select Series</label>
                                        <select
                                            name="series_id"
                                            className="form-select"
                                            value={formData.series_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Select Series --</option>
                                            {seriesList.map((series) => (
                                                <option key={series.id} value={series.id}>
                                                    {series.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Image Upload + Preview */}
                                    <div className="mb-3">
                                        <label className="form-label">Image</label>
                                        <input
                                            type="file"
                                            name="image"
                                            className="form-control mb-2"
                                            onChange={handleChange}
                                        />

                                        {/* ✅ Show image preview */}
                                        {previewImage && (
                                            <div className="text-center">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    width="200"
                                                    height="120"
                                                    className="border rounded"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {formData.id ? 'Update' : 'Create'}
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

export default Banner;
