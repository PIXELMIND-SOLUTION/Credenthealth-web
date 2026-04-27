import React from "react";
import { Helmet } from "react-helmet";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="py-5 px-4"
      style={{ backgroundColor: "#B2DBE7", color: "#1f2937" }}
    >
      {/* Helmet for SEO Meta Tags */}
      <Helmet>
        <title>Elthium Health - Healthcare Solutions & Medical Services</title>
        <meta
          name="description"
          content="Elthium Health by Elthium Health Pvt Ltd - One Platform, Total Wellness. Comprehensive healthcare solutions, medical services, and patient care."
        />
        <meta
          name="keywords"
          content="Elthium Health, healthcare solutions, medical services, patient care, health management, elthium health, bangalore hospitals, medical records"
        />
        <meta name="author" content="Elthium Health" />
        <link rel="canonical" href="https://credenthealth.com" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="Elthium Health - Healthcare Solutions & Medical Services" />
        <meta
          property="og:description"
          content="One Platform, Total Wellness - Comprehensive healthcare solutions and medical services by Elthium Health."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://credenthealth.com" />
        <meta property="og:image" content="https://credenthealth.com/logo.png" />
        <meta property="og:site_name" content="Elthium Health" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elthium Health - Healthcare Solutions" />
        <meta name="twitter:description" content="One Platform, Total Wellness - Your trusted healthcare partner." />
        <meta name="twitter:image" content="https://credenthealth.com/logo.png" />
      </Helmet>

      {/* Schema Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            name: "Elthium Health",
            alternateName: "Elthium Health by Elthium Healthcare Pvt Ltd",
            url: "https://credenthealth.com",
            logo: "https://credenthealth.com/logo.png",
            description:
              "Elthium Health - One Platform, Total Wellness. Comprehensive healthcare solutions and medical services.",
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "MSR NORTH TOWER, 16TH FLOOR, DR. PUNEETH RAJ KUMAR ROAD, MS RAMAIAH NORTH CITY, MANAYATA",
              addressLocality: "Bengaluru",
              addressRegion: "Karnataka",
              postalCode: "560045",
              addressCountry: "IN",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-7619196856",
              email: "credenthealth@gmail.com",
              contactType: "customer service",
              areaServed: "IN",
              availableLanguage: ["English", "Hindi"],
            },
            sameAs: [
              "https://www.facebook.com/credenthealth",
              "https://www.twitter.com/credenthealth",
              "https://www.instagram.com/credenthealth",
              "https://www.linkedin.com/company/credenthealth",
            ],
          }),
        }}
      />

      <div className="container">
        <div className="row gy-4">
          {/* About - Improved with better text */}
          <div className="col-12 col-lg-4">
            <h3 className="d-flex align-items-center mb-3" style={{ color: "#111827" }}>
              <img
                src="/logo.png"
                alt="Elthium Health Logo - Healthcare Solutions"
                className="img-fluid me-2"
                style={{ width: "50px", height: "50px" }}
              />
              Elthium Health
            </h3>
            <p className="mb-3" style={{ color: "#1f2937" }}>
              <strong>Elthium Healthcare Pvt Ltd.</strong> -
              Your trusted partner for comprehensive healthcare solutions.
              One Platform, Total Wellness - Offering medical services,
              health management, and patient care services.
            </p>
            {/* Social Links */}
            <div className="d-flex gap-3 mt-3">
              <a
                href="https://www.facebook.com/credenthealth"
                style={{ color: "#1f2937" }}
                aria-label="Follow Elthium Health on Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.twitter.com/credenthealth"
                style={{ color: "#1f2937" }}
                aria-label="Follow Elthium Health on Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://www.instagram.com/credenthealth"
                style={{ color: "#1f2937" }}
                aria-label="Follow Elthium Health on Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/credenthealth"
                style={{ color: "#1f2937" }}
                aria-label="Follow Elthium Health on LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links - Explore */}
          <div className="col-6 col-md-4 col-lg-2">
            <h5 className="mb-3 mt-3 font-bold" style={{ color: "#111827" }}>Explore</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/home" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Home">
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a href="/profile" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Profile">
                  Profile
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/medicalrecord"
                  className="text-decoration-none"
                  style={{ color: "#1f2937" }}
                  title="Elthium Health Medical Records"
                >
                  Medical Records
                </a>
              </li>
              <li className="mb-2">
                <a href="/family" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Family Members">
                  Family Members
                </a>
              </li>
            </ul>
          </div>

          {/* Wellness Services */}
          <div className="col-6 col-md-4 col-lg-3">
            <h5 className="mb-3 mt-3 font-bold" style={{ color: "#111827" }}>Wellness Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="/mybookings"
                  className="text-decoration-none"
                  style={{ color: "#1f2937" }}
                  title="Elthium Health Bookings"
                >
                  My Bookings
                </a>
              </li>
              <li className="mb-2">
                <a href="/mybookings" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Cart">
                  My Orders
                </a>
              </li>
              <li className="mb-2">
                <a href="/wallet" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Wallet">
                  Wallet
                </a>
              </li>
              <li className="mb-2">
                <a href="/chat" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Chat">
                  Chat
                </a>
              </li>
              <li className="mb-2">
                <a href="/help" className="text-decoration-none" style={{ color: "#1f2937" }} title="Elthium Health Help">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-4 col-lg-3">
            <h5 className="mb-3 mt-3 font-bold" style={{ color: "#111827" }}>Get in touch</h5>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-2" style={{ color: "#1f2937" }}>
                <FaMapMarkerAlt className="me-2 mt-1 flex-shrink-0" />
                <span>
                  ELTHIUM HEALTHCARE PVT LTD, MSR NORTH TOWER, 16TH FLOOR,
                  DR. PUNEETH RAJ KUMAR ROAD, MS RAMAIAH NORTH CITY,
                  MANAYATA, 560045 BENGALURU, KARNATAKA, INDIA
                </span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <FaPhone className="me-2 flex-shrink-0" />
                <a href="tel:+917619196856" className="text-decoration-none" style={{ color: "#1f2937" }}>
                  +91 7619196856
                </a>
              </li>
              <li className="d-flex align-items-center">
                <FaEnvelope className="me-2 flex-shrink-0" />
                <a href="mailto:credenthealth@gmail.com" className="text-decoration-none" style={{ color: "#1f2937" }}>
                  credenthealth@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="mt-5 mb-4 border-secondary" style={{ borderColor: "#9ca3af" }} />

        {/* Bottom Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="mb-2 mb-md-0 text-center text-md-start" style={{ color: "#1f2937" }}>
            &copy; 2025 <strong>Elthium Health</strong> - Preventive Healthcare Solutions & Medical Services.
          </p>

          {/* Privacy & Terms Links */}
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <a
              href="/privacyandpolicy"
              className="text-decoration-none"
              style={{ color: "#1f2937" }}
              title="Elthium Health Privacy Policy"
            >
              Privacy Policy
            </a>
            <a
              href="/termsandconditions"
              className="text-decoration-none"
              style={{ color: "#1f2937" }}
              title="Elthium Health Terms & Conditions"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;