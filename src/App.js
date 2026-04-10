import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Dashboard from "./Dashboard"; 
import './App.css';

function App() {
  const [view, setView] = useState("booking"); 
  const [, setSession] = useState(null); 
  const [formData, setFormData] = useState({
    ownerName: "", contactNo: "", petName: "", size: "small", address: "", date: ""
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Failed");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("booking");
  };

  const saveReservation = async (e) => {
    e.preventDefault();
    try {
      const { data: oData, error: oErr } = await supabase.from('owners').insert([{ 
        owner_name: formData.ownerName, 
        contact_no: formData.contactNo, 
        address: formData.address 
      }]).select();
      if (oErr) throw oErr;
      const { data: pData, error: pErr } = await supabase.from('pets').insert([{ 
        owner_id: oData[0].id, 
        pet_name: formData.petName, 
        size: formData.size 
      }]).select();
      if (pErr) throw pErr;
      await supabase.from('reservations').insert([{ 
        pet_id: pData[0].id, 
        appointment_date: formData.date, 
        status: 'Pending' 
      }]);
      alert("Booking Confirmed!");
      setFormData({ ownerName: "", contactNo: "", petName: "", size: "small", address: "", date: "" });
    } catch (err) { alert(err.message); }
  };

  // We define the background style here so it bypasses the CSS module check
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/image/vetbackground.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div className="App">
      {view === "booking" && (
        <button className="corner-login-btn" onClick={() => setView("login")}>
          Staff Portal
        </button>
      )}
      
      <div style={backgroundStyle}>
        {view === "login" && (
          <div className="glass-card">
            <h2>Staff Login</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="primary-btn">Sign In</button>
              <button type="button" className="admin-link-btn" onClick={() => setView("booking")}>Cancel</button>
            </form>
          </div>
        )}

        {view === "dashboard" && <Dashboard handleLogout={handleLogout} />}

        {view === "booking" && (
          <div className="glass-card">
            <h1>PawCare Booking</h1>
            <form onSubmit={saveReservation}>
              <input placeholder="Owner Name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required />
              <input placeholder="Phone Number" value={formData.contactNo} onChange={(e) => setFormData({...formData, contactNo: e.target.value})} required />
              <input placeholder="Home Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              <input placeholder="Pet Name" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} required />
              <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})}>
                <option value="small">Small Breed</option>
                <option value="medium">Medium Breed</option>
                <option value="large">Large Breed</option>
              </select>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              <button type="submit" className="primary-btn">Confirm Booking</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
