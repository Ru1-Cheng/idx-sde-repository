import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchOpenHouses,
  fetchProperty,
} from "../api/client";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import {
  formatPrice,
  formatValue,
} from "../utils/propertyUtils";

function formatDateTime(value) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function parseAllData(allData) {
  if (!allData) {
    return {};
  }

  if (typeof allData === "object") {
    return allData;
  }

  if (typeof allData !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(allData);

    if (parsed && typeof parsed === "object") {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function getOpenHouseRemarks(openHouse) {
  const allData = parseAllData(
    openHouse.all_data ||
      openHouse.allData ||
      openHouse.AllData
  );

  return (
    openHouse.OH_Remarks ||
    openHouse.OpenHouseRemarks ||
    openHouse.openHouseRemarks ||
    allData.OpenHouseRemarks ||
    allData.OH_Remarks ||
    allData.openHouseRemarks ||
    ""
  );
}

function PropertyDetailPage() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPropertyDetails() {
      setLoading(true);
      setError("");

      try {
        const [propertyData, openHouseData] =
          await Promise.all([
            fetchProperty(id),
            fetchOpenHouses(id),
          ]);

        if (!isActive) {
          return;
        }

        setProperty(
          propertyData.property ||
            propertyData.data ||
            propertyData
        );

        const openHouseResults =
          openHouseData.openHouses ||
          openHouseData.data ||
          openHouseData ||
          [];

        setOpenHouses(
          Array.isArray(openHouseResults)
            ? openHouseResults
            : []
        );
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError.message ||
            "Failed to load property details."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadPropertyDetails();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="property-detail-page">
        <Link to="/" className="back-link">
          ← Back to listings
        </Link>

        <p>Loading property details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="property-detail-page">
        <Link to="/" className="back-link">
          ← Back to listings
        </Link>

        <p className="error-message">{error}</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="property-detail-page">
        <Link to="/" className="back-link">
          ← Back to listings
        </Link>

        <p>Property not found.</p>
      </main>
    );
  }

  const location = [
    property.L_City,
    property.L_State,
    property.L_Zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="property-detail-page">
      <Link to="/" className="back-link">
        ← Back to listings
      </Link>

      <section className="property-detail-header">
        <div>
          <h1>
            {property.L_Address ||
              "Address not available"}
          </h1>

          <p className="property-detail-location">
            {location || "Location not available"}
          </p>
        </div>

        <h2 className="property-detail-price">
          {formatPrice(property.L_SystemPrice)}
        </h2>
      </section>

      <section className="property-detail-gallery">
        <PropertyImageGallery
          photoData={property.L_Photos}
          address={property.L_Address}
        />
      </section>

      <section className="property-detail-stats">
        <div>
          <strong>
            {formatValue(property.L_Keyword2)}
          </strong>
          <span>Beds</span>
        </div>

        <div>
          <strong>
            {formatValue(property.LM_Dec_3)}
          </strong>
          <span>Baths</span>
        </div>

        <div>
          <strong>
            {formatValue(property.LM_Int2_3)}
          </strong>
          <span>Sqft</span>
        </div>
      </section>

      <section className="property-detail-section">
        <h2>Description</h2>

        <p>
          {property.L_Remarks ||
            property.L_PublicRemarks ||
            "No description available."}
        </p>
      </section>

      <section className="property-detail-section">
        <h2>Location</h2>

        <PropertyMap property={property} />
      </section>

      <section className="property-detail-section">
        <h2>Open Houses</h2>

        {openHouses.length > 0 ? (
          <div className="open-house-list">
            {openHouses.map((openHouse, index) => {
              const remarks =
                getOpenHouseRemarks(openHouse);

              return (
                <article
                  key={
                    openHouse.id ||
                    openHouse.OH_OpenHouseID ||
                    index
                  }
                  className="open-house-card"
                >
                  <p>
                    <strong>Start:</strong>{" "}
                    {formatDateTime(
                      openHouse.OH_StartDateTime ||
                        openHouse.startDateTime ||
                        openHouse.start
                    )}
                  </p>

                  <p>
                    <strong>End:</strong>{" "}
                    {formatDateTime(
                      openHouse.OH_EndDateTime ||
                        openHouse.endDateTime ||
                        openHouse.end
                    )}
                  </p>

                  {remarks ? (
                    <p className="open-house-remarks">
                      {remarks}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p>No upcoming open houses.</p>
        )}
      </section>
    </main>
  );
}

export default PropertyDetailPage;