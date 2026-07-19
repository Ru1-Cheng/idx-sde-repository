function PropertyMap({ property }) {
  const address = [
    property?.L_Address,
    property?.L_City,
    property?.L_State,
    property?.L_Zip,
  ]
    .filter(Boolean)
    .join(", ");

  if (!address) {
    return <p>Location unavailable.</p>;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
    address
  )}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}`;

  return (
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
          rel="noreferrer"
          className="directions-button"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}

export default PropertyMap;