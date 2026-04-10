import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import './Dashboard.css';

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        id, owner_name, contact_no,
        pets ( id, pet_name, size,
          reservations (id, appointment_date, status)
        )
      `);
    if (error) console.error("Fetch error:", error);
    else setReservations(data || []);
  }

  const handleAction = async (type, id) => {
    if (!id) return alert("No Reservation ID found. Try refreshing.");
    
    if (type === 'delete' && window.confirm("Delete this booking?")) {
      await supabase.from('reservations').delete().eq('id', id);
    } else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', id);
    } else if (type === 'time') {
      const date = prompt("Enter new date (YYYY-MM-DD):");
      if (date) await supabase.from('reservations').update({ appointment_date: date }).eq('id', id);
    }
    fetchReservations();
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-sidebar">
        <div className="logo">🐾 VetCare</div>
        <button className="logout-btn" onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>

      <div className="dashboard-main">
        <header>
          <h1>Active Appointments</h1>
          <p>Manage your upcoming pet visits</p>
        </header>

        <div className="canva-grid">
          {reservations.map((owner) => {
            const pet = owner.pets?.[0] || {};
            const res = pet.reservations?.[0] || {};
            
            return (
              <div key={owner.id} className={`canva-card ${res.status === 'Completed' ? 'is-done' : ''}`}>
                <div className="card-header">
                  <span className="status-badge">{res.status || 'Pending'}</span>
                  <span className="pet-icon">🐶</span>
                </div>
                
                <div className="card-content">
                  <h3 className="pet-name">{pet.pet_name || "New Patient"}</h3>
                  <div className="info-group">
                    <label>APPOINTMENT DATE</label>
                    <div className="info-value date-text">{res.appointment_date || "TBD"}</div>
                  </div>
                  <div className="info-group">
                    <label>OWNER</label>
                    <div className="info-value">{owner.owner_name} • {owner.contact_no}</div>
                  </div>
                </div>

                <div className="card-footer-actions">
                  <button className="btn-action time" onClick={() => handleAction('time', res.id)}>Time</button>
                  <button className="btn-action done" onClick={() => handleAction('complete', res.id)}>Done</button>
                  <button className="btn-action del" onClick={() => handleAction('delete', res.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
