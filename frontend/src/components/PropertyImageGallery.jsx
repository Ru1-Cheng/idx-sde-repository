import { useEffect, useMemo, useState } from "react";
import { parsePhotos } from "../utils/propertyUtils";

function PropertyImageGallery({ photos, photoData, address }) {
  const parsedImages = useMemo(() => {
    if (photos) {
      return parsePhotos(photos);
    }

    return parsePhotos(photoData);
  }, [photos, photoData]);

  const [images, setImages] = useState(parsedImages);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setImages(parsedImages);
    setCurrent(0);
    setLightbox(false);
  }, [parsedImages]);

  useEffect(() => {
    if (!lightbox) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightbox(false);
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        setCurrent((index) =>
          index === images.length - 1 ? 0 : index + 1
        );
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
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

  useEffect(() => {
    if (current >= images.length && images.length > 0) {
      setCurrent(images.length - 1);
    }
  }, [current, images.length]);

  const removeBrokenImage = (brokenIndex) => {
    setImages((currentImages) =>
      currentImages.filter((_, index) => index !== brokenIndex)
    );

    setCurrent((currentIndex) => {
      if (brokenIndex < currentIndex) {
        return currentIndex - 1;
      }

      if (currentIndex >= images.length - 1) {
        return Math.max(0, images.length - 2);
      }

      return currentIndex;
    });
  };

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

  if (images.length === 0) {
    return (
      <div className="gallery-placeholder">
        No images available
      </div>
    );
  }

  return (
    <>
      <div className="property-gallery">
        <img
          className="gallery-main-image"
          src={images[current]}
          alt={address || "Property"}
          onClick={() => setLightbox(true)}
          onError={() => removeBrokenImage(current)}
        />

        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={
                  current === index
                    ? "gallery-thumbnail-button active"
                    : "gallery-thumbnail-button"
                }
                onClick={() => setCurrent(index)}
                aria-label={`View property image ${index + 1}`}
              >
                <img
                  src={image}
                  alt=""
                  className="gallery-thumbnail"
                  onError={() => removeBrokenImage(index)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && images.length > 0 && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Property image viewer"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close image viewer"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox(false);
            }}
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-left"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  previous();
                }}
              >
                ‹
              </button>

              <button
                type="button"
                className="lightbox-right"
                aria-label="Next image"
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
            alt={address || "Property"}
            onClick={(event) => event.stopPropagation()}
            onError={() => removeBrokenImage(current)}
          />

          <div
            className="lightbox-counter"
            onClick={(event) => event.stopPropagation()}
          >
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyImageGallery;