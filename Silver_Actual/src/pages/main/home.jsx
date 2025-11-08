import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./home.css";

// shared axios client (baseURL comes from VITE_API_BASE_URL)
import { api } from "../../lib/api";

function Home() {
  const [posterImages, setPosterImages] = useState([]);
  const [jubileeImages, setJubileeImages] = useState([]);
  const token = localStorage.getItem("adminToken");

  // Fetch images
  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    // Posters
    api
      .get("/api/admin/images", {
        headers,
        params: { category: "home_announcement" },
      })
      .then((res) => {
        const urls = Array.isArray(res.data)
          ? res.data.map((img) => img && img.url).filter(Boolean)
          : [];
        setPosterImages(Array.from(new Set(urls)));
      })
      .catch((err) => console.error("Error fetching poster images:", err));

    // Memories
    api
      .get("/api/admin/images", {
        headers,
        params: { category: "home_memories" },
      })
      .then((res) => {
        const urls = Array.isArray(res.data)
          ? res.data.map((img) => img && img.url).filter(Boolean)
          : [];
        setJubileeImages(Array.from(new Set(urls)));
      })
      .catch((err) => console.error("Error fetching memories images:", err));
  }, [token]);

  // Falling-stars background
  useEffect(() => {
    const background = document.getElementById("background-container");
    if (!background) return;

    background.innerHTML = "";
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${Math.random() * 3 + 3}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      background.appendChild(star);
    }

    return () => {
      if (background) background.innerHTML = "";
    };
  }, []);

  // Custom Arrows
  const NextArrow = ({ onClick }) => (
    <div
      className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer bg-[#f4f4f400] hover:bg-[#00000030] p-3 rounded-full shadow-md transition-transform duration-200 hover:scale-110"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 cursor-pointer bg-[#f4f4f400] hover:bg-[#00000030] p-3 rounded-full shadow-md transition-transform duration-200 hover:scale-110"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5 sm:w-6 sm:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </div>
  );

  // Slider settings
  const posterSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 640,
        settings: {
          centerMode: false,
          arrows: true,
          dots: true,
        },
      },
    ],
  };

  const jubileeSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const marqueeLinks = [
    { href: "/register", text: "Register Now" },
    { href: "/eventflow", text: "View Event Schedule" },
    { href: "/memories", text: "View Gallery" },
    { href: "/meetourteam", text: "Meet ARC Team" },
  ];

  return (
    <>
      <div id="background-container"></div>

      <div className="page-content">
        {/* Hero Section */}
        <section className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] flex flex-col justify-center items-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 leading-tight">
            Silver Jubilee Celebration
          </h1>
          <p className="text-base sm:text-lg md:text-2xl font-medium text-[#C5CBD3]">
            25 Years of Legacy | Reunite | Relive | Rejoice
          </p>
        </section>

        {/* Poster Slideshow */}
        <section className="relative w-[95%] sm:w-[90%] mx-auto my-8 sm:my-12">
          <h2 className="text-l sm:text-xl md:text-2xl xl:text-3xl font-bold text-center mb-6 sm:mb-8 text-[#EE634F]">
            Announcements & Posters
          </h2>

          <Slider {...posterSettings}>
            {posterImages.map((src, idx) => (
              <div key={idx} className="px-2 sm:px-4">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border border-[#352e2e] bg-black">
                  <img
                    src={src}
                    alt={`Poster ${idx + 1}`}
                    className="
                      w-full 
                      h-[200px]
                      sm:h-[320px] 
                      md:h-[450px] 
                      lg:h-[550px] 
                      xl:h-[650px]
                      object-cover 
                      rounded-xl 
                      transition-transform 
                      duration-300 
                      hover:scale-[1.01]
                    "
                  />
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* Marquee */}
        <section className="bg-[rgba(31,31,31,0.95)] py-3 my-8 overflow-hidden border-t-2 border-b-2 border-[#4A5568] shadow-md">
          <div className="relative w-full overflow-hidden group">
            <div className="flex animate-marquee whitespace-nowrap text-sm sm:text-lg md:text-xl font-semibold text-[#E2E8F0]">
              {marqueeLinks.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  className="mx-6 sm:mx-8 hover:text-[#60A5FA] hover:underline transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Jubilee Memories Carousel */}
        <section className="w-[95%] sm:w-[90%] mx-auto my-14">
          <h2 className="text-l sm:text-xl md:text-2xl xl:text-3xl font-bold text-center mb-8 text-[#EE634F]">
            Memories Through the Years
          </h2>
          <Slider {...jubileeSettings}>
            {jubileeImages.map((src, idx) => (
              <div key={idx} className="px-2 sm:px-3">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 border-[#C5D7DC] p-0.5 bg-white">
                  <img
                    src={src}
                    alt={`Memory ${idx + 1}`}
                    className="w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px] object-cover rounded-xl"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </section>
      </div>

      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
          display: flex;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}

export default Home;
