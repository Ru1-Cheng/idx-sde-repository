import { useEffect, useMemo, useState } from "react";
import { parsePhotos } from "../utils/propertyUtils";

function PropertyImageCarousel({
  photos,
  photoData,
  address,
  height = 220,
}) {
  const imageList = useMemo(() => {
    if (photos) {
      return parsePhotos(photos);
    }

    return parsePhotos(photoData);
  }, [photos, photoData]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [imageList]);

  const totalImages = imageList.length;

  if (totalImages === 0) {
    return (
      <div className="property-image-placeholder" style={{ height }}>
        No photo available
      </div>
    );
  }

  const previousImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === 0 ? totalImages - 1 : current - 1
    );
  };

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === totalImages - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="property-carousel" style={{ height }}>
      <img
        className="property-image"
        src={imageList[currentIndex]}
        alt={address || "Property"}
        onError={(event) => {
          event.currentTarget.style.display = "none";

          const placeholder =
            event.currentTarget.nextElementSibling;

          if (placeholder) {
            placeholder.style.display = "flex";
          }
        }}
      />

      <div
        className="property-image-placeholder"
        style={{ display: "none", height }}
      >
        No photo available
      </div>

      {totalImages > 1 && (
        <>
          <button
            type="button"
            className="carousel-button carousel-button-left"
            onClick={previousImage}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            className="carousel-button carousel-button-right"
            onClick={nextImage}
            aria-label="Next image"
          >
            ›
          </button>

          <div className="carousel-counter">
            {currentIndex + 1} / {totalImages}
          </div>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;
