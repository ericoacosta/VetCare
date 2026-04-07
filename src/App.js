import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

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
      await addDoc(collection(db, "reservations"), {
        ...formData,
        createdAt: new Date()
      });
      
      alert("Reservation Successful!");

      // ✅ Reset the state to clear the inputs
      setFormData({
        ownerName: "",
        petName: "",
        size: "small",
        address: "",
        contactNo: "",
        date: ""
      });

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save reservation. Check your Firebase permissions.");
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>PawCare Booking</h1>
        <form onSubmit={saveReservation}>
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

          <button type="submit">Confirm Reservation</button>
        </form>
      </div>
    </div>
  );
}

export default App;