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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView("dashboard");
    });
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('owners')
      .select(`owner_name, contact_no, address, pets (pet_name, size, reservations (appointment_date))`);
    if (!error) setReservations(data);
  };

  useEffect(() => {
    if (session && view === "dashboard") fetchReservations();
  }, [session, view]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Failed: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("booking");
  };

  const saveReservation = async (e) => {
    e.preventDefault();
    try {
      const { data: oData, error: oErr } = await supabase.from('owners').insert([{ owner_name: formData.ownerName, contact_no: formData.contactNo, address: formData.address }]).select();
      if (oErr) throw oErr;
      const { data: pData, error: pErr } = await supabase.from('pets').insert([{ owner_id: oData[0].id, pet_name: formData.petName, size: formData.size }]).select();
      if (pErr) throw pErr;
      const { error: rErr } = await supabase.from('reservations').insert([{ pet_id: pData[0].id, appointment_date: formData.date }]);
      if (rErr) throw rErr;
      alert("Reservation Saved!");
      setFormData({ ownerName: "", contactNo: "", petName: "", size: "small", address: "", date: "" });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="App">
      {view === "booking" && (
        <button className="corner-login-btn" onClick={() => setView("login")}>
          Staff Login
        </button>
      )}

      <div className={`App-header ${view === "dashboard" ? "dashboard-view" : ""}`}>
        
        {view === "login" && (
          <div className="glass-card">
            <h2>Staff Portal</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="primary-btn">Sign In</button>
              <button type="button" className="admin-link-btn" onClick={() => setView("booking")}>Cancel</button>
            </form>
          </div>
        )}

        {view === "dashboard" && (
          <div className="dashboard-card">
            <h2>Active Appointments</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Number</th>
                    <th>Pet</th>
                    <th>Size</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res, i) => (
                    <tr key={i}>
                      <td>{res.owner_name}</td>
                      <td>{res.contact_no}</td>
                      <td>{res.pets?.[0]?.pet_name}</td>
                      <td>{res.pets?.[0]?.size}</td>
                      <td>{res.pets?.[0]?.reservations?.[0]?.appointment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}

        {view === "booking" && (
          <div className="glass-card">
            <h1>PawCare Booking</h1>
            <form onSubmit={saveReservation}>
              <div className="input-group">
                <label>Owner Name</label>
                <input placeholder="Full Name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Number</label>
                <input placeholder="Phone Number" value={formData.contactNo} onChange={(e) => setFormData({...formData, contactNo: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input placeholder="Home Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Pet Name</label>
                <input placeholder="Pet's Name" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Pet Size</label>
                <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="input-group">
                <label>Date</label>
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
