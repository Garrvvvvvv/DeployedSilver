import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Masonry from "react-masonry-css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../lib/api"; // baseURL from VITE_API_BASE_URL

const PAGE_SIZE = 24;

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const token = localStorage.getItem("adminToken");

  // -------- Helpers --------
  const shuffleArray = (arr) => {
    const array = Array.isArray(arr) ? [...arr] : [];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Convert a Cloudinary delivery URL to a transformed one
  const cldTransform = (url, transforms) => {
    if (!url || !url.includes("/upload/")) return url;
    const t = transforms.filter(Boolean).join(",");
    return url.replace("/upload/", `/upload/${t}/`);
  };

  // Placeholder (LQIP) URL
  const placeholderUrl = (url) =>
    cldTransform(url, ["f_auto", "q_1", "e_blur:2000", "w_20", "dpr_auto"]);

  // Build responsive src and srcSet
  const buildImageSources = (url) => {
    const widths = [320, 480, 640, 960, 1280, 1600];
    const transformsBase = ["f_auto", "q_auto", "dpr_auto"];

    const src = cldTransform(url, [...transformsBase, "w_960"]); // default
    const srcSet = widths
      .map((w) => `${cldTransform(url, [...transformsBase, `w_${w}`])} ${w}w`)
      .join(", ");

    // Tell the browser how much viewport width the image likely occupies
    // Adjust per your masonry column rules
    const sizes =
      "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw";

    return { src, srcSet, sizes };
  };

  // -------- Data --------
  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    api
      .get("/api/admin/images", {
        headers,
        params: { category: "memories_page" },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPhotos(shuffleArray(data));
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err) => console.error("Error fetching gallery images:", err));
  }, [token]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          // Small timeout to batch and avoid jank
          setTimeout(() => {
            setVisibleCount((c) => Math.min(c + PAGE_SIZE, photos.length));
            setLoadingMore(false);
          }, 100);
        }
      },
      { rootMargin: "800px 0px" } // start loading early
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [photos.length, loadingMore]);

  const openLightbox = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setIsNavigating(false);
  };

  const goToPrevious = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? photos.length - 1 : prevIndex - 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150);
  }, [isNavigating, photos]);

  const goToNext = useCallback(() => {
    if (isNavigating || photos.length === 0) return;
    setIsNavigating(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === photos.length - 1 ? 0 : prevIndex + 1;
      setSelectedPhoto(photos[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsNavigating(false), 150);
  }, [isNavigating, photos]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, goToPrevious, goToNext]);

  // Swipe support (mobile)
  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      if (!startX || !selectedPhoto) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) diff > 0 ? goToNext() : goToPrevious();
      startX = 0;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedPhoto, goToNext, goToPrevious]);

  const breakpointColumnsObj = {
    default: 5,
    1280: 4,
    1024: 3,
    640: 2,
    0: 1,
  };

  const visiblePhotos = useMemo(
    () => photos.slice(0, visibleCount),
    [photos, visibleCount]
  );

  return (
    <div className="p-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {visiblePhotos.map((photo, index) => {
          const { src, srcSet, sizes } = buildImageSources(photo.url);
          const tiny = placeholderUrl(photo.url);
          return (
            <div
              key={photo._id || `${photo.url}-${index}`}
              className="mb-4 overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => openLightbox(photo, index)}
            >
              {/* Progressive image: blurred tiny placeholder beneath the real image */}
              <div className="relative">
                <img
                  src={tiny}
                  alt=""
                  aria-hidden
                  className="w-full h-auto object-cover rounded-lg blur-lg scale-105"
                />
                <img
                  src={src}
                  srcSet={srcSet}
                  sizes={sizes}
                  alt={`gallery-${index}`}
                  className="w-full h-auto object-cover rounded-lg absolute inset-0 transition-opacity duration-300 opacity-0"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => (e.currentTarget.style.opacity = 1)}
                  // Give first few images high priority
                  fetchPriority={index < 8 ? "high" : "auto"}
                />
              </div>
            </div>
          );
        })}
      </Masonry>

      {/* Infinite scroll sentinel */}
      {visibleCount < photos.length && (
        <div
          ref={loadMoreRef}
          className="py-8 text-center text-sm text-gray-500"
        >
          {loadingMore ? "Loading more..." : "Scroll to load more"}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-black/70 hover:bg-black/90 p-3 rounded-full z-20"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-black/70 hover:bg-black/90 p-2 sm:p-3 rounded-full z-20"
          >
            <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10" />
          </button>

          <div className="max-w-7xl w-full h-full flex items-center justify-center pointer-events-none">
            <img
              src={cldTransform(selectedPhoto.url, ["f_auto","q_auto","dpr_auto","w_1600"])}
              srcSet={[
                "640w","960w","1280w","1600w"
              ].map(w => `${cldTransform(selectedPhoto.url, ["f_auto","q_auto","dpr_auto",`w_${w.replace('w','')}`])} ${w}`).join(", ")}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
              alt="gallery"
              className="max-w-full max-h-[90vh] object-contain pointer-events-none rounded-lg"
              decoding="async"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
