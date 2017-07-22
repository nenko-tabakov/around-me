var placesRendererService = placesRendererService || {};

placesRendererService.Renderer = function(mapParam, placesSearchParam, geocoderParam, infoWindowParam, placesCtl, distanceCtl, addressCtl) {
  var currentPositionAddress;
  var map = mapParam,
    infoWindow = infoWindowParam;

  var placesSearch = placesSearchParam,
    geocoder = geocoderParam,
    directionsService = directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);
  var placesCtlId = placesCtl,
    distanceCtlId = distanceCtl,
    addressCtlId = addressCtl;
  var foundPlaces = [];

  var currentPositionMarker = new google.maps.Marker({
    position: map.center,
    map: map
  });

  currentPositionMarker.addListener('click', function () {
    infoWindow.setContent(currentPositionAddress);
    infoWindow.open(map, currentPositionMarker);
  });

  google.maps.event.addListener(infoWindow, 'domready', function() {
    document.getElementById("directionsToPlace").addEventListener("click", function(e) {
      directionsToPlace();
    })
  });

  function searchPlaces(search, callbacks, placesTypes, distance) {
    var placesTypes = $(placesCtlId).val();
    var distance = $(distanceCtlId).val();

    if (placesTypes) {
      clearMarkers();

      for (var i = 0; i < placesTypes.length; i++) {
        var request = {
          location: currentPositionMarker.position,
          address: currentPositionAddress,
          radius: distance * 1000,
          type: placesTypes[i]
        }
        search(request, callbacks);
      }
    }
  }

  function clearMarkers() {
    for (var i = 0; i < foundPlaces.length; i++) {
      foundPlaces[i].setMap(null);
    }
    foundPlaces=[];
  }

  function createMarker(place) {

    var marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      animation: google.maps.Animation.DROP,
      icon: place.icon
    });

    marker.addListener('click', function() {
      placesSearch.getDetails(place.place_id, function(detailedInformation) {
        function createInfoContent() {
          var content = detailedInformation.name;
          if (detailedInformation.opening_hours) {
            content += " - (" + (detailedInformation.opening_hours.open_now ? "Open" : "Closed") + ")";
          }

          content += "<br>" + detailedInformation.formatted_address + "<br><br><button id='directionsToPlace'>Directions to this place</button>";
          return content;
        }

        currentPlaceLocation = detailedInformation.geometry.location;
        infoWindow.setContent(createInfoContent());
        infoWindow.open(map, marker);
      });
    });
    foundPlaces.push(marker);
  }

  function createMarkers(places) {
    for (var i = 0; i < places.length; i++) {
      createMarker(places[i]);
    }
  }

  function directionsToPlace() {
    directionsService.route({
      origin: currentPositionMarker.position,
      destination: currentPlaceLocation,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      }
    });
  }

  return {
    showPlacesByLocation : function(location) {
      var callbacks = {
        onFoundPlaces: function(places, location) {
          createMarkers(places);
        }
      }

      currentPositionMarker.setPosition(location);
      map.setCenter(location);
      searchPlaces(placesSearch.byLocation, callbacks);
      geocoder.geocode({'location': currentPositionMarker.getPosition()}, function (results, status) {
        if (status === 'OK') {
          if (results[0]) {
            currentPositionAddress = results[0].formatted_address;
            $(addressCtlId).val(results[0].formatted_address);
          }
        }
      });
    },

    showPlacesByAddress : function() {
      var callbacks = {
        onGeocoded: function (location) {
          currentPositionMarker.setPosition(location);
          map.setCenter(location);
        },

        onFoundPlaces: function(places, location) {
          createMarkers(places);
        }
      }

      currentPositionAddress = $(addressCtlId).val();
      searchPlaces(placesSearch.byAddress, callbacks);
    }
  }
}
