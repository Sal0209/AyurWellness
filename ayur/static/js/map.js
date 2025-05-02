/**
 * Map functionality for finding Ayurvedic centers
 * This script handles the Google Maps integration and center filtering
 */

// Map variables
let map;
let markers = [];
let userLocation = null;
let infoWindow;

// Initialize map when API loads
function initMap() {
    // Default center (India)
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 5,
        styles: [
            {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }],
            },
        ],
    });
    
    // Create info window for markers
    infoWindow = new google.maps.InfoWindow();
    
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user location
                map.setCenter(userLocation);
                map.setZoom(10);
                
                // Add user marker
                new google.maps.Marker({
                    position: userLocation,
                    map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    },
                    title: "Your Location",
                });
                
                // Load and display centers
                displayCenters();
            },
            () => {
                // User denied geolocation or error occurred
                handleLocationError(true);
                displayCenters();
            }
        );
    } else {
        // Browser doesn't support geolocation
        handleLocationError(false);
        displayCenters();
    }
    
    // Add event listeners for filter changes
    document.getElementById('center-type-filter').addEventListener('change', filterCenters);
    document.getElementById('search-input').addEventListener('input', filterCenters);
}

// Handle location error
function handleLocationError(browserHasGeolocation) {
    console.log(browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.");
}

// Load and display centers
function displayCenters() {
    // Clear existing markers
    clearMarkers();
    
    // Get centers from API
    fetch('/api/centers')
        .then(response => response.json())
        .then(centers => {
            // Add markers for each center
            centers.forEach(center => {
                addMarker(center);
            });
            
            // Store centers data for filtering
            window.centersData = centers;
            
            // Update center list
            updateCentersList(centers);
        })
        .catch(error => console.error('Error loading centers:', error));
}

// Add a marker for a center
function addMarker(center) {
    const position = {
        lat: parseFloat(center.latitude),
        lng: parseFloat(center.longitude)
    };
    
    // Calculate distance if user location is available
    if (userLocation) {
        center.distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng,
            position.lat,
            position.lng
        );
    }
    
    // Create marker
    const marker = new google.maps.Marker({
        position,
        map,
        title: center.name,
        animation: google.maps.Animation.DROP,
        icon: {
            url: '/static/images/marker-icon.png', // Custom marker
            scaledSize: new google.maps.Size(32, 32)
        }
    });
    
    // Store center data with marker
    marker.centerData = center;
    
    // Add click listener for info window
    marker.addListener('click', () => {
        // Create info window content
        const content = `
            <div class="info-window">
                <h5>${center.name}</h5>
                <p class="type">${center.type}</p>
                <p class="address">${center.address}</p>
                <p class="phone">${center.phone}</p>
                <div class="rating">
                    <span class="stars">${center.rating} ★</span>
                    <span class="reviews">(${center.reviews} reviews)</span>
                </div>
                ${center.distance ? `<p class="distance">${center.distance.toFixed(1)} km away</p>` : ''}
            </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
    
    // Store marker
    markers.push(marker);
    
    return marker;
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Update the centers list in the sidebar
function updateCentersList(centers) {
    const listContainer = document.getElementById('centers-list');
    listContainer.innerHTML = '';
    
    // Sort centers by distance if available
    if (userLocation) {
        centers.sort((a, b) => {
            if (a.distance !== undefined && b.distance !== undefined) {
                return a.distance - b.distance;
            }
            return 0;
        });
    }
    
    // Generate HTML for each center
    centers.forEach(center => {
        const centerElement = document.createElement('div');
        centerElement.className = 'center-item card mb-3';
        centerElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${center.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${center.type}</h6>
                <p class="card-text address">
                    <i class="fas fa-map-marker-alt"></i> ${center.address}
                </p>
                <p class="card-text phone">
                    <i class="fas fa-phone"></i> ${center.phone}
                </p>
                <div class="rating mb-2">
                    <span class="stars text-warning">${center.rating} <i class="fas fa-star"></i></span>
                    <span class="reviews text-muted">(${center.reviews} reviews)</span>
                </div>
                ${center.distance ? `<p class="distance text-info"><i class="fas fa-route"></i> ${center.distance.toFixed(1)} km away</p>` : ''}
            </div>
        `;
        
        // Add click handler to show on map
        centerElement.addEventListener('click', () => {
            // Find the marker
            const marker = markers.find(m => m.centerData.id === center.id);
            if (marker) {
                // Center map on marker
                map.setCenter(marker.getPosition());
                map.setZoom(15);
                
                // Open info window
                google.maps.event.trigger(marker, 'click');
            }
        });
        
        listContainer.appendChild(centerElement);
    });
    
    // Show "no results" message if no centers
    if (centers.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted">No centers found matching your filters.</p>
            </div>
        `;
    }
}

// Filter centers based on type and search
function filterCenters() {
    const typeFilter = document.getElementById('center-type-filter').value;
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    
    // Get original centers data
    const centers = window.centersData || [];
    
    // Apply filters
    const filteredCenters = centers.filter(center => {
        // Apply type filter
        const typeMatch = typeFilter === 'all' || center.type === typeFilter;
        
        // Apply search filter
        const searchMatch = 
            center.name.toLowerCase().includes(searchInput) ||
            center.address.toLowerCase().includes(searchInput);
        
        return typeMatch && searchMatch;
    });
    
    // Update markers visibility
    markers.forEach(marker => {
        const centerData = marker.centerData;
        const isVisible = 
            (typeFilter === 'all' || centerData.type === typeFilter) &&
            (centerData.name.toLowerCase().includes(searchInput) ||
             centerData.address.toLowerCase().includes(searchInput));
        
        marker.setVisible(isVisible);
    });
    
    // Update centers list
    updateCentersList(filteredCenters);
}

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Load Google Maps API
window.onload = function() {
    // Load the Google Maps API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
};