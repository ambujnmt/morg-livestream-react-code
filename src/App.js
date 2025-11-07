import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Categories from './pages/Categories';
import Banner from './pages/Banner';
import Series from './pages/Series';
import Sessions from './pages/Sessions';
import Episode from './pages/Episode';
import Plan from './pages/Plan';
import User from './pages/Users';
import Subscription from './pages/Subscription';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Route */}
        <Route path="/" element={<Login />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/category"
          element={
            <PrivateRoute>
              <Layout>
                <Categories />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/banners"
          element={
            <PrivateRoute>
              <Layout>
                <Banner />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/series"
          element={
            <PrivateRoute>
              <Layout>
                <Series />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/season"
          element={
            <PrivateRoute>
              <Layout>
                <Sessions />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/episodes"
          element={
            <PrivateRoute>
              <Layout>
                <Episode />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/users-list"
          element={
            <PrivateRoute>
              <Layout>
                <User />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/plans"
          element={
            <PrivateRoute>
              <Layout>
                <Plan />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/subscription-list"
          element={
            <PrivateRoute>
              <Layout>
                <Subscription />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer />
    </Router>
  );
}

export default App;
