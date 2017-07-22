var placesServices = placesServices || {};

placesServices.Search = function(googlePlaces, googleGeocoder) {
  var placesService = googlePlaces;
  var geocodingService = googleGeocoder;

  function search(request, onSuccess) {
    placesService.nearbySearch(request, function (results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        onSuccess.onFoundPlaces(results, request.location);
      }
    });
  }

  return {
    byAddress : function(request, onSuccess) {
      geocodingService.geocode({'address': request.address}, function (results, status) {
        if (status === 'OK') {
          var location = results[0].geometry.location;
          onSuccess.onGeocoded(location);
          request.location = location;
          search(request, onSuccess);
        }
      });
    },
    byLocation : function(request, onSuccess) {
      search(request, onSuccess);
    },
    getDetails : function(placeId, onSuccess) {
      placesService.getDetails({placeId: placeId}, function (detailedInformation, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          onSuccess(detailedInformation);
        }
      });
    }
  }
}
