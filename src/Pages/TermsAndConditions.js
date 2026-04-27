import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const TermsandConditions = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="container py-5 px-3 md:px-5 lg:px-10">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">

              <h1 className="mb-5 text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                Terms and Conditions - Elthium Health
              </h1>

              <p className="mb-6 text-gray-600">
                These Terms and Conditions ("Terms") govern your use of the{" "}
                <strong>Elthium Health</strong> application ("App"). By accessing or using the App, you agree to comply with
                and be bound by these Terms.
              </p>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">1. Acceptance of Terms</h4>
                <p className="text-gray-600">
                  By registering or using any part of the App, you accept these Terms in full. If you disagree
                  with any part of the Terms, you must not use the App.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">2. Eligibility</h4>
                <p className="text-gray-600">
                  You must be at least 16 years old to use the App. By using the App, you confirm that you meet this
                  requirement or have the proper consent if underage.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">3. User Responsibilities</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Provide accurate health and personal information.</li>
                  <li>Keep your login credentials confidential.</li>
                  <li>Do not upload false, harmful, or unauthorized medical information.</li>
                  <li>Use the App in compliance with all applicable health and privacy laws.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">4. Medical Disclaimer</h4>
                <p className="text-gray-600">
                  The App offers informational support and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified medical professionals for health concerns.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">5. Content Ownership</h4>
                <p className="text-gray-600">
                  You retain rights over the health records, prescriptions, and data you upload. By using the App, you grant Elthium Health limited rights to use this data to provide services.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">6. Usage Restrictions</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Do not misuse the App or its services.</li>
                  <li>Do not attempt to alter, distribute, or reverse engineer the App.</li>
                  <li>Use the App only for personal or authorized healthcare purposes.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">7. Termination</h4>
                <p className="text-gray-600">
                  We reserve the right to suspend or terminate your access for any misuse, policy violations, or breach of Terms, without prior notice.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">8. Limitation of Liability</h4>
                <p className="text-gray-600">
                  Elthium Health shall not be liable for any indirect, incidental, or consequential damages arising from use of the App. The App is provided "as is" without warranties of any kind.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">9. Changes to Terms</h4>
                <p className="text-gray-600">
                  These Terms may be revised from time to time. Continued use after updates signifies your acceptance of the latest Terms.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg sm:text-xl font-semibold text-gray-700">10. Contact Us</h4>
                <p className="text-gray-600">
                  For any questions or concerns regarding these Terms, reach out to us at:{" "}
                  <a href="mailto:contact.credenthealth@gmail.com" className="text-blue-600 hover:underline">
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

export default TermsandConditions;
