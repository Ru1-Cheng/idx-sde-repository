import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 20;

function getPropertyId(property) {
  return (
    property.L_ListingID ||
    property.L_ListingId ||
    property.L_DisplayId ||
    property.L_DisplayID ||
    property.ListingID ||
    property.ListingId ||
    property.listingID ||
    property.listingId ||
    property.propertyId ||
    property.PropertyID ||
    property.id ||
    property.ID
  );
}

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  const requestIdRef = useRef(0);

  const loadProperties = useCallback(
    async (searchFilters, page) => {
      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setError("");

        const params = {
          ...searchFilters,
          limit: ITEMS_PER_PAGE,
          offset: (page - 1) * ITEMS_PER_PAGE,
        };

        const data = await fetchProperties(params);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setProperties(
          Array.isArray(data.results) ? data.results : []
        );

        setTotal(Number(data.total) || 0);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(
          err.message || "Unable to load properties."
        );

        setProperties([]);
        setTotal(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadProperties({}, 1);
  }, [loadProperties]);

  function handleSearch(newFilters) {
    setFilters(newFilters);
    setCurrentPage(1);
    loadProperties(newFilters, 1);
  }

  function handleClear() {
    setFilters({});
    setCurrentPage(1);
    loadProperties({}, 1);
  }

  function handlePageChange(page) {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    loadProperties(filters, page);
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const start =
    total === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const end = Math.min(
    currentPage * ITEMS_PER_PAGE,
    total
  );

  return (
    <main className="listings-page">
      <h1>Property Listings</h1>

      <PropertyFilters
        onSearch={handleSearch}
        onClear={handleClear}
        loading={loading}
      />

      {loading && (
        <p className="status-message">
          Loading properties...
        </p>
      )}

      {!loading && error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="property-count">
            Showing {start}-{end} of {total} properties
          </p>

          {properties.length === 0 ? (
            <div className="empty-message">
              <h2>No properties found</h2>

              <p>
                Try changing or clearing your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="property-grid">
                {properties.map((property, index) => {
                  const propertyId =
                    getPropertyId(property);

                  return (
                    <PropertyCard
                      key={propertyId || index}
                      property={property}
                    />
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default ListingsPage;