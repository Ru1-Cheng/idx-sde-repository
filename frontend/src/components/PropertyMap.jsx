function PropertyMap({ property }) {
  const latitude = Number(property?.LMD_MP_Latitude);
  const longitude = Number(property?.LMD_MP_Longitude);

  const hasValidCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  if (!hasValidCoordinates) {
    return <p>Location unavailable.</p>;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // ===== DEBUG =====
  console.log("Google Maps API Key:", apiKey);
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  // =================

  if (!apiKey) {
    return <p>Map is unavailable because the Google Maps API key is missing.</p>;
  }

  const coordinates = `${latitude},${longitude}`;

  const mapUrl =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(coordinates)}` +
    `&zoom=15`;

  const directionsUrl =
    `https://www.google.com/maps/dir/` +
    `?api=1&destination=${encodeURIComponent(coordinates)}`;

  return (
    <section className="property-map-section">
      <h2>Location</h2>

      <div className="property-map">
        <iframe
          title="Property Location"
          src={mapUrl}
          width="100%"
          height="400"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="property-map-actions">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="directions-button"
          >
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}

export default PropertyMap;