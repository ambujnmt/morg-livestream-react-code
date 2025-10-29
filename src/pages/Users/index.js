import React, { useState, useEffect } from "react";

const User = () => {
    // Mock data: Replace with your API fetch
    const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", status: true, joinedOn: "2023-01-12" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", status: false, joinedOn: "2023-02-03" },
        { id: 3, name: "Alice Brown", email: "alice@example.com", status: true, joinedOn: "2023-03-22" },
        { id: 4, name: "Bob White", email: "bob@example.com", status: true, joinedOn: "2023-04-15" },
        { id: 5, name: "Charlie Green", email: "charlie@example.com", status: false, joinedOn: "2023-05-10" },
        { id: 6, name: "Diana Black", email: "diana@example.com", status: true, joinedOn: "2023-06-08" },
        { id: 7, name: "Edward Gray", email: "edward@example.com", status: false, joinedOn: "2023-07-20" },
        { id: 8, name: "Fiona Blue", email: "fiona@example.com", status: true, joinedOn: "2023-08-12" },
        { id: 9, name: "George Yellow", email: "george@example.com", status: true, joinedOn: "2023-09-05" },
        { id: 10, name: "Helen Orange", email: "helen@example.com", status: false, joinedOn: "2023-10-28" },
        // Add more if needed
    ];

    const [users, setUsers] = useState(mockUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination config
    const usersPerPage = 5;

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                    setCurrentPage(1); // reset to page 1 on search
                }}
            />

            {/* User Table */}
            <table className="table table-striped table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Status</th>
                        <th scope="col">Joined On</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">
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
                                        className={`badge ${user.status ? "bg-success" : "bg-secondary"
                                            }`}
                                    >
                                        {user.status ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>{new Date(user.joinedOn).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

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
                                className={`page-item ${currentPage === i + 1 ? "active" : ""
                                    }`}
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
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""
                                }`}
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
