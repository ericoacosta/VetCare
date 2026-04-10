import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import './Dashboard.css';

export default function Dashboard({ handleLogout }) {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const { data, error } = await supabase.from('owners').select(`id, owner_name, contact_no, pets ( id, pet_name, size, reservations (id, appointment_date, status))`);
    if (!error) setReservations(data);
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleAction = async (type, resId) => {
    if (!resId) return;
    if (type === 'delete' && window.confirm("Delete?")) {
      await supabase.from('reservations').delete().eq('id', resId);
    } else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', resId);
    } else if (type === 'time') {
      const d = prompt("New Date (YYYY-MM-DD):");
      if (d) await supabase.from('reservations').update({ appointment_date: d }).eq('id', resId);
    }
    fetchReservations();
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-top-nav">
        <h1>Staff Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="canva-grid">
        {reservations.map((owner, i) => {
          const pet = owner.pets?.[0] || {};
          const res = pet.reservations?.[0] || {};
          return (
            <div key={i} className="canva-card">
              <div className="status-badge pending">{res.status || 'Pending'}</div>
              <h3 className="pet-name">🐶 {pet.pet_name}</h3>
              <p><strong>Owner:</strong> {owner.owner_name}</p>
              <p className="date-highlight">📅 {res.appointment_date}</p>
              <div className="card-footer">
                <button className="btn-action time" onClick={() => handleAction('time', res.id)}>Time</button>
                <button className="btn-action done" onClick={() => handleAction('complete', res.id)}>Done</button>
                <button className="btn-action del" onClick={() => handleAction('delete', res.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
