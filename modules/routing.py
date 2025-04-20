# modules/routing.py
import openrouteservice

# Initialize ORS client
_client = openrouteservice.Client(key="5b3ce3597851110001cf62489cd296530f20464197546edd966ea25c")

def get_safe_route(start, end, avoid_polygons):
    """Get the safe route by avoiding crime hotspots."""
    coords = [(start[1], start[0]), (end[1], end[0])]  # ORS expects (lng, lat)
    params = {
        "coordinates": coords,
        "profile": profile,
        "format_out": "geojson",
        "options": {
            "avoid_polygons": avoid_polygons
        }
    };
    if avoid_polygons:
        params["options"] = {"avoid_polygons": avoid_polygons}
    return _client.directions(**params)


# 5b3ce3597851110001cf62489cd296530f20464197546edd966ea25c