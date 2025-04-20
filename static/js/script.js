let map = L.map('map').setView([39.1434, -77.2014], 13); // Gaithersburg

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let startMarker, endMarker;

map.on('click', function(e) {
    if (!startMarker) {
        startMarker = L.marker(e.latlng).addTo(map).bindPopup("Start").openPopup();
    } else if (!endMarker) {
        endMarker = L.marker(e.latlng).addTo(map).bindPopup("Destination").openPopup();
        fetchDangerZonesAndDrawRoute();
    }
});

function fetchDangerZonesAndDrawRoute() {
    fetch('/danger_zones')
    .then(res => res.json())
    .then(dangerZones => {
        dangerZones.forEach(([lat, lng]) => {
            L.circle([lat, lng], {
                radius: 50,
                color: 'red',
                fillOpacity: 0.3
            }).addTo(map);
        });

        fetch(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                coordinates: [
                    [startMarker.getLatLng().lng, startMarker.getLatLng().lat],
                    [endMarker.getLatLng().lng, endMarker.getLatLng().lat]
                ],
                options: {
                    avoid_polygons: {
                        type: "MultiPolygon",
                        coordinates: [
                            dangerZones.map(([lat, lng]) => [
                                [
                                    [lng - 0.001, lat - 0.001],
                                    [lng - 0.001, lat + 0.001],
                                    [lng + 0.001, lat + 0.001],
                                    [lng + 0.001, lat - 0.001],
                                    [lng - 0.001, lat - 0.001]
                                ]
                            ])
                        ]
                    }
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            let coords = data.features[0].geometry.coordinates;
            let latlngs = coords.map(coord => [coord[1], coord[0]]);
            L.polyline(latlngs, {color: 'blue'}).addTo(map);

            let duration = data.features[0].properties.summary.duration / 60;
            alert(`Walking Time: ${duration.toFixed(1)} minutes\nEstimated by OpenRouteService`);
        });
    });
}
