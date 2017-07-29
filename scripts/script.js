var placesRenderer;

var PLACE_TYPES = (function(){

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
}());

function initMap() {

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    }

    var defaultPosition = {lat: -34.397, lng: 150.644};
    var map = new google.maps.Map(document.getElementById('map'), {
      center: defaultPosition,
      zoom: 12
    });

    var addressAutocomplete = new google.maps.places.Autocomplete(document.getElementById("address"));
    addressAutocomplete.bindTo('bounds', map);
    addressAutocomplete.addListener('place_changed', function(){
      placesRenderer.showPlacesByAddress();
    });

    var infoWindow = new google.maps.InfoWindow({map: map});
    var geocoder = new google.maps.Geocoder;
    placesRenderer = new placesRendererService.Renderer(map, geocoder, infoWindow, "#places", "#distanceRadius", "#address");

    map.addListener('click', function (event) {
      placesRenderer.showPlacesByLocation(event.latLng);
    });

    // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      placesRenderer.showPlacesByLocation(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

$(document).ready(function() {
  var placesOptions = "";
  for (var i = 0; i < PLACE_TYPES.length; i++) {
    placesOptions += '<option value="' + PLACE_TYPES[i].id + '">' + PLACE_TYPES[i].displayName + '</option>';
  }
  $("#places").append(placesOptions);

  $(".chosen-select").chosen();

  $("#showPlaces").click(function () {
    placesRenderer.showPlacesByAddress();
  });
});
