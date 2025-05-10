import React from 'react';
import { FaShieldAlt, FaUserShield, FaLock, FaInfoCircle } from 'react-icons/fa';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                Welcome to our Content Management System (CMS). By accessing and using this platform, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. User Responsibilities</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUserShield className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.
                  </p>
                </div>
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Users must not engage in any activity that disrupts or interferes with the proper functioning of the platform.
                  </p>
                </div>
              </div>
            </section>

            {/* Content Guidelines */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Content Guidelines</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Users must ensure that all content posted complies with applicable laws and regulations.
                  </p>
                </div>
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Content must not infringe upon intellectual property rights or contain harmful, offensive, or inappropriate material.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Privacy and Data Protection</h2>
              <div className="flex items-start">
                <FaLock className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-600">
                  We are committed to protecting your privacy and handling your data in accordance with applicable data protection laws. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your personal information.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Modifications to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. Users will be notified of any significant changes. Continued use of the platform after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Information</h2>
              <p className="text-gray-600">
                For any questions or concerns regarding these Terms of Service, please contact us at support@cms.com
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

export default TermsOfService; 