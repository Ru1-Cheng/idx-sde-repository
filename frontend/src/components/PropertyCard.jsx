function PropertyCard({ property }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <h3>{property.L_Address || "No Address"}</h3>

      <p>
        {property.L_City}, {property.L_State} {property.L_Zip}
      </p>

      <p>
        <strong>Price:</strong>{" "}
        {property.L_SystemPrice
          ? `$${Number(property.L_SystemPrice).toLocaleString()}`
          : "Not available"}
      </p>

      <p>
        {property.L_Keyword2 ?? "N/A"} Beds |{" "}
        {property.LM_Dec_3 ?? "N/A"} Baths
      </p>
    </div>
  );
}

export default PropertyCard;