"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/supabaseclient";
import { wrap } from "popmotion";
import Image from "next/image"; // Import Next.js Image component

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const SlideShow = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [[page, direction], setPage] = useState([0, 0]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const folder = searchParams.get("folder");

  useEffect(() => {
    const fetchImages = async () => {
      if (!category || !folder) {
        setError("Category or folder not specified");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: files, error: listError } = await supabase.storage
        .from("gallery")
        .list(`${category}/${folder}`, { limit: 100 });

      if (listError) {
        console.error("Error fetching images:", listError);
        setError("Could not fetch images.");
        setLoading(false);
        return;
      }

      if (files && files.length > 0) {
        const imageUrls = files.map((file) => {
          const { data: publicURLData } = supabase.storage
            .from("gallery")
            .getPublicUrl(`${category}/${folder}/${file.name}`);
          return publicURLData.publicUrl;
        });

        setImages(imageUrls);
      } else {
        setError("No images found.");
      }

      setLoading(false);
    };

    fetchImages();
  }, [category, folder]);

  const imageIndex = wrap(0, images.length, page);

  const paginate = (newDirection: number) => {
    setPage((prev) => [prev[0] + newDirection, newDirection]);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        paginate(1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        paginate(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) return <p>Loading images...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      style={{
        width: "100vw",
        height: "70vh",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {images.length > 0 && (
        <>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 90, damping: 40 },
                opacity: { duration: 2 },
              }}
              style={{
                position: "absolute",
                width: "50vw",
                height: "calc(70vh - 51px)",
              }}
            >
              <Image
                src={images[imageIndex]}
                alt={`Image ${imageIndex}`}
                fill
                style={{
                  objectFit: "contain",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                }}
                sizes="100vw"
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>

          <div
            style={{
              top: "calc(50% - 20px)",
              position: "absolute",
              background: "white",
              borderRadius: "30px",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              userSelect: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "18px",
              zIndex: 2,
              left: "10px",
              transform: "scale(-1)",
            }}
            onClick={() => paginate(-1)}
          >
            {"‣"}
          </div>

          <div
            style={{
              top: "calc(50% - 20px)",
              position: "absolute",
              background: "white",
              borderRadius: "30px",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              userSelect: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "18px",
              zIndex: 2,
              right: "10px",
            }}
            onClick={() => paginate(1)}
          >
            {"‣"}
          </div>

          <div
            style={{
              position: "fixed",
              bottom: 0,
              height: "20vh",
              width: "100%",
              display: "flex",
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "10px 0",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                style={{
                  width: "100px",
                  height: "100%",
                  minWidth: "100px",
                  margin: "0 5px",
                  opacity: index === imageIndex ? 1 : 0.3,
                  transition: "opacity 0.3s",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "10px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
                }}
                onClick={() => setPage([index, 0])}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index}`}
                  width={100}
                  height={100}
                  style={{
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                  sizes="100px"
                  loading="lazy"
                  quality={60}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SlideShow;
