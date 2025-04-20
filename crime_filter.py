import pandas as pd

def get_danger_zones():
    df = pd.read_csv("data/FilteredCrime.csv")
    df = df.dropna(subset=['Latitude', 'Longitude'])

    # Keep only Gaithersburg city points
    df = df[df["City"].str.lower() == "gaithersburg"]

    # We'll simplify by just sending lat/lng of crimes
    danger_points = df[['Latitude', 'Longitude']].values.tolist()
    return danger_points
