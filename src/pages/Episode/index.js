import React, { useState, useEffect } from "react";
import { Button, Table, Form, Spinner, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import swal from "sweetalert2";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Episode = () => {
  const baseURL = "https://site2demo.in/livestreaming/api";

  const [title, setTitle] = useState("");
  const [episodeName, setEpisodeName] = useState(""); 
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
  const [useFileUpload, setUseFileUpload] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch initial data
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

  const resetForm = () => {
    setTitle("");
    setEpisodeName("");
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
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSeriesChange = (e) => {
    const selectedId = e.target.value;
    setSeriesId(selectedId);
    const selectedSeries = seriesList.find((s) => String(s.id) === String(selectedId));
    setCategoryId(selectedSeries?.category?.id || "");
  };

  const handleEdit = (video) => {
    setTitle(video.title);
    setEpisodeName(video.episode_name || ""); // Set episode name if available
    setDescription(video.description);
    setSeriesId(String(video.series_id));
    setSessionId(String(video.session_id));
    setCategoryId(String(video.category_id)); // Set categoryId for select
    setIsEditing(true);
    setEditVideoId(video.video_id);

    setUseFileUpload(!!video.video_file);
    setVideoURL(video.video_url || "");
    setVideoPreview(video.video_url || video.video_file_url || null);
    setImagePreview(video.image_url || null);

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
    if (file) setVideoPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formData = new FormData();

      formData.append("title", title);
      formData.append("episode_name", episodeName);
      formData.append("description", description);
      formData.append("series_id", seriesId);
      formData.append("session_id", sessionId);
      formData.append("category_id", categoryId);

      if (imageFile) formData.append("image", imageFile);

      if (useFileUpload) {
        if (!videoFile && !isEditing) {
          showToast("Please select a video file", "error");
          setLoading(false);
          return;
        }
        if (videoFile) formData.append("video_file", videoFile);
      } else {
        if (!videoURL && !isEditing) {
          showToast("Please enter a video URL", "error");
          setLoading(false);
          return;
        }
        formData.append("video_url", videoURL);
      }

      if (isEditing) formData.append("video_id", editVideoId);

      await axios.post(
        `${baseURL}/${isEditing ? "videos-update" : "videos-upload"}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      showToast(isEditing ? "Video updated!" : "Video uploaded!", "success");
      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error uploading video:", error);
      showToast("Error uploading video", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
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
        onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* CENTERED MODAL */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Video" : "Upload Video"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleFormSubmit}>
            {/* Series */}
            <div className="mb-3">
              <label className="form-label">Series</label>
              <select
                className="form-select"
                value={seriesId}
                onChange={(e) => {
                  handleSeriesChange(e);
                }}
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

            {/* Episode Name */}
            <div className="mb-3">
              <label className="form-label">Episode Name</label>
              <input
                type="text"
                className="form-control"
                value={episodeName}
                onChange={(e) => setEpisodeName(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div className="mb-3">
              <label className="form-label">Season</label>
              <select
                className="form-select"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                required
              >
                <option value="">Select Season</option>
                {sessionsList.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
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

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Video Upload Toggle */}
            <div className="mb-3 form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={useFileUpload}
                onChange={() => setUseFileUpload(!useFileUpload)}
                id="toggleUpload"
              />
              <label className="form-check-label" htmlFor="toggleUpload">
                {useFileUpload ? "Upload Video File" : "Use Video URL"}
              </label>
            </div>

            {/* Video File or URL */}
            {useFileUpload ? (
              <div className="mb-3">
                <label>Video File (Max 50MB)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  required={!isEditing}
                />
              </div>
            ) : (
              <div className="mb-3">
                <label>Video URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={videoURL}
                  onChange={(e) => setVideoURL(e.target.value)}
                  required={!isEditing}
                />
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <video
                src={videoPreview}
                width="100%"
                controls
                style={{ borderRadius: "8px" }}
              ></video>
            )}

            {/* Episode Image */}
            <div className="mb-3">
              <label>Episode Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                width="150"
                style={{ borderRadius: "8px" }}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Please wait...
                </>
              ) : isEditing ? (
                "Update Episode"
              ) : (
                "Upload Episode"
              )}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Toast Container */}
      <ToastContainer theme="colored" newestOnTop />
    </div>
  );
};

export default Episode;