document.addEventListener("DOMContentLoaded", () => {
    // Fix for Leaflet icon not loading
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  
    const map = L.map('map').setView([39.1434, -77.2014], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    // Load crime hotspots as polygons
    fetch('/get_crime_hotspots')
      .then(res => res.json())
      .then(data => {
        data.hotspots.forEach(hotspot => {
          L.geoJSON(hotspot, {
            style: {
              color: 'red',
              weight: 2,
              fillOpacity: 0.5
            }
          }).addTo(map);
        });
      });
  
    let startPin = null, endPin = null;
    let safeWalkLayer = null, unsafeWalkLayer = null;
    let safeBusLayer = null, unsafeBusLayer = null;
  
    map.on('click', e => {
      if (!startPin) {
        startPin = L.marker(e.latlng, { draggable: true }).addTo(map).bindPopup('Source').openPopup();
      } else if (!endPin) {
        endPin = L.marker(e.latlng, { draggable: true }).addTo(map).bindPopup('Destination').openPopup();
      }
    });
  
    document.getElementById('findBtn').onclick = () => {
      if (!startPin || !endPin) {
        return alert('Click once for Source, once for Destination.');
      }
  
      // Remove old routes if any
      if (safeWalkLayer) map.removeLayer(safeWalkLayer);
      if (unsafeWalkLayer) map.removeLayer(unsafeWalkLayer);
      if (safeBusLayer) map.removeLayer(safeBusLayer);
      if (unsafeBusLayer) map.removeLayer(unsafeBusLayer);
  
      const start = [startPin.getLatLng().lng, startPin.getLatLng().lat];
      const end = [endPin.getLatLng().lng, endPin.getLatLng().lat];
  
      fetch('/get_routes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ start, end })
      })
      .then(r => {
        if (!r.ok) throw new Error(`Server ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Draw safe walking route (green)
        safeWalkLayer = L.geoJSON(data.routes.safe.walk, {
          style: { color: 'green', weight: 5 }
        }).addTo(map).bindPopup('Safe Walking Route');

        // Draw unsafe walking route (red)
        unsafeWalkLayer = L.geoJSON(data.routes.unsafe.walk, {
          style: { color: 'red', weight: 5, dashArray: '5,5' }
        }).addTo(map).bindPopup('Unsafe Walking Route');

        // Draw safe bus route (blue)
        safeBusLayer = L.geoJSON(data.routes.safe.bus, {
          style: { color: 'blue', weight: 5 }
        }).addTo(map).bindPopup('Safe Bus Route');

        // Draw unsafe bus route (orange)
        unsafeBusLayer = L.geoJSON(data.routes.unsafe.bus, {
          style: { color: 'orange', weight: 5, dashArray: '5,5' }
        }).addTo(map).bindPopup('Unsafe Bus Route');

        // Hide bus layers initially
        if (safeBusLayer) map.removeLayer(safeBusLayer);
        if (unsafeBusLayer) map.removeLayer(unsafeBusLayer);
  
        // Show travel time info
        const t = data.travel_modes;
        document.getElementById('travelTimes').innerHTML = `
          <strong>Walking Routes:</strong><br>
          Safe: ${t.safe_walk.time_min} min<br>
          Unsafe: ${t.unsafe_walk.time_min} min<br><br>
          <strong>Bus Routes:</strong><br>
          Safe: ${t.safe_bus.time_min} min<br>
          Unsafe: ${t.unsafe_bus.time_min} min
        `;
  
        // Show toggle buttons
        document.getElementById('walkBtn').style.display = 'inline-block';
        document.getElementById('busBtn').style.display = 'inline-block';
      })
      .catch(err => {
        console.error(err);
        alert('Error fetching routes. Check server log.');
      });
    };
  
    // Toggle buttons
    document.getElementById('walkBtn').onclick = () => {
      if (safeBusLayer) map.removeLayer(safeBusLayer);
      if (unsafeBusLayer) map.removeLayer(unsafeBusLayer);
      if (safeWalkLayer) map.addLayer(safeWalkLayer);
      if (unsafeWalkLayer) map.addLayer(unsafeWalkLayer);
    };
  
    document.getElementById('busBtn').onclick = () => {
      if (safeWalkLayer) map.removeLayer(safeWalkLayer);
      if (unsafeWalkLayer) map.removeLayer(unsafeWalkLayer);
      if (safeBusLayer) map.addLayer(safeBusLayer);
      if (unsafeBusLayer) map.addLayer(unsafeBusLayer);
    };
  });
  