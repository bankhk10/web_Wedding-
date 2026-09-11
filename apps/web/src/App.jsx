import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import GuestbookPage from './pages/GuestbookPage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/guestbook" element={<GuestbookPage />} />
            </Routes>
        </Router>
    );
}

export default App;
