import React from 'react';
import { FaShieldAlt, FaUserShield, FaLock, FaInfoCircle, FaDatabase, FaUserCog, FaCookie } from 'react-icons/fa';

const PolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                At our Content Management System (CMS), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUserShield className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
                    <p className="text-gray-600">
                      We collect information that you provide directly to us, including your name, email address, and any other information you choose to provide when creating an account or using our services.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaDatabase className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Usage Information</h3>
                    <p className="text-gray-600">
                      We automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, and pages visited.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUserCog className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience.
                  </p>
                </div>
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    We also use your information to protect against unauthorized access and to comply with legal obligations.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Cookies and Tracking</h2>
              <div className="flex items-start">
                <FaCookie className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-600">
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
              <div className="flex items-start">
                <FaLock className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-600">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    You have the right to access, correct, or delete your personal information. You can also object to the processing of your data and request data portability.
                  </p>
                </div>
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@cms.com
              </p>
            </section>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;