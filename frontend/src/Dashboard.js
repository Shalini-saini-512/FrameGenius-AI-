import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [predictive, setPredictive] = useState(null);
  const [frames, setFrames] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me about your best-selling frame or the quality of any frame." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/insights`)
      .then((res) => res.json())
      .then(setInsights)
      .catch((err) => console.error("Insights fetch failed:", err));

    fetch(`${API}/api/predictive-sales`)
      .then((res) => res.json())
      .then(setPredictive)
      .catch((err) => console.error("Predictive fetch failed:", err));

    fetch(`${API}/api/frames`)
      .then((res) => res.json())
      .then((data) => setFrames(data.frames))
      .catch((err) => console.error("Frames fetch failed:", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      const res = await fetch(`${API}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't reach the server." },
      ]);
    }
  };

  if (!insights || !predictive) return <div className="loading">Loading dashboard...</div>;

  const maxSales = Math.max(...insights.sales_forecast.map((d) => d.sales));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2 className="dashboard-title">✨ FrameGenius Dashboard</h2>
        <div className="header-actions">
          <button className="btn-manage" onClick={() => navigate("/admin")}>
            Manage Frames
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* AI Smart Business Partner Card */}
        <div className="glass-card ai-card">
          <p className="ai-label">✨ FrameGenius AI</p>
          <p>Trending: <strong>{insights.ai_partner.trending_frame}</strong></p>
          <p>Sales Growth: <strong>+{insights.ai_partner.sales_growth}%</strong></p>
          <p className="ai-recommendation">{insights.ai_partner.recommendation}</p>
        </div>

        {/* Sales Forecasting Module */}
        <div className="glass-card forecast-card">
          <h3>Sales Forecast</h3>
          <div className="bar-chart">
            {insights.sales_forecast.map((point) => (
              <div className="bar-wrapper" key={point.month}>
                <div
                  className="bar"
                  style={{ height: `${Math.max((point.sales / maxSales) * 100, 4)}%` }}
                />
                <span className="bar-label">{point.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Sales Box */}
        <div className="glass-card predictive-card">
          <h3>Predictive Sales — {predictive.month}</h3>
          <p className="predictive-number">{predictive.predicted_units} units</p>
          <p className="predictive-sub">≈ ₹{predictive.predicted_revenue.toLocaleString()} revenue</p>
          <span className={`confidence-badge ${predictive.trend}`}>
            {predictive.confidence} confidence · trending {predictive.trend}
          </span>
        </div>
      </div>

      {/* Browse Frames Navigation */}
      <div className="browse-btn-wrapper">
        <button className="btn-browse" onClick={() => setShowGallery(true)}>
          Browse Available Frames
        </button>
      </div>

      {/* Frame Collection Gallery Modal */}
      {showGallery && (
        <div className="modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGallery(false)}>✕</button>
            <h2>Frame Collection</h2>
            <div className="frame-grid">
              {frames.map((frame) => (
                <div className="glass-card frame-item" key={frame.id}>
                  <img src={frame.image} alt={frame.name} className="frame-photo" />
                  <p>{frame.name}</p>
                  <p className="price">₹{frame.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="glass-card chatbot-card">
        <h3>💬 Ask FrameGenius AI</h3>
        <div className="chat-window">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="e.g. best selling frame, quality of Retro Gold Rim"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;