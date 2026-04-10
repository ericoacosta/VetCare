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

  // --- ACTIONS ---
  const doAction = async (action, id) => {
    if (!id) return alert("Missing ID—data parsing error.");
    let error;

    if (action === 'delete' && window.confirm("Delete this appointment?")) {
      const result = await supabase.from('reservations').delete().eq('id', id);
      error = result.error;
    } else if (action === 'complete') {
      const result = await supabase.from('reservations').update({ status: 'Completed' }).eq('id', id);
      error = result.error;
    } else if (action === 'time') {
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (newDate) {
        const result = await supabase.from('reservations').update({ appointment_date: newDate }).eq('id', id);
        error = result.error;
      }
    }
    
    if (error) alert("Error: " + error.message);
    else fetchReservations();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Appointments Overview</h2>
          <button className="logout-button" onClick={() => supabase.auth.signOut()}>Logout</button>
        </div>

        <div className="appointment-grid">
          {reservations.map((owner) => {
            const pet = owner.pets?.[0] || {};
            const res = pet.reservations?.[0] || {};
            
            return (
              <div key={owner.id} className={`pet-card ${res.status === 'Completed' ? 'completed' : ''}`}>
                
                {/* Segment 1: Top (Status & Icon) */}
                <div className="card-segment-top">
                  <span className={`status-pill status-${res.status?.toLowerCase() || 'pending'}`}>
                    {res.status || 'Pending'}
                  </span>
                  <div className="card-icon">🐾</div>
                </div>

                {/* Segment 2: Mid (Pet & Owner Info) */}
                <div className="card-segment-mid">
                  <div className="mid-sub">PET DETAILS</div>
                  <div className="mid-title">{pet.pet_name || "—"}</div>
                  <div className="mid-sub" style={{margin:'5px 0 10px'}}>{pet.size || "—"} Pet</div>
                  
                  <div className="mid-sub">DATE</div>
                  <div className="mid-title" style={{color:'#6c5ce7'}}>{res.appointment_date || "—"}</div>

                  <div className="owner-info">
                    Owner: <span>{owner.owner_name}</span><br/>
                    Phone: <span>{owner.contact_no}</span>
                  </div>
                </div>

                {/* Segment 3: Bottom (Actions) - THESE CANNOT BE NOTHING */}
                <div className="card-segment-bot">
                  <button className="segment-btn btn-time" onClick={() => doAction('time', res.id)}>
                    <span>📅</span> Time
                  </button>
                  <button className="segment-btn btn-complete" onClick={() => doAction('complete', res.id)}>
                    <span>✅</span> Done
                  </button>
                  <button className="segment-btn btn-delete" onClick={() => doAction('delete', res.id)}>
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
