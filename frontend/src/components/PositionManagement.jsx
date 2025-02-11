import React, { useState, useEffect } from "react";

const PositionManagement = () => {
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/positions/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPositions(data))
      .catch((err) => console.error("Error fetching positions:", err));
  }, [token]);

  const handleAddPosition = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/positions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newPosition }),
    })
      .then((res) => res.json())
      .then((pos) => {
        setPositions([...positions, pos]);
        setNewPosition("");
      })
      .catch((err) => console.error("Error adding position:", err));
  };

  const handleDeletePosition = (id) => {
    if (!window.confirm("Are you sure?")) return;
    fetch(`http://127.0.0.1:8000/api/positions/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setPositions(positions.filter((pos) => pos.id !== id));
      })
      .catch((err) => console.error("Error deleting position:", err));
  };

  return (
    <div className="position-management">
      <h1>Position Management</h1>
      <form onSubmit={handleAddPosition}>
        <input
          type="text"
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
          placeholder="Position Title"
          required
        />
        <button type="submit">Add Position</button>
      </form>
      <ul>
        {positions.map((pos) => (
          <li key={pos.id}>
            {pos.title}{" "}
            <button onClick={() => handleDeletePosition(pos.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PositionManagement;
