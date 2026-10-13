/**
 * Calculates great-circle distance between two points using the Haversine formula.
 * Returns distance in kilometers (km) rounded to 1 decimal place.
 * Returns null if either point lacks valid coordinates — does not invent coordinates.
 */
export function calculateHaversineDistance(
  coord1?: { lat: number; lng: number },
  coord2?: { lat: number; lng: number }
): number | null {
  if (
    !coord1 ||
    !coord2 ||
    typeof coord1.lat !== 'number' ||
    typeof coord1.lng !== 'number' ||
    typeof coord2.lat !== 'number' ||
    typeof coord2.lng !== 'number'
  ) {
    return null;
  }

  // Basic coordinate bounds check
  if (
    coord1.lat < -90 ||
    coord1.lat > 90 ||
    coord1.lng < -180 ||
    coord1.lng > 180 ||
    coord2.lat < -90 ||
    coord2.lat > 90 ||
    coord2.lng < -180 ||
    coord2.lng > 180
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}
