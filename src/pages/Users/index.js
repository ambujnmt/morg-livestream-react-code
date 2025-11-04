import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";


const API_URL = "https://site2demo.in/livestreaming/api";

const User = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const usersPerPage = 5;

    // Fetch users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/users-list`);
                const data = await response.json();
                if (data.status) {
                    setUsers(data.data);
                } else {
                    alert("Failed to fetch users");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Toggle user status (Active/Inactive)
    const toggleStatus = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/toggle-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: userId }),
            });

            const data = await response.json();
            if (data.status) {
                // Update the user status in the UI after toggling
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId ? { ...user, status: !user.status } : user
                    )
                );
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    // Function to delete a user
    const deleteUser = async (userId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const formData = new FormData();
                formData.append("id", userId);
                formData.append("date", "1 Nov 2025");

                const response = await fetch(`${API_URL}/user-delete`, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                    },
                    body: formData,
                });

                const data = await response.json();
                if (data.status) {

                    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

                    Swal.fire({
                        title: "Deleted!",
                        text: "The user has been deleted.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "There was an issue deleting the user.",
                        icon: "error",
                        confirmButtonText: "Try again",
                    });
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Something went wrong. Please try again later.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-GB", options);
    };

    return (
        <div className="container my-4">
            <h2 className="mb-4">User Management</h2>

            {/* Search input */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />

            {/* Loading Spinner */}
            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}

            {/* User Table */}
            {!loading && (
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Status</th>
                            <th scope="col">Joined On</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user, idx) => (
                                <tr key={user.id}>
                                    <th scope="row">{indexOfFirstUser + idx + 1}</th>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span
                                            className={`badge ${user.status ? "bg-success" : "bg-secondary"}`}
                                            onClick={() => toggleStatus(user.id)}
                                        >
                                            {user.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>

                        {[...Array(totalPages)].map((_, i) => (
                            <li
                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                key={i + 1}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => paginate(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}

                        <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default User;
