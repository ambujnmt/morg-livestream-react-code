import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import "bootstrap/dist/css/bootstrap.min.css";

const Series = () => {

    const API_BASE = "https://site2demo.in/livestreaming/api";

    const [seriesList, setSeriesList] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        category_id: "",
        description: "",
        image: null,      
        old_image: "" 
    });

    // Fetch Series
    const fetchSeries = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/series-list`);
            setSeriesList(res.data.data);
        } catch {
            toast.error("Failed to fetch series");
        }
        setLoading(false);
    };

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories-list`);
            setCategories(res.data.data);
        } catch {
            toast.error("Failed to fetch categories");
        }
    };

    useEffect(() => {
        fetchSeries();
        fetchCategories();
    }, []);

    // Open Modal (Create + Edit)
    const openModal = (data = null) => {
        if (data) {
            setFormData({
                id: data.id,
                title: data.title,
                category_id: data.category?.id,
                description: data.description,
                image: null,
                old_image: data.image
            });
        } else {
            setFormData({
                id: "",
                title: "",
                category_id: "",
                description: "",
                image: null,
                old_image: ""
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // Handle Input
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setFormData((p) => ({ ...p, image: files[0] }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }
    };

    // Create / Update Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.category_id || !formData.description) {
            toast.error("All fields required");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("category_id", formData.category_id);
        data.append("description", formData.description);

        if (formData.image) data.append("image", formData.image);
        if (formData.id) data.append("id", formData.id);

        const url = formData.id
            ? `${API_BASE}/series-update`
            : `${API_BASE}/series-create`;

        try {
            const res = await axios.post(url, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.status) {
                toast.success(`Series ${formData.id ? "updated" : "created"} successfully!`);
                fetchSeries();
                closeModal();
            } else {
                toast.error(res.data.message || "Error");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    // Delete
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Confirm?",
            text: "Delete this series permanently?",
            icon: "warning",
            showCancelButton: true
        });

        if (confirm.isConfirmed) {
            try {
                const res = await axios.post(`${API_BASE}/series-delete`, { id });

                if (res.data.status) {
                    toast.success("Series Deleted");
                    fetchSeries();
                } else {
                    toast.error("Delete failed");
                }
            } catch {
                toast.error("Error deleting");
            }
        }
    };

    // Filtered list
    const filteredSeries = seriesList.filter((s) =>
        s.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Series</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Create Series
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search Series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Table */}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th width="150">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSeries.length ? (
                        filteredSeries.map((s, i) => (
                            <tr key={s.id}>
                                <td>{i + 1}</td>

                                <td>
                                    {s.image ? (
                                        <img
                                            src={`https://site2demo.in/livestreaming/public/${s.image}`}
                                            style={{ width: 60, height: 60, borderRadius: 6, objectFit: "cover" }}
                                            alt="img"
                                        />
                                    ) : (
                                        "No Image"
                                    )}
                                </td>

                                <td>{s.title}</td>
                                <td>{s.category?.name}</td>
                                <td>{s.description}</td>

                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => openModal(s)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-muted">No Series Found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div className="modal show fade d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {formData.id ? "Update Series" : "Create Series"}
                                    </h5>
                                    <button className="btn-close" onClick={closeModal}></button>
                                </div>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label>Category</label>
                                        <select
                                            name="category_id"
                                            className="form-select"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label>Image</label>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            className="form-control"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* OLD IMAGE PREVIEW */}
                                    {formData.old_image && (
                                        <div className="mb-3 text-center">
                                            <p className="text-muted">Current Image:</p>
                                            <img
                                                src={`https://site2demo.in/livestreaming/public/${formData.old_image}`}
                                                style={{ width: 100, borderRadius: 8 }}
                                                alt="old"
                                            />
                                        </div>
                                    )}

                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button className="btn btn-primary">
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

export default Series;
