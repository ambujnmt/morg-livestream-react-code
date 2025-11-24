import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';

const Subscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const API_URL = 'https://site2demo.in/livestreaming/api/subscription-list';
    const DELETE_URL = 'https://site2demo.in/livestreaming/api/subscription-delete';

    const formatDate = (dateStr) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-GB', options);
    };


    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API_URL, new FormData(), {
                headers: { Accept: 'application/json' },
            });

            if (res.data.status) {
                // Flatten all subscriptions into a single array
                const allSubs = res.data.data.flatMap((user) =>
                    user.subscriptions.map((sub) => ({
                        ...sub,
                        user_name: user.user_name,
                        email: user.email,
                        user_id: user.user_id,
                    }))
                );
                setSubscriptions(allSubs);
            } else {
                toast.error(res.data.message || 'Failed to fetch subscriptions');
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error('Something went wrong while fetching subscriptions');
        }
        setLoading(false);
    };

    // Delete subscription with SweetAlert confirmation
    const handleDelete = async (subscriptionId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this subscription!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        DELETE_URL,
                        { subscription_id: subscriptionId },
                        { headers: { Accept: 'application/json' } }
                    );
                    toast.success('Subscription deleted successfully');
                    fetchSubscriptions();
                } catch (error) {
                    console.error(error.response?.data || error.message);
                    toast.error('Failed to delete subscription');
                }
            }
        });
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Filter subscriptions based on search input
    const filteredSubscriptions = subscriptions.filter((sub) => {
        const term = search.toLowerCase();
        return (
            sub.user_name.toLowerCase().includes(term) ||
            sub.email.toLowerCase().includes(term) ||
            sub.plan_name.toLowerCase().includes(term) ||
            sub.plan_price.toString().includes(term) ||
            sub.status.toLowerCase().includes(term)
        );
    });

    return (
        <div className="container mt-4">
            <h3>Subscriptions</h3>

            {/* Search input */}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by any column..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filteredSubscriptions.length > 0 ? (
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Plan Name</th>
                            <th>Plan Price</th>
                            <th>Status</th>
                            <th>Starts At</th>
                            <th>Expires At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscriptions.map((sub, idx) => (
                            <tr key={sub.subscription_id}>
                                <td>{idx + 1}</td>
                                <td>{sub.user_name}</td>
                                <td>{sub.email}</td>
                                <td>{sub.plan_name}</td>
                                <td>{sub.plan_price}</td>
                                <td>{sub.status}</td>
                                <td>{formatDate(sub.starts_at)}</td>
                                <td>{formatDate(sub.expires_at)}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(sub.subscription_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No subscriptions found</p>
            )}
        </div>
    );
};

export default Subscription;
