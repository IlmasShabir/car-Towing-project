import './Hero.css';
import BookingForm from './BookingForm';


const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-left">
        <p className="hero-eyebrow anim-item delay-1">
          Towing • Vehicle Recovery • Roadside Assistance
        </p>

        <h1 className="hero-heading anim-item delay-2">
          CAR <span className="highlight">TOWING</span> SERVICE
          <br />
          ACROSS DUBAI
        </h1>

        <p className="hero-subtext anim-item delay-2">
          Need towing or roadside assistance in Dubai? Call or message our team.
        </p>

      
       

        <div className="hero-cta-group anim-item delay-3">
          <a href="tel:+971586729393" className="btn-call">📞 Call Now</a>
          <a href="https://wa.me/+971586729393" className="btn-whatsapp">💬 WhatsApp Us</a>
        </div>

        <div className="hero-stats anim-item delay-4">
          <div className="stat-item">
            <span className="stat-number">Dubai</span>
            <span className="stat-label">Service Coverage</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-booking-wrapper">
          <BookingForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;

