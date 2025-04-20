import os, joblib, pandas as pd
from sklearn.cluster import DBSCAN

# 1. Ensure model folder exists
os.makedirs("model", exist_ok=True)

# 2. Load & clean Gaithersburg crime data
df = pd.read_csv("data/FilteredCrime.csv")
df = df.dropna(subset=['Latitude','Longitude'])
df = df[(df.Latitude != 0) & (df.Longitude != 0)]

# 3. Fit DBSCAN (tweak eps/min_samples for best hotspots)
coords = df[['Latitude','Longitude']]
db = DBSCAN(eps=0.005, min_samples=5).fit(coords)

# 4. Serialize
joblib.dump(db, "model/dbscan.pkl")
print("✔️ DBSCAN model saved to model/dbscan.pkl")
