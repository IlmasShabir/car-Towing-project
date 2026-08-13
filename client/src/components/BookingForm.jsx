import React, { useState } from 'react';
import { createBooking } from '../api/bookingApi';
import { buildWhatsAppLink } from '../utils/whatsapp';
import './BookingForm.css';

const BookingForm = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    service: '',
    vehicle: '',
  });
  const [status, setStatus] = useState('idle'); // idle | success

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappLink = buildWhatsAppLink({
      Name: form.name,
      Phone: form.phone,
      Location: form.location,
      Service: form.service,
      Vehicle: form.vehicle,
    });

    // Open WhatsApp immediately, synchronously inside the click handler -
    // this is what stops browsers from blocking it as a popup.
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    setStatus('success');

    // Save to the database in the background too. If this fails (backend
    // asleep/down/misconfigured), it does NOT block the customer - their
    // WhatsApp message has already been sent by the line above.
    createBooking({
      name: form.name,
      phone: form.phone,
      location: form.location,
      service: form.service,
      vehicleType: form.vehicle,
    }).catch((err) => {
      console.error('Booking save failed (WhatsApp message was still sent):', err.message);
    });
  };

  if (status === 'success') {
    return (
      <div className="booking-form-card booking-form-success">
        <h3>Sent to WhatsApp! ✅</h3>
        <p>Just hit send in WhatsApp to confirm your tow request.</p>
        <button
          className="booking-form-submit"
          onClick={() => {
            setForm({ name: '', phone: '', location: '', service: '', vehicle: '' });
            setStatus('idle');
          }}
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form-card" onSubmit={handleSubmit}>
      <h3 className="booking-form-title">Request a Tow</h3>
      <p className="booking-form-subtitle">We'll reach you in under 15 minutes</p>

      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Pickup Location"
        value={form.location}
        onChange={handleChange}
        required
      />
      <select name="service" value={form.service} onChange={handleChange} required>
        <option value="" disabled>Service Type</option>
        <option value="emergency towing">Emergency towing</option>
        <option value="jump-start">Jump Start</option>
        <option value="road-side Assistance">Roadside Assistance</option>
        <option value="commercial vehicle towing">Commercial vehicle Towing</option>
        <option value="long-distance towing">Long Distance Towing</option>
        <option value="motorcycle towing">Motorcycle Towing</option>
        <option value="flatbed towing">Flatbed Towing</option>
        <option value="heavy vehicle towing">Heavy Vehicle Towing</option>
      </select>
      <select name="vehicle" value={form.vehicle} onChange={handleChange} required>
        <option value="" disabled>Vehicle Type</option>
        <option value="sedan">Sedan</option>
        <option value="suv">SUV</option>
        <option value="truck">Truck</option>
        <option value="other">Other</option>
      </select>

      <button type="submit" className="booking-form-submit">
        Book Now
      </button>
    </form>
  );
};

export default BookingForm;
