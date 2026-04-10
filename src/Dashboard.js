import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import './Dashboard.css';

export default function Dashboard({ handleLogout }) {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        id, owner_name, contact_no, address,
        pets ( id, pet_name, size, 
          reservations (id, appointment_date, status)
        )
      `);
    if (!error) setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleAction = async (type, resId, ownerId) => {
    if (type === 'delete' && window.confirm("Delete this entire record and appointment?")) {
      // Deleting the owner removes the entire card from your dashboard
      const { error } = await supabase.from('owners').delete().eq('id', ownerId);
      if (error) alert("Delete Error: " + error.message);
    } 
    
    else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', resId);
    } 
    
    else if (type === 'time') {
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (newDate) {
        await supabase.from('reservations').update({ appointment_date: newDate }).eq('id', resId);
      }
    }
    
    // Refresh the list after any action
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
                  <p><strong>{owner.owner_name}</strong></p>
                  <p>{owner.contact_no}</p>
                  <p style={{fontSize: '0.8rem', color: '#666'}}>{owner.address}</p>
                </div>
              </div>

              <div className="card-actions-row">
                <button className="btn-action t-btn" onClick={() => handleAction('time', res.id, owner.id)}>Time</button>
                <button className="btn-action c-btn" onClick={() => handleAction('complete', res.id, owner.id)}>Done</button>
                <button className="btn-action d-btn" onClick={() => handleAction('delete', res.id, owner.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
