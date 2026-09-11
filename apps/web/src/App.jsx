import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import GuestbookPage from './pages/GuestbookPage';
import GuestbookAdminPage from './pages/GuestbookAdminPage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/guestbook" element={<GuestbookPage />} />
                <Route path="/guestbook-admin" element={<GuestbookAdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;
