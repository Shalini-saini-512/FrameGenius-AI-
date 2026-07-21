import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API = process.env.REACT_APP_API_URL;

function Admin() {
  const navigate = useNavigate();
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const emptyForm = { name: "", price: "", quality: "", sales: "", image: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadFrames = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/frames`);
      const data = await res.json();
      setFrames(data.frames);
    } catch (err) {
      setError("Could not load frames. Is the backend running?");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFrames();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      quality: form.quality,
      sales: parseInt(form.sales) || 0,
      image: form.image || `https://placehold.co/300x300/a855f7/ffffff?text=${encodeURIComponent(form.name)}`,
    };

    try {
      if (editingId) {
        await fetch(`${API}/api/frames/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API}/api/frames`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      loadFrames();
    } catch (err) {
      setError("Failed to save frame. Please try again.");
    }
  };

  const handleEdit = (frame) => {
    setForm({
      name: frame.name,
      price: frame.price,
      quality: frame.quality,
      sales: frame.sales,
      image: frame.image,
    });
    setEditingId(frame.id);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/api/frames/${id}`, { method: "DELETE" });
      loadFrames();
    } catch (err) {
      setError("Failed to delete frame.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>🛠️ Manage Frames</h2>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="glass-card admin-form-card">
        <h3>{editingId ? "Edit Frame" : "Add New Frame"}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            name="name"
            placeholder="Frame name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            required
          />
          <input
            name="sales"
            type="number"
            placeholder="Units sold"
            value={form.sales}
            onChange={handleChange}
          />
          <input
            name="quality"
            placeholder="Quality / description"
            value={form.quality}
            onChange={handleChange}
            className="admin-form-wide"
          />
          <input
            name="image"
            placeholder="Image URL (optional — auto-generated if blank)"
            value={form.image}
            onChange={handleChange}
            className="admin-form-wide"
          />

          <div className="admin-form-actions">
            <button type="submit" className="btn-save">
              {editingId ? "Update Frame" : "Add Frame"}
            </button>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card admin-table-card">
        <h3>Current Inventory ({frames.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Quality</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {frames.map((frame) => (
                  <tr key={frame.id}>
                    <td>
                      <img src={frame.image} alt={frame.name} className="admin-thumb" />
                    </td>
                    <td>{frame.name}</td>
                    <td>₹{frame.price}</td>
                    <td>{frame.sales}</td>
                    <td className="admin-quality-cell">{frame.quality}</td>
                    <td className="admin-actions-cell">
                      <button className="btn-edit" onClick={() => handleEdit(frame)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(frame.id, frame.name)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;