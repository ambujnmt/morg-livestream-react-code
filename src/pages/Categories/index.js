import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "https://site2demo.in/livestreaming/api";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Modal control
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form data
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [editData, setEditData] = useState({ id: "", name: "", description: "" });

    const ITEMS_PER_PAGE = 5;

    // ✅ Fetch all categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/categories-list`);
            if (res.data.status) {
                setCategories(res.data.data);
            } else {
                toast.error("Failed to fetch categories");
            }
        } catch (error) {
            console.error("Error fetching:", error);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ✅ Create category
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/create-categories`, formData, {
                headers: { Accept: "application/json" },
            });

            if (res.data.status) {
                toast.success("Category created successfully!");
                setFormData({ name: "", description: "" });
                setShowCreateModal(false);
                fetchCategories();
            } else {
                toast.error(res.data.message || "Failed to create category");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while creating");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Edit (open modal)
    const handleEditClick = (cat) => {
        setEditData({
            id: cat.id,
            name: cat.name,
            description: cat.description,
        });
        setShowEditModal(true);
    };

    // ✅ Update category
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/categories-update`, editData, {
                headers: { Accept: "application/json" },
            });

            if (res.data.status) {
                toast.success("Category updated successfully!");
                setShowEditModal(false);
                fetchCategories();
            } else {
                toast.error(res.data.message || "Failed to update category");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while updating");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete category
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const res = await axios.post(
                    `${BASE_URL}/categories-delete`,
                    { id },
                    { headers: { Accept: "application/json" } }
                );
                if (res.data.status) {
                    toast.success("Category deleted successfully!");
                    fetchCategories();
                } else {
                    toast.error(res.data.message || "Failed to delete");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error deleting category");
            }
        }
    };

    // ✅ Search + Pagination
    const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Category Management</h4>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Add Category
                </button>
            </div>

            {/* Search */}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by category name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.name}</td>
                                    <td>{cat.slug}</td>
                                    <td>{cat.description}</td>
                                    <td>{new Date(cat.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEditClick(cat)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No categories found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li
                            className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        >
                            <button className="page-link">Previous</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li
                                key={i}
                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                <button className="page-link">{i + 1}</button>
                            </li>
                        ))}
                        <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        >
                            <button className="page-link">Next</button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div
                    className="modal show fade d-block"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Add Category</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreate}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary me-2"
                                            onClick={() => setShowCreateModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div
                    className="modal show fade d-block"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-white">
                                <h5 className="modal-title">Edit Category</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={editData.name}
                                            onChange={(e) =>
                                                setEditData({ ...editData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            value={editData.description}
                                            onChange={(e) =>
                                                setEditData({ ...editData, description: e.target.value })
                                            }
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary me-2"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-warning text-white"
                                            disabled={loading}
                                        >
                                            {loading ? "Updating..." : "Update"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
