"use client";
import { Card, CardHeader } from "@nextui-org/react";
import { supabase } from "@/supabaseclient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FolderImage {
  folder: string;
  firstImage: string | null;
}

export default function App() {
  const router = useRouter();
  const [folderImages, setFolderImages] = useState<FolderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState("");
  const categories = [
    "Dogs",
    "Cats",
    "Palm",
    "Paws",
    "Other Animals",
    "Others",
  ];

  const fetchImages = async (category: string) => {
    setLoading(true);
    setError(null);

    const { data: folders, error: listError } = await supabase.storage
      .from("gallery")
      .list(category, { limit: 100 });

    if (listError) {
      console.error("Error fetching folders:", listError);
      setError("Could not fetch folders.");
      setLoading(false);
      return;
    }

    if (folders) {
      const folderMap: FolderImage[] = [];

      // If there are no subfolders, fetch images directly from the category folder
      if (folders.length === 0) {
        const { data: images, error: imageError } = await supabase.storage
          .from("gallery")
          .list(category, { limit: 100 }); // Fetch images directly from the category

        if (imageError) {
          console.error(`Error fetching images from ${category}:`, imageError);
          setError("Could not fetch images.");
          setLoading(false);
          return;
        }

        // Push all images as individual folder images
        for (const image of images) {
          const { data: publicURLData } = supabase.storage
            .from("gallery")
            .getPublicUrl(`${category}/${image.name}`);
          const publicURL = publicURLData.publicUrl;

          folderMap.push({ folder: category, firstImage: publicURL });
        }
      } else {
        // Otherwise, fetch images from each subfolder
        for (const folder of folders) {
          const folderName = folder.name;

          const { data: images, error: imageError } = await supabase.storage
            .from("gallery")
            .list(`${category}/${folderName}`, { limit: 1 });
          if (imageError) {
            console.error(
              `Error fetching images from ${folderName}:`,
              imageError
            );
            continue;
          }

          if (images && images.length > 0) {
            const { data: publicURLData } = supabase.storage
              .from("gallery")
              .getPublicUrl(`${category}/${folderName}/${images[0].name}`);
            const publicURL = publicURLData.publicUrl;

            folderMap.push({ folder: folderName, firstImage: publicURL });
          } else {
            folderMap.push({ folder: folderName, firstImage: null });
          }
        }
      }

      setFolderImages(folderMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages(categories[0]);
  }, []);

  const handleCategoryClick = async (category: string) => {
    setLoading(true);
    setError(null);
    setCurrentCategory(category);
    await fetchImages(category); // Fetch images for the selected category
  };

  const handleCardClick = (category: string, folderName: string) => {
    router.push(`/slideshow?category=${category}&folder=${folderName}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-white bg-opacity-50 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-gray-800">GalleRoon</h1>
        <nav>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="ml-4 text-gray-800 hover:text-blue-600"
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      {/* Background Video Placeholder */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ zIndex: -1 }}
      >
        {/* Background Video can be added here */}
        <video className="w-full h-full object-cover" autoPlay loop muted>
          <source src="/path/to/your/background/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main Content */}
      <div className="max-w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 px-9 pt-20 relative z-10">
        {loading ? (
          <p>Loading images...</p>
        ) : error ? (
          <p>{error}</p>
        ) : folderImages.length > 0 ? (
          folderImages.map((folderImage, index) => (
            <Card
              key={index}
              isHoverable
              isPressable
              className="h-[350px] shadow-xl shadow-black"
              onClick={() =>
                handleCardClick(currentCategory, folderImage.folder)
              }
            >
              <CardHeader className="absolute z-10 top-1 flex-col !items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">
                  {folderImage.folder}
                </p>
              </CardHeader>
              <Image
                alt={`Image ${index + 1}`}
                className="z-0 object-cover"
                src={folderImage.firstImage || "/path/to/placeholder.jpg"}
                layout="fill"
                objectFit="cover"
                placeholder="blur"
                blurDataURL="/path/to/low-res-image.jpg"
                loading="lazy"
                quality={80}
              />
            </Card>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
}
