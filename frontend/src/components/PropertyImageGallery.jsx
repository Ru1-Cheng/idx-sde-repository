import { useEffect, useMemo, useState } from "react";
import { parsePhotos } from "../utils/propertyUtils";

function PropertyImageGallery({ photos, photoData, address }) {
  const images = useMemo(() => {
    if (photos) return parsePhotos(photos);
    return parsePhotos(photoData);
  }, [photos, photoData]);

  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setCurrent(0);
  }, [images]);

  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightbox(false);
      }

      if (event.key === "ArrowRight") {
        setCurrent((index) =>
          index === images.length - 1 ? 0 : index + 1
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrent((index) =>
          index === 0 ? images.length - 1 : index - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox, images.length]);

  if (images.length === 0) {
    return (
      <div className="gallery-placeholder">
        No images available
      </div>
    );
  }

  const previous = () => {
    setCurrent((index) =>
      index === 0 ? images.length - 1 : index - 1
    );
  };

  const next = () => {
    setCurrent((index) =>
      index === images.length - 1 ? 0 : index + 1
    );
  };

  return (
    <>
      <div className="property-gallery">
        <img
          className="gallery-main-image"
          src={images[current]}
          alt={address || "Property"}
          onClick={() => setLightbox(true)}
        />

        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className={
                current === index
                  ? "gallery-thumbnail active"
                  : "gallery-thumbnail"
              }
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightbox(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                className="lightbox-left"
                onClick={(event) => {
                  event.stopPropagation();
                  previous();
                }}
              >
                ‹
              </button>

              <button
                className="lightbox-right"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            className="lightbox-image"
            src={images[current]}
            alt={address}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default PropertyImageGallery;