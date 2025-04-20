# modules/data_loader.py
import pandas as pd

def load_crime_data(path="data/FilteredCrime.csv"):
    """Load crime data and clean."""
    df = pd.read_csv(path)
    df = df.dropna(subset=['Latitude', 'Longitude'])
    df = df[(df['Latitude'] != 0) & (df['Longitude'] != 0)]
    if 'Dispatch Date / Time' in df.columns:
        df['Dispatch Date / Time'] = pd.to_datetime(df['Dispatch Date / Time'], errors='coerce')
        df['Year'] = df['Dispatch Date / Time'].dt.year
    return df
