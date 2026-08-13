import React, { useState } from 'react';
import { createBooking } from '../api/bookingApi';
import { buildWhatsAppLink } from '../utils/whatsapp';
import './ContactForm.css';

const ContactForm = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | success

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappLink = buildWhatsAppLink({
      Name: form.name,
      Phone: form.phone,
      Email: form.email,
      Service: form.service,
      Message: form.message,
    });

    // Open WhatsApp immediately, synchronously inside the click handler -
    // this is what stops browsers from blocking it as a popup.
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    setStatus('success');

    // Save to the database in the background too. If this fails (backend
    // asleep/down/misconfigured), it does NOT block the customer - their
    // WhatsApp message has already been sent by the line above.
    createBooking(form).catch((err) => {
      console.error('Contact save failed (WhatsApp message was still sent):', err.message);
    });
  };

  if (status === 'success') {
    return (
      <div className="contact-form contact-form-success">
        <h3>Sent to WhatsApp! ✅</h3>
        <p>Just hit send in WhatsApp to confirm your message.</p>
        <button
          className="contact-form-submit"
          onClick={() => {
            setForm({ name: '', phone: '', email: '', service: '', message: '' });
            setStatus('idle');
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>Send Us a Message</h3>
      <div className="contact-form-row">
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
      </div>
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={form.email}
        onChange={handleChange}
        required
      />
      <select name="service" value={form.service} onChange={handleChange} required>
        <option value="" disabled>Select Service</option>
        <option value="emergency-towing">Emergency Towing</option>
        <option value="roadside-assistance">Roadside Assistance</option>
        <option value="battery-jump-start">Battery Jump Start</option>
        <option value="flat-tire-change">Flat Tire Change</option>
        <option value="other">Other</option>
      </select>
      <textarea
        name="message"
        placeholder="Your Message"
        rows="4"
        value={form.message}
        onChange={handleChange}
        required
      />

      <button type="submit" className="contact-form-submit">
        Send Message
      </button>
    </form>
  );
};

export default ContactForm;


