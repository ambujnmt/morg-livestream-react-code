import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = ({ collapsed }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalSeries, setTotalSeries] = useState(0);
  const [totalSeasons, setTotalSeasons] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || 'Guest';

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Most Watched Series',
        data: [150, 200, 250, 300, 350, 400, 450],
        borderColor: '#10b981',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // USERS COUNT
        const usersRes = await fetch('http://127.0.0.1:8000/api/admin-list');
        const usersJson = await usersRes.json();
        if (usersJson.status) setTotalUsers(usersJson.total_users);

        // CATEGORIES COUNT
        const catRes = await fetch('http://127.0.0.1:8000/api/categories-list');
        const catJson = await catRes.json();
        if (catJson.status && Array.isArray(catJson.data)) {
          setTotalCategories(catJson.data.length);
        }

        // SEASONS COUNT
        const seasonsRes = await fetch('http://127.0.0.1:8000/api/sessions-list');
        const seasonsJson = await seasonsRes.json();
        if (seasonsJson.status && Array.isArray(seasonsJson.data)) {
          setTotalSeasons(seasonsJson.data.length);
        }

        // ✅ SERIES + VIDEOS FROM NEW API
        const seriesRes = await fetch('http://127.0.0.1:8000/api/videos-series');
        const seriesJson = await seriesRes.json();

        let seriesCount = 0;
        let videosCount = 0;

        if (seriesJson.status && Array.isArray(seriesJson.data)) {
          seriesCount = seriesJson.data.length;

          // Prefer backend total_videos if exists
          if (seriesJson.total_videos !== undefined) {
            videosCount = seriesJson.total_videos;
          } else {
            seriesJson.data.forEach(series => {
              if (series.sessions && Array.isArray(series.sessions)) {
                series.sessions.forEach(session => {
                  videosCount += session.video_count || 0;
                });
              }
            });
          }
        }

        setTotalSeries(seriesCount);
        setTotalVideos(videosCount);

      } catch (error) {
        console.error('Dashboard API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { title: 'Total Users', value: totalUsers, icon: 'bi-person', color: '#3b82f6', trend: '+10%' },
    { title: 'Total Series', value: totalSeries, icon: 'bi-tv', color: '#8b5cf6', trend: '+3%' },
    { title: 'Total Seasons', value: totalSeasons, icon: 'bi-collection-play', color: '#f59e0b', trend: '+6%' },
    { title: 'Total Videos', value: totalVideos, icon: 'bi-camera-video', color: '#ef4444', trend: '+15%' },
    { title: 'Categories', value: totalCategories, icon: 'bi-box', color: '#f97316', trend: '+12%' },
  ];

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Welcome, {userName}</h4>
        <div>
          <button className="btn btn-outline-secondary btn-sm me-2">EN</button>
          <button className="btn btn-success btn-sm">Feedback</button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {cards.map((card, index) => (
          <div className="col-xl-3 col-lg-4 col-sm-6" key={index}>
            <div className="card border-0 shadow-sm p-3 rounded-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    backgroundColor: card.color,
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <i className={`bi ${card.icon} text-white fs-5`}></i>
                </div>
                <div>
                  <div className="fw-bold fs-6">{card.value}</div>
                  <div className="text-muted small">{card.title}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header fw-bold">Most Watched Series</div>
        <div className="card-body">
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;