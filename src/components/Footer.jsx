        import { FaHeart } from "react-icons/fa";
        import { FaInstagram } from "react-icons/fa6";
        import logo from "../assets/imeet-logo.png";
        
        const Footer = () => {
          return (
            <>
             {/* Mobile View with Logo as Background */}
<div
  className="sm:hidden bg-black text-white p-4 bg-no-repeat bg-center bg-contain"
  style={{ backgroundImage: `url(${logo})` }}
>
  <div className="bg-black/80 p-4 rounded-md">
    <div className="grid grid-cols-1 gap-6 items-center">

      {/* Follow us - inline and centered */}
      <div className="flex justify-center items-center gap-2">
        <p className="text-sm text-gray-400">Follow us on</p>
        <a
          href="https://www.instagram.com/imeet_2025?igsh=cnhpbTB1bGtzODY1"
          className="hover:opacity-80"
          aria-label="Instagram"
        >
          <FaInstagram size={24} className="text-pink-500" />
        </a>
      </div>

      {/* Made with love and copyright */}
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-400 flex items-center justify-center">
         In Collaboration with IEI student chapter of RCCIIT
        </p>
        <p className="text-sm text-gray-400 mt-1">@ 2025 ImeeT. All rights reserved.</p>
      </div>

    </div>
  </div>
</div>


        
              {/* Desktop/Tablet View (unchanged) */}
              <div className="hidden sm:flex justify-between items-center p-3 bg-black text-white pt-3 gap-4 text-center">
                <div className="flex items-center pl-20">
                  <img src={logo} alt="Logo" className="h-20 w-20 " />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 flex items-center justify-center">
                    In Collaboration with IEI student chapter of RCCIIT
                  </p>
                  <p className="text-sm">© 2025 ImeeT. All rights reserved.</p>
                </div>
                <div className="flex flex-row gap-2 items-end pr-20">
                  <p className="text-sm text-gray-400 mb-2">Follow us on</p>
                  <div className="flex space-x-3">
                    <a 
                      href="https://www.instagram.com/imeet_2025?igsh=cnhpbTB1bGtzODY1" 
                      className="hover:opacity-80"
                      aria-label="Instagram"
                    >
                      <FaInstagram size={35} className="text-pink-500 text-xl" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          );
        };
        
        export default Footer;        