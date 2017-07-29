var placesViews = placesViews || {};

placesViews.MapView = function(googleMap, placesSearchService, infoWindowParam) {
  var map = googleMap,
  placesSearch = placesSearchService,
  infoWindow = infoWindowParam;

  var markers = [],
    currentPlaceLocation;

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    markers=[];
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
    markers.push(marker);
  }

  return {
    clear: clearMarkers,
    onFoundPlace: createMarker,

    getSelectedPlace: function() {
      return currentPlaceLocation;
    },

    selectItem: function(index) {
      var marker = markers[index];
      currentPlaceLocation = marker.position;
      new google.maps.event.trigger(marker, 'click' );
      }
    }
};

placesViews.ListView = function(selector) {

  var placesList = $(selector);

  function onFoundPlace(place, placeIndex) {
    var htmlTemplate = '<div class="col-sm-12 col-md-12"><div class="thumbnail">';
    if (place.photos) {
      htmlTemplate += '<img src="'+ place.photos[0].getUrl({maxHeight: 320, maxWidth: 320}) + '" />';
    }

    htmlTemplate += '<div class="caption"><h3>' + place.name;
    if (place.opening_hours){
      htmlTemplate += " (" + (place.opening_hours.open_now ? "Open" : "Closed") +")";
    }

    htmlTemplate += '</h3><p>' + place.vicinity + '</p><p>' +
      '<a href="#" class="btn btn-primary show-on-map" role="button" data-marker-index="' + placeIndex + '">Show on map</a>' +
      '<a href="#" class="btn btn-default show-directions" role="button" data-marker-index="' + placeIndex + '">Show directions</a>' +
      '</p></div></div></div>';

    placesList.append(htmlTemplate);
}

  return {
    clear: function() {
      if (placesList) {
        placesList.empty();
      }
    },

    onFoundPlace: onFoundPlace
  }
};
