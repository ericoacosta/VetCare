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
    if (error) console.error("Database Error:", error);
    else setReservations(data || []);
  }

  const handleUpdate = async (type, id) => {
    if (!id) return alert("Notice: This pet needs an appointment created first.");
    
    if (type === 'delete' && window.confirm("Delete booking?")) {
      await supabase.from('reservations').delete().eq('id', id);
    } else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', id);
    } else if (type === 'time') {
      const date = prompt("Set New Date (YYYY-MM-DD):");
      if (date) await supabase.from('reservations').update({ appointment_date: date }).eq('id', id);
    }
    fetchReservations();
  };

  return (
    <div className="dashboard-outer">
      <nav className="canva-nav">
        <div className="brand">🐾 VetCare<span>Staff</span></div>
        <button className="logout-pill" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </nav>

      <div className="dashboard-content">
        <div className="content-header">
          <h1>Active Appointments</h1>
          <p>Manage patient bookings and schedules</p>
        </div>

        <div className="canva-grid">
          {reservations.map((owner) => {
            const pet = owner.pets?.[0] || {};
            const res = pet.reservations?.[0] || {};
            
            return (
              <div key={owner.id} className={`canva-card ${res.status === 'Completed' ? 'is-complete' : ''}`}>
                <div className="card-top">
                  <span className={`status-label ${res.status?.toLowerCase() || 'pending'}`}>
                    {res.status || 'Pending'}
                  </span>
                  <span className="pet-avatar">🐶</span>
                </div>
                
                <div className="card-mid">
                  <h3 className="pet-name">{pet.pet_name || "New Guest"}</h3>
                  <div className="tag-row">
                    <span className="size-tag">{pet.size}</span>
                  </div>
                  
                  <div className="info-block">
                    <small>APPOINTMENT</small>
                    <p className="date-text">📅 {res.appointment_date || "Not Scheduled"}</p>
                  </div>

                  <div className="info-block">
                    <small>OWNER DETAILS</small>
                    <p>{owner.owner_name} • {owner.contact_no}</p>
                  </div>
                </div>

                <div className="card-actions-row">
                  <button className="btn-action t-btn" onClick={() => handleUpdate('time', res.id)}>Time</button>
                  <button className="btn-action c-btn" onClick={() => handleUpdate('complete', res.id)}>Done</button>
                  <button className="btn-action d-btn" onClick={() => handleUpdate('delete', res.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
