import { useState } from "react";

const initialFilters = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({ onSearch, onClear, loading }) {
  const [filters, setFilters] = useState(initialFilters);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
      const trimmedValue = value.trim();

      if (trimmedValue !== "") {
        cleanFilters[key] = trimmedValue;
      }
    });

    onSearch(cleanFilters);
  }

  function handleClear() {
    setFilters(initialFilters);
    onClear();
  }

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="Portland"
          value={filters.city}
          onChange={handleChange}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="zipcode">ZIP Code</label>
        <input
          id="zipcode"
          name="zipcode"
          type="text"
          placeholder="97201"
          value={filters.zipcode}
          onChange={handleChange}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="minPrice">Minimum Price</label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          placeholder="300000"
          value={filters.minPrice}
          onChange={handleChange}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="maxPrice">Maximum Price</label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          placeholder="800000"
          value={filters.maxPrice}
          onChange={handleChange}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="beds">Beds</label>
        <select
          id="beds"
          name="beds"
          value={filters.beds}
          onChange={handleChange}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="baths">Baths</label>
        <select
          id="baths"
          name="baths"
          value={filters.baths}
          onChange={handleChange}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;