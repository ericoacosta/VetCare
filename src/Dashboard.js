import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import './Dashboard.css';

export default function Dashboard({ handleLogout }) {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        id, owner_name, contact_no, 
        pets ( id, pet_name, size, 
          reservations (id, appointment_date, status)
        )
      `);
    if (!error) setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleAction = async (type, resId) => {
    if (!resId) return;
    if (type === 'delete' && window.confirm("Delete this appointment?")) {
      await supabase.from('reservations').delete().eq('id', resId);
    } else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', resId);
    } else if (type === 'time') {
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (newDate) await supabase.from('reservations').update({ appointment_date: newDate }).eq('id', resId);
    }
    fetchReservations();
  };

  return (
    <div className="dashboard-outer">
      <nav className="canva-nav">
        <div className="brand">🐾 VetCare<span>Staff</span></div>
        <button className="logout-pill" onClick={handleLogout}>Sign Out</button>
      </nav>

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
                <span className="pet-emoji">🐶</span>
              </div>
              
              <div className="card-mid">
                <h3 className="pet-name">{pet.pet_name || "New Patient"}</h3>
                <div className="meta-tag">{pet.size}</div>
                
                <div className="info-block">
                  <small>APPOINTMENT</small>
                  <p className="date-text">📅 {res.appointment_date || "TBD"}</p>
                </div>

                <div className="info-block">
                  <small>OWNER DETAILS</small>
                  <p>{owner.owner_name} • {owner.contact_no}</p>
                </div>
              </div>

              <div className="card-actions-row">
                <button className="btn-action t-btn" onClick={() => handleAction('time', res.id)}>Time</button>
                <button className="btn-action c-btn" onClick={() => handleAction('complete', res.id)}>Done</button>
                <button className="btn-action d-btn" onClick={() => handleAction('delete', res.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
