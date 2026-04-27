import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CategoriesPage from "./CategoriesPage";
import RecentActivityPage from "./RecentActivityPage";
import DoctorBlogsPage from "./DoctorBlogs";
import BannerCarousel from "./BannerCarousel";
import WelcomePage from "./WelcomePage";
import { Helmet } from "react-helmet"; // 👈 Add this package for SEO

const HomePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        {/* SEO Head for loading state */}
        <Helmet>
          <title>Elthium Health - Healthcare Solutions & Medical Services</title>
          <meta name="description" content="Elthium Health - One Platform, Total Wellness. Your trusted healthcare partner for comprehensive medical services and health solutions." />
          <meta name="keywords" content="Elthium Health, healthcare, medical services, health solutions, wellness platform" />
          <link rel="canonical" href="https://credenthealth.com" />
        </Helmet>
        
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Elthium Health Logo"
            className="w-24 h-24 animate-bounce mb-4"
          />

          {/* App/Website Name */}
          <h1 className="text-3xl font-bold text-gray-800">Elthium Health</h1>

          {/* Tagline */}
          <p className="mt-2 text-gray-500 animate-pulse">
            One Platform, Total Wellness
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Head for main content */}
      <Helmet>
        <title>Elthium Health | Healthcare Solutions & Medical Services</title>
        <meta name="description" content="Elthium Health offers comprehensive healthcare solutions, medical services, and innovative health management systems. One platform for total wellness and patient care." />
        <meta name="keywords" content="Elthium Health, healthcare solutions, medical services, health platform, wellness, patient care, medical technology" />
        <meta property="og:title" content="Elthium Health - Trusted Healthcare Solutions" />
        <meta property="og:description" content="One Platform, Total Wellness - Your complete healthcare solution provider" />
        <meta property="og:url" content="https://credenthealth.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://credenthealth.com/logo.png" />
        <link rel="canonical" href="https://credenthealth.com" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "MedicalOrganization",
              "name": "Elthium Health",
              "url": "https://credenthealth.com",
              "logo": "https://credenthealth.com/logo.png",
              "description": "One Platform, Total Wellness - Comprehensive healthcare solutions and medical services",
              "slogan": "One Platform, Total Wellness"
            }
          `}
        </script>
      </Helmet>

      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md mb-20">
          <Navbar />
        </div>

        <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
          <div className="pt-[90px] bg-gray-50 flex-1">
            {/* Welcome Section with proper heading structure */}
            <section aria-label="Welcome to Elthium Health">
              <WelcomePage />
            </section>
            
            {/* Banner Carousel */}
            <section aria-label="Featured Services">
              <BannerCarousel />
            </section>

            {/* Other Sections with semantic HTML */}
            <section aria-label="Healthcare Categories">
              <CategoriesPage />
            </section>
            
            <section aria-label="Recent Health Activities">
              <RecentActivityPage />
            </section>
          </div>

          {/* Footer with flexbox to always stay at the bottom */}
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;