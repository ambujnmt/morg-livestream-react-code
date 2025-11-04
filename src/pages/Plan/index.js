import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/dist/sweetalert2.min.css";

const API_URL = "https://site2demo.in/livestreaming/api";

const Plan = () => {
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        price: "",
        duration_days: "",
        description: "",
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const plansPerPage = 5;

    // Fetch Plans
    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${API_URL}/plan-list`);
            if (res.data.status === true) {
                setPlans(res.data.data);
            } else {
                toast.error("Failed to load plans.");
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            toast.error("Error loading plans.");
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Create or Update plan
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => data.append(key, value));

            let res;
            if (editMode) {
                res = await axios.post(`${API_URL}/plans-update`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                res = await axios.post(`${API_URL}/create-plans`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (res.data.status === true) {
                toast.success(res.data.message);
                setShowModal(false);
                setFormData({ id: "", name: "", price: "", duration_days: "", description: "" });
                fetchPlans();
                setEditMode(false);
            } else {
                toast.error(res.data.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error submitting plan:", error);
            toast.error("Failed to save plan. Please check your input.");
        }
    };

    // Handle Edit button click
    const handleEdit = (plan) => {
        setEditMode(true);
        setFormData({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration_days: plan.duration_days,
            description: plan.description,
        });
        setShowModal(true);
    };

    // Handle Delete with SweetAlert2
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This plan will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = new FormData();
                    data.append("id", id);

                    const res = await axios.post(`${API_URL}/plans-delete`, data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });

                    if (res.data.status === true) {
                        Swal.fire("Deleted!", res.data.message, "success");
                        fetchPlans();
                    } else {
                        Swal.fire("Error", res.data.message || "Failed to delete plan.", "error");
                    }
                } catch (error) {
                    console.error("Error deleting plan:", error);
                    Swal.fire("Error", "Failed to delete plan.", "error");
                }
            }
        });
    };

    // Format date (example: 4 Nov 2025)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: "numeric", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-GB", options);
    };

    // Filter plans by search
    const filteredPlans = plans.filter((plan) =>
        plan.name.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination calculations
    const indexOfLastPlan = currentPage * plansPerPage;
    const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
    const currentPlans = filteredPlans.slice(indexOfFirstPlan, indexOfLastPlan);
    const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Plans</h3>
                <Button
                    variant="primary"
                    onClick={() => {
                        setShowModal(true);
                        setEditMode(false);
                        setFormData({ id: "", name: "", price: "", duration_days: "", description: "" });
                    }}
                >
                    + Create Plan
                </Button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control mb-3"
            />

            {/* Plans Table */}
            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Duration (Days)</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPlans.length > 0 ? (
                        currentPlans.map((plan, index) => (
                            <tr key={plan.id}>
                                <td>{indexOfFirstPlan + index + 1}</td>
                                <td>{plan.name}</td>
                                <td>${plan.price}</td>
                                <td>{plan.duration_days}</td>
                                <td>{plan.description}</td>
                                <td>{formatDate(plan.created_at)}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(plan)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(plan.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No plans found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="me-2"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Prev
                    </Button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="ms-2"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Modal for create/update */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Edit Plan" : "Create New Plan"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {editMode && (
                            <Form.Control type="hidden" name="id" value={formData.id} />
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Plan Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter plan name"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Duration (Days)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duration_days"
                                value={formData.duration_days}
                                onChange={handleChange}
                                placeholder="Enter number of days"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description"
                            />
                        </Form.Group>

                        <Button type="submit" variant={editMode ? "warning" : "success"} className="w-100">
                            {editMode ? "Update Plan" : "Save Plan"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Plan;
