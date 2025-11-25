import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaTrash } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Monitorpurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Fetch token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get("https://site2demo.in/livestreaming/api/purchases-list");
      if (res.data && res.data.data) {
        setPurchases(res.data.data);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter((item) =>
    item.video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  // Delete handler with token
  const handleDelete = async (purchaseId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
      try {
        const formData = new URLSearchParams();
        formData.append("id", purchaseId);

        // Include token in headers
        const res = await axios.post(
          "https://site2demo.in/livestreaming/api/purchases-delete",
          formData,
          {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Bearer ${token}`, // Add token here
            },
          }
        );
        if (res.status === 200) {
          fetchPurchases();
          Swal.fire("Deleted!", "Your purchase has been deleted.", "success");
        }
      } catch (err) {
        console.error("Error deleting purchase:", err);
        Swal.fire("Error!", "Failed to delete the purchase.", "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Purchases List</h3>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by video title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Video Title</th>
              <th>Amount</th>
              <th>Purchase Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.user?.name || "No Name"}</td>
                  <td>{item.video?.title || "No Title"}</td>
                  <td>{item.amount}</td>
                  <td>{formatDateTime(item.purchase_date)}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleViewDetails(item)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Purchases Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal for details */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase ? (
            <div>
              <p>
                <strong>Name:</strong> {selectedPurchase.user?.name || "No Name"}
              </p>
              <p>
                <strong>Email:</strong> {selectedPurchase.user?.email || "No Email"}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedPurchase.user?.mobile || "No Mobile"}
              </p>
              <p>
                <strong>Video Title:</strong> {selectedPurchase.video?.title || "No Title"}
              </p>
              <p>
                <strong>Amount:</strong> {selectedPurchase.amount}
              </p>
              <p>
                <strong>Purchase Date:</strong> {formatDateTime(selectedPurchase.purchase_date)}
              </p>
              <p>
                <strong>Description:</strong> {selectedPurchase.video?.description || "No Description"}
              </p>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Monitorpurchases;