var placesRendererService = placesRendererService || {};

placesRendererService.Renderer = function(mapParam, geocoderParam, infoWindowParam, placesCtl, distanceCtl, addressCtl) {

  var currentPositionAddress;
  var map = mapParam,
    infoWindow = infoWindowParam;

    var geocoder = geocoderParam,
      placesSearch = new placesServices.Search(new google.maps.places.PlacesService(map), geocoder),
      directionsService = new google.maps.DirectionsService(),
      directionsDisplay = new google.maps.DirectionsRenderer();

    directionsDisplay.setMap(map);

    var placesCtlId = placesCtl,
      distanceCtlId = distanceCtl,
      addressCtlId = addressCtl;

    var mapView = new placesViews.MapView(map, placesSearch, infoWindow),
      listView = new placesViews.ListView("#places-list");

    var currentPositionMarker = new google.maps.Marker({
      position: map.center,
      map: map
    });

    currentPositionMarker.addListener('click', function () {
      infoWindow.setContent(currentPositionAddress);
      infoWindow.open(map, currentPositionMarker);
    });

    google.maps.event.addListener(infoWindow, 'domready', function() {
      var directionsToPlaceElement = document.getElementById("directionsToPlace");
      if (directionsToPlaceElement) {
        directionsToPlaceElement.addEventListener("click", function(e) {
          directionsToPlace();
        });
      }
    });

    $(document).on('click', '#places-list .show-on-map', function(e) {
      var placeIndex = e.currentTarget.getAttribute("data-marker-index");
      mapView.selectItem(placeIndex);
      listView.selectItem(placeIndex);
    });

    $(document).on('click', '#places-list .show-directions', function(e) {
      var placeIndex = e.currentTarget.getAttribute("data-marker-index");
      mapView.selectItem(placeIndex);
      directionsToPlace();
    });

    function searchPlaces(search, callbacks, placesTypes, distance) {
      var placesTypes = $(placesCtlId).val();
      var distance = $(distanceCtlId).val();
      if (placesTypes) {
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

    function showPlaces(places) {
      mapView.clear();
      listView.clear();

      var listContent = "";
      for (var i = 0; i < places.length; i++) {
        var place = places[i];
        mapView.onFoundPlace(place, i);
        listView.onFoundPlace(place, i);
      }
    }

    function directionsToPlace() {
      directionsService.route({
        origin: currentPositionMarker.position,
        destination: mapView.getSelectedPlace(),
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
            showPlaces(places);
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
            showPlaces(places);
          }
        }

        currentPositionAddress = $(addressCtlId).val();
        searchPlaces(placesSearch.byAddress, callbacks);
      }
    }
}
