# modules/clustering.py
import joblib
from shapely.geometry import Point
from shapely.ops import unary_union
import json

# Load the trained DBSCAN model
_dbscan = joblib.load("model/dbscan.pkl")

def add_clusters(df):
    """Add clustering labels to the dataframe."""
    df['Cluster'] = _dbscan.labels_
    return df

def make_avoid_polygons(df, avoid_clusters, buffer_deg=0.005):
    """Returns a GeoJSON MultiPolygon of buffered centroids for clusters to avoid."""
    polys = []
    for c in avoid_clusters:
        pts = df[df.Cluster == c][['Longitude', 'Latitude']].values
        if len(pts) == 0:
            continue
        # Compute centroid
        xs, ys = pts[:, 0], pts[:, 1]
        centroid = Point(xs.mean(), ys.mean())
        pol = centroid.buffer(buffer_deg)  # degrees ≈ ~500m
        polys.append(pol)
    
    if not polys:
        return None
    mp = unary_union(polys)
    return json.loads(json.dumps(mp.__geo_interface__))
