import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import {
  formatPrice,
  formatValue,
  getPropertyId,
} from "../utils/propertyUtils";

function PropertyCard({ property }) {
  const propertyId = getPropertyId(property);

  const location = [
    property.L_City,
    property.L_State,
    property.L_Zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      to={propertyId ? `/property/${propertyId}` : "/"}
      className="property-card-link"
      aria-label={`View details for ${
        property.L_Address || "this property"
      }`}
      onClick={(event) => {
        if (!propertyId) {
          event.preventDefault();
        }
      }}
    >
      <article className="property-card">
        <PropertyImageCarousel
          photoData={property.L_Photos}
          address={property.L_Address}
          height={220}
        />

        <div className="property-card-content">
          <h2 className="property-price">
            {formatPrice(property.L_SystemPrice)}
          </h2>

          <h3 className="property-address">
            {property.L_Address || "Address not available"}
          </h3>

          <p className="property-location">
            {location || "Location not available"}
          </p>

          <p className="property-stats">
            <span>
              {formatValue(property.L_Keyword2)} Beds
            </span>

            <span>
              {formatValue(property.LM_Dec_3)} Baths
            </span>

            <span>
              {formatValue(property.LM_Int2_3)} Sqft
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}

export default PropertyCard;