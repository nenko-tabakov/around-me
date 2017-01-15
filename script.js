var model = {
    "searchSettings": {
        "distance": 1.5,
        "placesTypes": ["cafe"]
    }
}

var foundPlaces = [];

function initMap() {
    var defaultPosition = {lat: -34.397, lng: 150.644};
    var map = new google.maps.Map(document.getElementById('map'), {
        center: defaultPosition,
        zoom: 12
    });

    var infoWindow = new google.maps.InfoWindow({map: map});

    var currentPositionMarker = new google.maps.Marker({
        position: defaultPosition,
        map: map
    });

    currentPositionMarker.addListener('click', function () {
        infoWindow.open(map, marker);
    });

    var geocoder = new google.maps.Geocoder;
    var placesService = new google.maps.places.PlacesService(map);

    map.addListener('click', function (event) {
        showPlaces(event.latLng, currentPositionMarker, placesService, infoWindow, geocoder, map);
    });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            showPlaces(pos, currentPositionMarker, placesService, infoWindow, geocoder, map);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function geocodePosition(geocoder, map, infowindow, marker) {
    geocoder.geocode({'location': marker.getPosition()}, function (results, status) {
        if (status === 'OK') {
            if (results[1]) {
                infowindow.setContent(results[1].formatted_address);
                infowindow.open(map, marker);
            }
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function changeSettings() {
    model.searchSettings.distance = $("#distanceRadius").val();
    model.searchSettings.placesTypes = $("#places").val();
}

function searchForPlaces(placesService, marker, map) {
    var request = {
        location: marker.getPosition(),
        radius: model.searchSettings.distance * 1000,
        types: model.searchSettings.placesTypes
    };
    placesService.nearbySearch(request, function (results, status) {
        clearMarkers();
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(map, results[i]);
            }
        }
    });
}

function showPlaces(position, currentPositionMarker, placesService, infoWindow, geocoder, map) {
    currentPositionMarker.setPosition(position);
    searchForPlaces(placesService, currentPositionMarker, map);
    infoWindow.setPosition(currentPositionMarker.getPosition());
    infoWindow.setContent("Geocoding location...");
    geocodePosition(geocoder, map, infoWindow, currentPositionMarker)
}

function createMarker(map, place) {
    foundPlaces.push(new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        animation: google.maps.Animation.DROP,
        icon: place.icon
    }));
}

function clearMarkers() {
    for (var i = 0; i < foundPlaces.length; i++) {
        foundPlaces[i].setMap(null);
    }
}