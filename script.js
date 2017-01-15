var model = {
    "searchSettings": {
        "distance": 1,
        "placesTypes": []
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
    clearMarkers();
    for (var i = 0; i < model.searchSettings.placesTypes.length; i++) {
        var request = {
            location: marker.getPosition(),
            radius: model.searchSettings.distance * 1000,
            type: model.searchSettings.placesTypes[i]
        };
        placesService.nearbySearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(map, results[i]);
                }
            }
        });
    }

}

function showPlaces(position, currentPositionMarker, placesService, infoWindow, geocoder, map) {
    currentPositionMarker.setPosition(position);
    searchForPlaces(placesService, currentPositionMarker, map);
    infoWindow.setPosition(currentPositionMarker.getPosition());
    infoWindow.setContent("Geocoding location...");
    geocodePosition(geocoder, map, infoWindow, currentPositionMarker);
    map.setCenter(position);
}

function createMarker(map, place) {
    foundPlaces.push(new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: createTitle(place),
        animation: google.maps.Animation.DROP,
        icon: place.icon
    }));
}

function createTitle(place) {
    return place.name;
}

function clearMarkers() {
    for (var i = 0; i < foundPlaces.length; i++) {
        foundPlaces[i].setMap(null);
    }
}

function getDisplayNames() {
    var ids =
        [
            "accounting",
            "airport",
            "amusement_park",
            "aquarium",
            "art_gallery",
            "atm",
            "bakery",
            "bank",
            "bar",
            "beauty_salon",
            "bicycle_store",
            "book_store",
            "bowling_alley",
            "bus_station",
            "cafe",
            "campground",
            "car_dealer",
            "car_rental",
            "car_repair",
            "car_wash",
            "casino",
            "cemetery",
            "church",
            "city_hall",
            "clothing_store",
            "convenience_store",
            "courthouse",
            "dentist",
            "department_store",
            "doctor",
            "electrician",
            "electronics_store",
            "embassy",
            "fire_station",
            "florist",
            "funeral_home",
            "furniture_store",
            "gas_station",
            "gym",
            "hair_care",
            "hardware_store",
            "hindu_temple",
            "home_goods_store",
            "hospital",
            "insurance_agency",
            "jewelry_store",
            "laundry",
            "lawyer",
            "library",
            "liquor_store",
            "local_government_office",
            "locksmith",
            "lodging",
            "meal_delivery",
            "meal_takeaway",
            "mosque",
            "movie_rental",
            "movie_theater",
            "moving_company",
            "museum",
            "night_club",
            "painter",
            "park",
            "parking",
            "pet_store",
            "pharmacy",
            "physiotherapist",
            "plumber",
            "police",
            "post_office",
            "real_estate_agency",
            "restaurant",
            "roofing_contractor",
            "rv_park",
            "school",
            "shoe_store",
            "shopping_mall",
            "spa",
            "stadium",
            "storage",
            "store",
            "subway_station",
            "synagogue",
            "taxi_stand",
            "train_station",
            "transit_station",
            "travel_agency",
            "university",
            "veterinary_care",
            "zoo"
        ];

    var displayNames = [];
    for (var i = 0; i < ids.length; i++) {
        displayNames.push({"id": ids[i], "displayName": getDisplayName(ids[i])});
    }

    return displayNames;
}

function getDisplayName(val) {
    var splitChar = "_";
    if (val.indexOf(splitChar) != -1) {
        var splittedId = val.split(splitChar);
        var displayName = "";
        for (var n = 0; n < splittedId.length; n++) {
            displayName += capitalizeFirstLetter(splittedId[n]);
            if (n != splittedId.length - 1) {
                displayName += " ";
            }
        }

        return displayName;
    } else {
        return capitalizeFirstLetter(val);
    }
}

function capitalizeFirstLetter(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}