import React, { useState, useEffect } from "react";
import { Button, Table, Form, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Episode = () => {
    const baseURL = "https://site2demo.in/livestreaming/api";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [videoURL, setVideoURL] = useState("");
    const [videoPreview, setVideoPreview] = useState(null);
    const [seriesId, setSeriesId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [seriesList, setSeriesList] = useState([]);
    const [sessionsList, setSessionsList] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [episodesList, setEpisodesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editVideoId, setEditVideoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastId, setToastId] = useState(null);
    const [useFileUpload, setUseFileUpload] = useState(false); // Toggle between URL & File

    useEffect(() => {
        fetchDropdownData();
        fetchVideos();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [seriesRes, sessionsRes, categoriesRes] = await Promise.all([
                axios.get(`${baseURL}/series-list`),
                axios.get(`${baseURL}/sessions-list`),
                axios.get(`${baseURL}/categories-list`),
            ]);

            setSeriesList(seriesRes.data.data || []);
            setSessionsList(sessionsRes.data.data || []);
            setCategoriesList(categoriesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${baseURL}/videos-series`);
            setEpisodesList(res.data.data || []);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    const formatReleaseDate = (releaseDate) => {
        if (!releaseDate) return "-";
        const date = new Date(releaseDate);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredEpisodes = episodesList
        .flatMap((series) =>
            series.sessions.flatMap((session) =>
                session.videos.map((video) => ({
                    ...video,
                    series_id: series.series_id,
                    session_id: session.session_id,
                    series_title: series.series_title,
                    session_title: session.session_title,
                }))
            )
        )
        .filter((video) =>
            video.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const showToast = (message, type = "success") => {
        if (!toast.isActive(toastId)) {
            const id =
                type === "success"
                    ? toast.success(message, { autoClose: 2500, toastId: "unique", theme: "colored" })
                    : toast.error(message, { autoClose: 2500, toastId: "unique", theme: "colored" });
            setToastId(id);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (useFileUpload) {
                if (!videoFile && !isEditing) {
                    showToast("Please select a video file", "error");
                    setLoading(false);
                    return;
                }

                if (videoFile && videoFile.size > 50 * 1024 * 1024) {
                    showToast("Video file should be less than 50MB", "error");
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append("title", title);
                formData.append("description", description);
                formData.append("series_id", seriesId);
                formData.append("session_id", sessionId);
                formData.append("category_id", categoryId);
                if (videoFile) formData.append("video_file", videoFile);
                if (isEditing) formData.append("video_id", editVideoId);

                await axios.post(`${baseURL}/${isEditing ? "videos-update" : "videos-upload"}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                if (!videoURL && !isEditing) {
                    showToast("Please enter a video URL", "error");
                    setLoading(false);
                    return;
                }

                const payload = {
                    title,
                    description,
                    series_id: seriesId,
                    session_id: sessionId,
                    category_id: categoryId,
                    video_url: videoURL,
                };
                if (isEditing) payload.video_id = editVideoId;

                await axios.post(`${baseURL}/${isEditing ? "videos-update" : "videos-upload"}`, payload, {
                    headers: { "Content-Type": "application/json" }
                });
            }

            showToast(isEditing ? "Video updated successfully" : "Video uploaded successfully", "success");
            setShowModal(false);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error("Error uploading video:", error.response || error);
            showToast("Error uploading video", "error");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setVideoFile(null);
        setVideoURL("");
        setVideoPreview(null);
        setSeriesId("");
        setSessionId("");
        setCategoryId("");
        setIsEditing(false);
        setEditVideoId(null);
        setUseFileUpload(false);
    };

    const handleSeriesChange = (e) => {
        const selectedId = e.target.value;
        setSeriesId(selectedId);
        const selectedSeries = seriesList.find((s) => String(s.id) === String(selectedId));
        if (selectedSeries && selectedSeries.category) {
            setCategoryId(String(selectedSeries.category.id));
        } else {
            setCategoryId("");
        }
    };

    const handleEdit = (video) => {
        let detectedSeriesId = video.series_id;
        let detectedSessionId = video.session_id;

        if (!detectedSeriesId || !detectedSessionId) {
            episodesList.forEach((series) => {
                series.sessions.forEach((session) => {
                    const found = session.videos.find((v) => v.video_id === video.video_id);
                    if (found) {
                        detectedSeriesId = series.series_id;
                        detectedSessionId = session.session_id;
                    }
                });
            });
        }

        setTitle(video.title);
        setDescription(video.description);
        setSeriesId(String(detectedSeriesId || ""));
        setSessionId(String(detectedSessionId || ""));
        setCategoryId(String(video.category_id || ""));
        setIsEditing(true);
        setEditVideoId(video.video_id);
        setUseFileUpload(!!video.video_file); // Toggle if file or URL
        setVideoFile(null);
        setVideoURL(video.video_url || "");
        setVideoPreview(video.video_url || (video.video_file ? video.video_file_url : null));
        setShowModal(true);
    };

    const handleDelete = (videoId) => {
        swal
            .fire({
                title: "Are you sure?",
                text: "This will permanently delete the video!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
            })
            .then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const formData = new FormData();
                        formData.append("video_id", videoId);
                        await axios.post(`${baseURL}/videos-delete`, formData);
                        showToast("Video deleted successfully", "success");
                        fetchVideos();
                    } catch (error) {
                        console.error("Error deleting video:", error);
                        showToast("Error deleting video", "error");
                    }
                }
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setVideoFile(file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setVideoPreview(previewUrl);
        }
    };

    const handleURLChange = (e) => {
        const url = e.target.value;
        setVideoURL(url);
        setVideoPreview(url);
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between mb-3">
                <h2>Episodes</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    Add New Episode
                </Button>
            </div>

            <Form.Control
                type="text"
                placeholder="Search episode..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-4"
            />

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Series</th>
                        <th>Season</th>
                        <th>Title</th>
                        <th>Release Date</th>
                        <th>Video</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEpisodes.length > 0 ? (
                        filteredEpisodes.map((video, index) => (
                            <tr key={video.video_id}>
                                <td>{index + 1}</td>
                                <td>{video.series_title}</td>
                                <td>{video.session_title}</td>
                                <td>{video.title}</td>
                                <td>{formatReleaseDate(video.release_date)}</td>
                                <td>
                                    {video.video_url ? (
                                        <a href={video.video_url} target="_blank" rel="noreferrer">
                                            View
                                        </a>
                                    ) : video.video_file ? (
                                        <a href={video.video_file_url} target="_blank" rel="noreferrer">
                                            View
                                        </a>
                                    ) : (
                                        "No Video"
                                    )}
                                </td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit(video)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(video.video_id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No videos found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal */}
            <div
                className={`modal fade ${showModal ? "show" : ""}`}
                style={{ display: showModal ? "block" : "none" }}
                tabIndex="-1"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? "Edit Video" : "Upload Video"}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleFormSubmit}>
                                {/* Series Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label">Series name</label>
                                    <select
                                        className="form-select"
                                        value={seriesId}
                                        onChange={handleSeriesChange}
                                        required
                                    >
                                        <option value="">Select Series</option>
                                        {seriesList.map((series) => (
                                            <option key={series.id} value={series.id}>
                                                {series.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Display */}
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    {categoryId ? (
                                        <div className="form-control bg-light">
                                            {categoriesList.find((cat) => String(cat.id) === String(categoryId))?.name || "N/A"}
                                        </div>
                                    ) : (
                                        <div className="form-control bg-light text-muted">
                                            Select a series to see its category
                                        </div>
                                    )}
                                </div>

                                {/* Session Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label">Season name</label>
                                    <select
                                        className="form-select"
                                        value={sessionId}
                                        onChange={(e) => setSessionId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Session</option>
                                        {sessionsList.map((session) => (
                                            <option key={session.id} value={session.id}>
                                                {session.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                {/* Toggle between File Upload and URL */}
                                <div className="mb-3 form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={useFileUpload}
                                        onChange={() => setUseFileUpload(!useFileUpload)}
                                        id="toggleUpload"
                                    />
                                    <label className="form-check-label" htmlFor="toggleUpload">
                                        {useFileUpload ? "Use File Upload" : "Use Video URL"}
                                    </label>
                                </div>

                                {useFileUpload ? (
                                    <div className="mb-3">
                                        <label className="form-label">Video File (Max 50MB)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            required={!isEditing}
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label">Video URL</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            value={videoURL}
                                            onChange={handleURLChange}
                                            required={!isEditing}
                                        />
                                    </div>
                                )}

                                {videoPreview && (
                                    <div className="mb-3">
                                        <video
                                            src={videoPreview}
                                            controls
                                            width="100%"
                                            style={{ borderRadius: "5px" }}
                                        ></video>
                                    </div>
                                )}

                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Please wait...
                                        </>
                                    ) : isEditing ? (
                                        "Update"
                                    ) : (
                                        "Upload"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <div className="modal-backdrop fade show"></div>}

            <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
                newestOnTop
            />
        </div>
    );
};

export default Episode;
