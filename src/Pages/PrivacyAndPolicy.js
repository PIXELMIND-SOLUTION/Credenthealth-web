import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

const PrivacyAndPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="container py-5 px-3 md:px-5 lg:px-10">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">

              <h1 className="mb-5 text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                Privacy Policy - Elthium Health
              </h1>

              {/* Section */}
              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  1. Information We Collect
                </h4>
                <p className="font-medium mb-2">Personal Data You Provide:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Full Name, Phone Number, Email Address</li>
                  <li>Age, Gender, and Date of Birth</li>
                  <li>Uploaded medical documents, prescriptions, or reports</li>
                  <li>Messages and feedback</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  2. How We Use Your Information
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Provide personalized healthcare insights and recommendations</li>
                  <li>Connect users with doctors or medical professionals</li>
                  <li>Store medical records securely for easy access</li>
                  <li>Improve app functionality and user experience</li>
                  <li>
                    Our app may request access to your photos and media for uploading medical documents. This access is only used to enable this functionality.
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  3. How We Protect Your Data
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>End-to-end encryption for health data</li>
                  <li>Secure cloud infrastructure</li>
                  <li>Access control for authorized personnel only</li>
                  <li>Regular security audits and vulnerability scans</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  4. Sharing Your Data
                </h4>
                <p className="text-gray-600 mb-2">
                  We do <strong>not sell</strong> your data. We may share data only with:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Licensed medical professionals (with your consent)</li>
                  <li>Cloud and analytics service providers (for internal improvements)</li>
                  <li>Regulatory or legal authorities (when legally required)</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  5. Your Rights and Choices
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Access and review your health and account data</li>
                  <li>Update profile or medical info anytime</li>
                </ul>
                <p className="mt-2 text-gray-600">
                  To exercise these rights, email us at:{" "}
                  <a
                    href="mailto:contact.credenthealth@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    contact.credenthealth@gmail.com
                  </a>
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  6. Data Retention
                </h4>
                <p className="text-gray-600">
                  We retain health and personal data only as long as needed for healthcare delivery,
                  legal compliance, or app functionality. You may request deletion at any time.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  7. Children's Privacy
                </h4>
                <p className="text-gray-600">
                  Elthium Health is intended for users 16 years and older. We do not knowingly collect data from children under 16 without verified parental consent.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  8. Changes to This Privacy Policy
                </h4>
                <p className="text-gray-600">
                  This Privacy Policy may be updated from time to time. Continued use implies acceptance of the revised policy.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">
                  9. Contact Us
                </h4>
                <p className="text-gray-600">
                  For any questions or concerns, reach out to us at:{" "}
                  <a
                    href="mailto:contact.credenthealth@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    contact.credenthealth@gmail.com
                  </a>
                </p>
              </div>

            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default PrivacyAndPolicy;
