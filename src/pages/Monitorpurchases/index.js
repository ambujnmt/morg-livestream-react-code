import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaTrash } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


const BASE_URL = "https://site2demo.in/livestreaming/api";

const Monitorpurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/purchases-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("PURCHASE LIST RESPONSE:", res.data);

      // ✅ Handle all possible API structures
      if (res.data.status === true || res.data.status === 1) {
        setPurchases(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setPurchases(res.data);
      } else if (res.data.data) {
        setPurchases(res.data.data);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter((item) =>
    item?.video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  // ✅ DELETE - FULLY FIXED
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

    if (!confirmResult.isConfirmed) return;

    try {
      const formData = new URLSearchParams();
      formData.append("id", purchaseId);

      const res = await axios.post(`${BASE_URL}/purchases-delete`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DELETE RESPONSE:", res.data);

      const success =
        res.data.status === true ||
        res.data.status === 1 ||
        res.data.success === true ||
        (res.data.message &&
          res.data.message.toLowerCase().includes("success"));

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.data.message || "Purchase deleted successfully",
        });
        fetchPurchases();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: res.data.message || "Delete failed",
        });
      }
    } catch (err) {
      console.error("Delete Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Server error while deleting",
      });
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
                  <td>₹ {item.amount}</td>
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

      {/* VIEW MODAL */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase && (
            <>
              <p><strong>Name:</strong> {selectedPurchase.user?.name}</p>
              <p><strong>Email:</strong> {selectedPurchase.user?.email}</p>
              <p><strong>Mobile:</strong> {selectedPurchase.user?.mobile}</p>
              <p><strong>Video:</strong> {selectedPurchase.video?.title}</p>
              <p><strong>Amount:</strong> ₹ {selectedPurchase.amount}</p>
              <p><strong>Date:</strong> {formatDateTime(selectedPurchase.purchase_date)}</p>
              <p><strong>Description:</strong> {selectedPurchase.video?.description}</p>
            </>
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