import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "https://site2demo.in/livestreaming/api/admin-login";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            const data = await response.json();

            if (data.status) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setMessage("Login successful");
                navigate("/dashboard");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center vh-100">
            <div className="login-card p-4 shadow-lg">
                <h3 className="text-center mb-4 text-dark fw-bold">Login</h3>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    {/* Email */}
                    <div className="mb-3 text-start">
                        <label htmlFor="email" className="form-label text-dark fw-semibold">
                            Email address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3 text-start">
                        <label
                            htmlFor="password"
                            className="form-label text-dark fw-semibold"
                        >
                            Password
                        </label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="input-group-text bg-white"
                                onClick={togglePassword}
                                style={{ cursor: "pointer" }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {/* Remember me */}
                    <div className="form-check mb-3 text-start">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                        />
                        <label className="form-check-label text-dark" htmlFor="rememberMe">
                            Remember Me
                        </label>
                    </div>

                    <button type="submit" className="btn btn-warning w-100 fw-bold">
                        Login
                    </button>

                    <div className="text-center mt-3">
                        <a href="#" className="text-decoration-none text-primary fw-semibold">
                            Forgot password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
