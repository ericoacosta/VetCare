import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import './App.css';

function App() {
  const [view, setView] = useState("booking"); 
  const [session, setSession] = useState(null);
  const [reservations, setReservations] = useState([]);
  
  const [formData, setFormData] = useState({
    ownerName: "",
    contactNo: "",
    petName: "",
    size: "small",
    address: "",
    date: ""
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check login status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView("dashboard");
    });
  }, []);

  // Fetch data for the dashboard
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
    else console.error("Fetch error:", error.message);
  };

  useEffect(() => {
    if (session && view === "dashboard") fetchReservations();
  }, [session, view]);

  // Login/Logout Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Failed: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("booking");
  };

  // Action Buttons Logic (Time, Done, Delete)
  const handleAction = async (type, resId) => {
    if (!resId) return alert("Reservation ID not found.");

    if (type === 'delete' && window.confirm("Delete this appointment?")) {
      await supabase.from('reservations').delete().eq('id', resId);
    } else if (type === 'complete') {
      await supabase.from('reservations').update({ status: 'Completed' }).eq('id', resId);
    } else if (type === 'time') {
      const newDate = prompt("Enter new date (YYYY-MM-DD):");
      if (newDate) await supabase.from('reservations').update({ appointment_date: newDate }).eq('id', resId);
    }
    fetchReservations(); // Refresh the list
  };

  // Save New Booking
  const saveReservation = async (e) => {
    e.preventDefault();
    try {
      const { data: oData, error: oErr } = await supabase.from('owners').insert([{ owner_name: formData.ownerName, contact_no: formData.contactNo, address: formData.address }]).select();
      if (oErr) throw oErr;
      const { data: pData, error: pErr } = await supabase.from('pets').insert([{ owner_id: oData[0].id, pet_name: formData.petName, size: formData.size }]).select();
      if (pErr) throw pErr;
      const { error: rErr } = await supabase.from('reservations').insert([{ pet_id: pData[0].id, appointment_date: formData.date, status: 'Pending' }]);
      if (rErr) throw rErr;
      
      alert("Reservation Saved!");
      setFormData({ ownerName: "", contactNo: "", petName: "", size: "small", address: "", date: "" });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="App">
      {/* Staff Login Trigger */}
      {view === "booking" && (
        <button className="corner-login-btn" onClick={() => setView("login")}>Staff Portal</button>
      )}

      <div className={`App-header ${view === "dashboard" ? "dashboard-view" : ""}`}>
        
        {/* LOGIN VIEW */}
        {view === "login" && (
          <div className="glass-card">
            <h2>Staff Sign-In</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="primary-btn">Sign In</button>
              <button type="button" className="admin-link-btn" onClick={() => setView("booking")}>Back to Booking</button>
            </form>
          </div>
        )}

        {/* DASHBOARD VIEW (CANVA STYLE) */}
        {view === "dashboard" && (
          <div className="dashboard-wrapper">
            <div className="dashboard-top-nav">
              <h1>Active Appointments</h1>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <div className="canva-grid">
              {reservations.map((owner, i) => {
                const pet = owner.pets?.[0] || {};
                const res = pet.reservations?.[0] || {};
                
                return (
                  <div key={i} className={`canva-card ${res.status === 'Completed' ? 'is-done' : ''}`}>
                    <div className="card-header">
                      <span className={`status-badge ${res.status === 'Completed' ? 'done' : 'pending'}`}>
                        {res.status || 'Pending'}
                      </span>
                      <span className="pet-emoji">🐶</span>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="pet-name">{pet.pet_name || "New Patient"}</h3>
                      <div className="meta-tag">{pet.size}</div>
                      
                      <div className="detail-group">
                        <label>APPOINTMENT DATE</label>
                        <p className="date-highlight">📅 {res.appointment_date || "Not set"}</p>
                      </div>

                      <div className="detail-group">
                        <label>OWNER</label>
                        <p>{owner.owner_name} • {owner.contact_no}</p>
                      </div>
                    </div>

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
        )}

        {/* BOOKING VIEW */}
        {view === "booking" && (
          <div className="glass-card">
            <h1>PawCare Booking</h1>
            <form onSubmit={saveReservation}>
              <div className="input-grid">
                <div className="input-group">
                  <label>Owner Name</label>
                  <input placeholder="Name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input placeholder="09..." value={formData.contactNo} onChange={(e) => setFormData({...formData, contactNo: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>Address</label>
                <input placeholder="City" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="input-grid">
                <div className="input-group">
                  <label>Pet Name</label>
                  <input placeholder="Pet Name" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Size</label>
                  <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Appointment Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              <button type="submit" className="primary-btn">Confirm Booking</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
