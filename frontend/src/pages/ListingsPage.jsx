import { useEffect, useState } from "react";
import api from "../api/client";
import PropertyCard from "../components/PropertyCard";

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const response = await api.get("/properties");
        setProperties(response.data.results || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load properties.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Property Listings</h1>

      <p>{properties.length} properties loaded.</p>

      {properties.map((property) => (
        <PropertyCard
          key={property.L_ListingID}
          property={property}
        />
      ))}
    </div>
  );
}

export default ListingsPage;