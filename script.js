var geocoder;

var placesService;

var foundPlaces = [];

var currentPositionMarker;

var infoWindow;

var map;

function initMap() {
    var defaultPosition = {lat: -34.397, lng: 150.644};
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultPosition,
        zoom: 12
    });

    infoWindow = new google.maps.InfoWindow({map: map});

    currentPositionMarker = new google.maps.Marker({
        position: defaultPosition,
        map: map
    });

    currentPositionMarker.addListener('click', function () {
        infoWindow.open(map, marker);
    });

    geocoder = new google.maps.Geocoder;
    placesService = new google.maps.places.PlacesService(map);
    var addressAutocomplete = new google.maps.places.Autocomplete(document.getElementById("address"));
    addressAutocomplete.bindTo('bounds', map);
    addressAutocomplete.addListener('place_changed');

    map.addListener('click', function (event) {
        showPlaces(event.latLng);
    });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            showPlaces(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function geocodePosition() {
    geocoder.geocode({'location': currentPositionMarker.getPosition()}, function (results, status) {
        if (status === 'OK') {
            if (results[1]) {
                infoWindow.setContent(results[1].formatted_address);
                infoWindow.open(map, currentPositionMarker);
                $("#address").val(results[1].formatted_address);
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

function showPlacesByAddress() {
    var address = $('#address').val();
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === 'OK') {
            var location = results[0].geometry.location;
            showPlaces(location);
        }
    });
}

function searchForPlaces(marker, map) {
    clearMarkers();
    var placesTypes = $("#places").val();
    var distance = $("#distanceRadius").val();
    for (var i = 0; i < placesTypes.length; i++) {
        var request = {
            location: marker.getPosition(),
            radius: distance * 1000,
            type: placesTypes[i]
        };
//        nearbySearch(request);
        radarSearch(request);
    }
}

function showPlaces(position) {
    currentPositionMarker.setPosition(position);
    searchForPlaces(currentPositionMarker, map);
    infoWindow.setPosition(currentPositionMarker.getPosition());
    infoWindow.setContent("Geocoding location...");
    map.setCenter(position);
    geocodePosition();
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

function nearbySearch(request) {
    placesService.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log("Nearby search found " + results.length);
            for (var i = 0; i < results.length; i++) {
                createMarker(map, results[i]);
            }
        }
    });
}

function radarSearch(request) {
    placesService.radarSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log("Radar search found " + results.length);
            for (var i = 0; i < results.length; i++) {
                createMarker(map, results[i]);
            }
        }
    });
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

function toggleControls() {
    $("#controls").toggle();
    $("#showControls").toggle();
}