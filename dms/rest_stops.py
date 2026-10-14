"""GPS and Point-of-Interest (POI) Rest Stop Recommendation Service.

Recommends nearby rest areas, petrol stations, and driver service centers when
drowsiness or distraction counts exceed safety thresholds. Features UAE highway
network points of interest (ADNOC Oasis, ENOC, Emarat, highway rest stops)
and general GPS distance calculation.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class RestStopPOI:
    name: str
    category: str  # 'Fuel Station & Coffee', 'Highway Rest Area', 'Service Station'
    highway: str
    latitude: float
    longitude: float
    distance_km: float
    estimated_time_min: int
    amenities: List[str]


class RestStopRecommender:
    """Calculates nearest rest locations based on GPS telemetry."""

    # Curated regional highway POIs (UAE highway corridor reference points)
    KNOWN_STOPS = [
        {
            "name": "ENOC Service Station 1084 - Dubai Bypass",
            "category": "Fuel Station & Coffee",
            "highway": "E611 Emirates Road",
            "lat": 25.1325,
            "lon": 55.3852,
            "amenities": ["Costa Coffee", "ZOOM Market", "Prayer Hall", "Restrooms"],
        },
        {
            "name": "ADNOC Oasis Service Station 772",
            "category": "Service Station",
            "highway": "E11 Sheikh Zayed Road",
            "lat": 25.0450,
            "lon": 55.1580,
            "amenities": ["Starbucks Drive-Thru", "Oasis Cafe", "Vehicle Care", "24/7 ATM"],
        },
        {
            "name": "Emarat Atlan Rest Center",
            "category": "Highway Rest Area",
            "highway": "E311 Sheikh Mohammed Bin Zayed Rd",
            "lat": 25.2910,
            "lon": 55.4310,
            "amenities": ["McDonald's", "Bakeria", "Truck Parking", "Quiet Rest Zone"],
        },
        {
            "name": "Sharjah University City Service Area",
            "category": "Fuel Station & Coffee",
            "highway": "University City Road",
            "lat": 25.2985,
            "lon": 55.4740,
            "amenities": ["Tim Hortons", "Convenience Store", "EV Fast Charger"],
        },
        {
            "name": "ADNOC Mega Station - Al Samha",
            "category": "Highway Rest Area",
            "highway": "E11 Abu Dhabi - Dubai Highway",
            "lat": 24.7890,
            "lon": 54.7210,
            "amenities": ["Subway", "Coffee Planet", "Spacious Rest Area", "Full Mechanic"],
        },
    ]

    @classmethod
    def get_recommendations(
        cls,
        current_lat: float = 25.2048,  # Default: Dubai/Sharjah coordinate
        current_lon: float = 55.2708,
        max_results: int = 3,
    ) -> List[RestStopPOI]:
        """Finds closest rest stops relative to current GPS latitude and longitude."""
        results: List[RestStopPOI] = []

        for item in cls.KNOWN_STOPS:
            d = cls._haversine_distance_km(current_lat, current_lon, item["lat"], item["lon"])
            est_time = max(2, int(round((d / 80.0) * 60)))  # Assuming average 80 km/h highway transit
            results.append(
                RestStopPOI(
                    name=item["name"],
                    category=item["category"],
                    highway=item["highway"],
                    latitude=item["lat"],
                    longitude=item["lon"],
                    distance_km=round(d, 1),
                    estimated_time_min=est_time,
                    amenities=item["amenities"],
                )
            )

        results.sort(key=lambda s: s.distance_km)
        return results[:max_results]

    @staticmethod
    def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes great-circle distance between two GPS coordinates in kilometers."""
        r = 6371.0  # Earth radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lambda = math.radians(lon2 - lon1)

        a = math.sin(d_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r * c
