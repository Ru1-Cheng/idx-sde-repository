export function parsePhotos(photoValue) {
  if (!photoValue) {
    return [];
  }

  if (Array.isArray(photoValue)) {
    return photoValue.filter(
      (photo) => typeof photo === "string" && photo.trim() !== ""
    );
  }

  if (typeof photoValue !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(photoValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (photo) => typeof photo === "string" && photo.trim() !== ""
    );
  } catch {
    return [];
  }
}

export function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Price not available";
  }

  return `$${numericPrice.toLocaleString()}`;
}

export function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return value;
}

export function getPropertyId(property) {
  return (
    property.L_ListingID ||
    property.L_ListingId ||
    property.L_DisplayID ||
    property.L_DisplayId ||
    property.ListingID ||
    property.ListingId ||
    property.listingID ||
    property.listingId ||
    property.PropertyID ||
    property.propertyId ||
    property.id ||
    property.ID
  );
}
