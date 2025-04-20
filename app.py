from flask import Flask, render_template, request, jsonify
from modules.data_loader import load_crime_data
from modules.clustering import add_clusters, make_avoid_polygons
import openrouteservice
import traceback  # ← You forgot this
import os

app = Flask(__name__)
client = openrouteservice.Client(key="5b3ce3597851110001cf62489cd296530f20464197546edd966ea25c")  # Replace with a valid key

def get_routes(start, end):
    # Get crime hotspots to avoid
    df = load_crime_data()
    df = add_clusters(df)
    avoid_clusters = df['Cluster'].unique().tolist()
    if -1 in avoid_clusters: avoid_clusters.remove(-1)  # Remove noise
    avoid_polygons = make_avoid_polygons(df, avoid_clusters)

    # Get safe walking route (avoiding crime clusters)
    safe_walk_route = client.directions(
        coordinates=[start, end],
        profile='foot-walking',
        format='geojson',
        instructions=False,
        options={'avoid_polygons': avoid_polygons} if avoid_polygons else {}
    )

    # Get unsafe walking route (through crime clusters)
    unsafe_walk_route = client.directions(
        coordinates=[start, end],
        profile='foot-walking',
        format='geojson',
        instructions=False
    )

    # Get safe bus route (avoiding crime clusters)
    safe_bus_route = client.directions(
        coordinates=[start, end],
        profile='driving-car',
        format='geojson',
        instructions=False,
        options={'avoid_polygons': avoid_polygons} if avoid_polygons else {}
    )

    # Get unsafe bus route (through crime clusters)
    unsafe_bus_route = client.directions(
        coordinates=[start, end],
        profile='driving-car',
        format='geojson',
        instructions=False
    )

    return {
        'safe': {
            'walk': safe_walk_route,
            'bus': safe_bus_route
        },
        'unsafe': {
            'walk': unsafe_walk_route,
            'bus': unsafe_bus_route
        }
    }


@app.route('/get_crime_hotspots')
def get_hotspots():
    df = load_crime_data()
    df = add_clusters(df)
    # Avoid clusters with high crime density (e.g. clusters >= 0)
    avoid_clusters = df['Cluster'].unique().tolist()
    if -1 in avoid_clusters: avoid_clusters.remove(-1)  # Remove noise
    geojson_poly = make_avoid_polygons(df, avoid_clusters)
    if geojson_poly and geojson_poly['type'] == 'MultiPolygon':
        # Convert to list of Polygons to loop in frontend
        polygons = [{'type': 'Polygon', 'coordinates': c} for c in geojson_poly['coordinates']]
    else:
        polygons = [geojson_poly] if geojson_poly else []

    return jsonify({ "hotspots": polygons })


@app.route('/')
def home():
    return render_template("index.html")

@app.route('/get_routes', methods=['POST'])
def get_route_data():
    try:
        data = request.get_json()
        start = data.get('start')
        end = data.get('end')

        routes = get_routes(start, end)

        travel_times = {
            "safe_walk": {"time_min": int(routes['safe']['walk']['features'][0]['properties']['summary']['duration'] // 60)},
            "unsafe_walk": {"time_min": int(routes['unsafe']['walk']['features'][0]['properties']['summary']['duration'] // 60)},
            "safe_bus":  {"time_min": int(routes['safe']['bus']['features'][0]['properties']['summary']['duration'] // 60)},
            "unsafe_bus": {"time_min": int(routes['unsafe']['bus']['features'][0]['properties']['summary']['duration'] // 60)}
        }

        return jsonify({
            "routes": routes,
            "travel_modes": travel_times
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)