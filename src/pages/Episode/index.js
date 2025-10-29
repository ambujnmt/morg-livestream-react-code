import React, { useState, useEffect } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Episode = () => {
    const baseURL = "https://site2demo.in/livestreaming/api";
    const fileBaseURL = "https://site2demo.in/livestreaming/";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [seriesId, setSeriesId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [seriesList, setSeriesList] = useState([]);
    const [sessionsList, setSessionsList] = useState([]);
    const [episodesList, setEpisodesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editVideoId, setEditVideoId] = useState(null);

    useEffect(() => {
        fetchDropdownData();
        fetchVideos();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [seriesRes, sessionsRes] = await Promise.all([
                axios.get(`${baseURL}/series-list`),
                axios.get(`${baseURL}/sessions-list`),
            ]);
            setSeriesList(seriesRes.data.data || []);
            setSessionsList(sessionsRes.data.data || []);
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
        const date = new Date(releaseDate);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    // Flatten nested videos for table
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("series_id", seriesId);
        formData.append("session_id", sessionId);
        if (videoFile) formData.append("video_file", videoFile);

        try {
            if (isEditing) {
                formData.append("video_id", editVideoId);
                await axios.post(`${baseURL}/videos-update`, formData);
                toast.success("Video updated successfully");
            } else {
                await axios.post(`${baseURL}/videos-upload`, formData);
                toast.success("Video uploaded successfully");
            }
            setShowModal(false);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error("Error uploading video:", error);
            toast.error("Error uploading video");
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setVideoFile(null);
        setVideoPreview(null);
        setSeriesId("");
        setSessionId("");
        setIsEditing(false);
        setEditVideoId(null);
    };

    // ✅ FIXED: Series & Session preselect in edit mode
    const handleEdit = (video) => {
        let detectedSeriesId = video.series_id;
        let detectedSessionId = video.session_id;

        // If missing, find parent series/session IDs
        if (!detectedSeriesId || !detectedSessionId) {
            episodesList.forEach((series) => {
                series.sessions.forEach((session) => {
                    const found = session.videos.find(
                        (v) => v.video_id === video.video_id
                    );
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
        setIsEditing(true);
        setEditVideoId(video.video_id);
        setVideoPreview(video.video_url ? video.video_url : null);
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
                        toast.success("Video deleted successfully");
                        fetchVideos();
                    } catch (error) {
                        console.error("Error deleting video:", error);
                        toast.error("Error deleting video");
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
                    Upload Video
                </Button>
            </div>

            <Form.Control
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-4"
            />

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Series</th>
                        <th>Session</th>
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
                                <td>{video.title}</td>
                                <td>{video.series_title}</td>
                                <td>{video.session_title}</td>
                                <td>{formatReleaseDate(video.release_date)}</td>
                                <td>
                                    {video.video_url ? (
                                        <a
                                            href={video.video_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
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
                                        onClick={() =>
                                            handleDelete(video.video_id)
                                        }
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
                            <h5 className="modal-title">
                                {isEditing ? "Edit Video" : "Upload Video"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Video File
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleFileChange}
                                        required={!isEditing}
                                    />
                                </div>

                                {videoPreview && (
                                    <div className="mb-3">
                                        <video
                                            src={videoPreview}
                                            controls
                                            width="100%"
                                            style={{
                                                borderRadius: "5px",
                                            }}
                                        ></video>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        required
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Series</label>
                                    <select
                                        className="form-select"
                                        value={seriesId}
                                        onChange={(e) =>
                                            setSeriesId(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select Series</option>
                                        {seriesList.map((series) => (
                                            <option
                                                key={series.id || series.series_id}
                                                value={series.id || series.series_id}
                                            >
                                                {series.title || series.series_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Session
                                    </label>
                                    <select
                                        className="form-select"
                                        value={sessionId}
                                        onChange={(e) =>
                                            setSessionId(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Session
                                        </option>
                                        {sessionsList.map((session) => (
                                            <option
                                                key={session.id || session.session_id}
                                                value={
                                                    session.id || session.session_id
                                                }
                                            >
                                                {session.title ||
                                                    session.session_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button type="submit" variant="primary">
                                    {isEditing ? "Update" : "Upload"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <div className="modal-backdrop fade show"></div>}
            <ToastContainer />
        </div>
    );
};

export default Episode;
