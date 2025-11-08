import { FaSpotify } from 'react-icons/fa';
import { FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-5 border-t border-gray-700 mt-3 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Left Section - Logo and Insights */}
          <div className="mx-auto md:mx-0">
            <div className="flex flex-col items-center md:items-start">
              <img 
                src="/assets/ARCFooterLogo.png" 
                alt="Alumni Relations Cell" 
                className="w-50 h-25 mb-4" 
              />
              <span className="text-sm font-semibold uppercase tracking-wider">Alumni Relations Cell</span>
            </div>
            <div className="mt-4 flex justify-center md:justify-start">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-3 border border-gray-600 bg-gray-900 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 w-full md:w-64"
              />
              <button className="bg-gray-700 text-white p-3 rounded-r-md hover:bg-gray-600 transition duration-200 font-semibold">
                Subscribe
              </button>
            </div>
          </div>

          {/* Middle Section - Connect */}
          <div className="mx-auto flex flex-col items-center justify-center h-full">
            <h3 className="text-2xl font-bold mb-4">Connect | Create | Contribute.</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto md:max-w-none">
              This is your official hub for all things Thapar alumni. From career highlights and inspiring stories to job opportunities and alumni events, stay updated on the vibrant Thapar community. Let's build a stronger network together!
            </p>
          </div>

          {/* Right Section - Contact */}
          <div className="mx-auto md:mx-0 md:text-right">
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto md:max-w-none md:text-right">
              Office of Alumni Relations,<br />
              Thapar Institute of Engineering & Technology,<br />
              Patiala, Punjab 147004
            </p>
            <p className="text-sm text-gray-400 mt-4 max-w-xs mx-auto md:max-w-none md:text-right">
              Emails:<br />
              mansi.bhargava@thapar.edu<br />
              headalumni@thapar.edu<br />
              arclet@thapar.edu
            </p>
            <p className="text-sm text-gray-400 mt-4 max-w-xs mx-auto md:max-w-none md:text-right">
              Phone: +91 9918010057
            </p>
          </div>
        </div>

        {/* Social Media Logos at Bottom */}
        <div className="flex justify-center space-x-6 mt-8">
          <a href="https://www.instagram.com/arc_tiet/" aria-label="Instagram" className="hover:text-gray-400">
            <FaInstagram size={24} />
          </a>
          <a href="https://www.linkedin.com/company/thapar-alumni-relations/" aria-label="LinkedIn" className="hover:text-gray-400">
            <FaLinkedinIn size={24} />
          </a>
          <a href="https://www.youtube.com/@AlumniRelationsCellTIET" aria-label="YouTube" className="hover:text-gray-400">
            <FaYoutube size={24} />
          </a>
          <a href="https://open.spotify.com/show/0Bu6ILKEXigkmP0fw82wm8?si=rs936j77SN6wGVSRDwNXZw" aria-label="YouTube" className="hover:text-gray-400">
            <FaSpotify size={24} />
          </a>
        </div>

        {/* Bottom copyright
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
          ©2025 All Rights Reserved. Alumni Relations Cell @Thapar University | 
          
        </div> */}
      </div>
    </footer>
  );
}