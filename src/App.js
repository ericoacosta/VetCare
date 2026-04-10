import { useState } from "react";
// Import the connection you made in Step 1
import { supabase } from "./supabaseClient"; 
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    ownerName: "",
    petName: "",
    size: "small",
    address: "",
    contactNo: "",
    date: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const saveReservation = async (e) => {
    e.preventDefault();
    try {
      // 1. INSERT INTO OWNERS TABLE
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert([
          { 
            owner_name: formData.ownerName, 
            contact_no: formData.contactNo,
            address: formData.address 
          }
        ])
        .select(); // Gets the new Owner ID back

      if (ownerError) throw ownerError;
      const newOwnerId = ownerData[0].id;

      // 2. INSERT INTO PETS TABLE (Linked to Owner)
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .insert([
          { 
            owner_id: newOwnerId, 
            pet_name: formData.petName, 
            size: formData.size 
          }
        ])
        .select(); // Gets the new Pet ID back

      if (petError) throw petError;
      const newPetId = petData[0].id;

      // 3. INSERT INTO RESERVATIONS TABLE (Linked to Pet)
      const { error: resError } = await supabase
        .from('reservations')
        .insert([
          { 
            pet_id: newPetId, 
            appointment_date: formData.date 
          }
        ]);

      if (resError) throw resError;
      
      alert("Reservation Confirmed! Data saved across 3 SQL tables.");

      // Reset form fields
      setFormData({
        ownerName: "",
        petName: "",
        size: "small",
        address: "",
        contactNo: "",
        date: ""
      });

    } catch (error) {
      console.error("Database Error:", error.message);
      alert("Failed to save: " + error.message);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <div className="glass-card">
          <h1>PawCare Booking</h1>
          <form onSubmit={saveReservation}>
            <div className="form-section">
              <label>Owner Details</label>
              <input 
                name="ownerName" 
                placeholder="Full Name" 
                value={formData.ownerName} 
                onChange={handleChange} 
                required 
              />
              <input 
                name="contactNo" 
                placeholder="Phone Number" 
                value={formData.contactNo} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-section">
              <label>Pet Details</label>
              <input 
                name="petName" 
                placeholder="Pet Name" 
                value={formData.petName} 
                onChange={handleChange} 
                required 
              />
              <select name="size" value={formData.size} onChange={handleChange}>
                <option value="small">Small Pet</option>
                <option value="medium">Medium Pet</option>
                <option value="large">Large Pet</option>
              </select>
            </div>

            <div className="form-section">
              <label>Appointment</label>
              <input 
                name="address" 
                placeholder="Home Address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="submit-btn">Confirm Reservation</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
