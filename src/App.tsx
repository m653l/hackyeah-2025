import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ChatBot } from './components/chat/ChatBot';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/formularz" element={<FormPage />} />
          <Route path="/wyniki" element={<ResultsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Footer />
        
        {/* AI Chatbot - dostępny na wszystkich stronach */}
        <ChatBot 
          position="bottom-right"
          theme="light"
          className="z-50"
        />
      </div>
    </Router>
  );
}

export default App;
