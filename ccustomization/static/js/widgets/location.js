function LocationWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(LocationWidget.prototype, {
    run: function run() {
        var self = this;
        var mapCanvas = self.widgetElem.find('.we-map-canvas');
        var address = self.settings.content.address;
        var latitude = self.settings.content.latitude;
        var longitude = self.settings.content.longitude;
        var zoom = self.settings.style.zoom;

        function drawMap(mapCanvas, coords, zoomLvl, address) {
            var options = {
                zoom: parseInt(zoomLvl || 9),
                center: coords,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(mapCanvas.get(0), options);
            var marker = new google.maps.Marker({
                position: coords,
                map: map,
                title: address
            });
            $('body').on('sortstop', function(){
                google.maps.event.trigger(map, 'resize');
                map.setCenter(coords);
            });
        }

        drawMap(mapCanvas, new google.maps.LatLng(latitude, longitude), zoom, address);
    },

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.widgetElem.find('.widget-dialog');
        var save = dialog.find('.we-save-button');
        var geocode = dialog.find('.we-geocode-button');
        var address = dialog.find('.we-address');
        var latitude = dialog.find('.we-latitude');
        var longitude = dialog.find('.we-longitude');
        var coordinates = latitude.add(longitude);
        var previewSection = dialog.find('.we-preview-section');
        var previewCanvas = previewSection.find('.we-preview-canvas');
        var zoom = previewSection.find('.we-zoom');

        function geoCode(address) {
            var geocoder = new google.maps.Geocoder();
            var coordinatesResp = $.Deferred();
            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    coordinatesResp.resolve(results[0].geometry.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                    coordinatesResp.resolve(null);
                }
            });
            return coordinatesResp.promise();
        }

        function drawPreview(previewCanvas, coords, zoomLvl) {
            var options = {
                zoom: parseInt(zoomLvl || 9),
                center: coords,
                mapTypeControl: false,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(previewCanvas.get(0), options);
            var marker = new google.maps.Marker({
                position: coords,
                map: map
            });
            google.maps.event.addListener(map, 'click', function(e) {
                var newCoords = e.latLng;
                latitude.val(newCoords.lat());
                longitude.val(newCoords.lng());
                drawPreview(previewCanvas, newCoords, map.getZoom());
            });
            google.maps.event.addListener(map, 'zoom_changed', function(e) {
                zoom.val(map.getZoom());
            });
        }

        dialog.detach().appendTo('body');

        save.on('click', function(){
            self.settings.content = {
                address: address.val(),
                latitude: latitude.val(),
                longitude: longitude.val()
            };
            self.settings.style = {
                zoom: zoom.val()
            };
            self.settings.empty = false;
            updateWidget(self.widgetElem, self.settings);
        });

        dialog.on('hidden.bs.modal', function() {
            dialog.modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

        dialog.on('shown.bs.modal', function() {
            coordinates.add(address).trigger('input');
        });

        dialog.modal({
            show: false
        });

        self.widgetElem.on('click', function(){
            if (self.settings.content != undefined) {
                address.val(self.settings.content.address || '');
                latitude.val(self.settings.content.latitude || '');
                longitude.val(self.settings.content.longitude || '');
            } else {
                address.val('');
                latitude.val('');
                longitude.val('');
            }
            if (self.settings.style != undefined) {
                zoom.val(self.settings.style.zoom || '');
            } else {
                zoom.val('');
            }
            dialog.modal('show');
        });

        coordinates.on('input', function(){
            if (latitude.val() == '' || longitude.val() == '') {
                save.prop('disabled', true);
                previewSection.addClass('hidden');
            } else {
                save.prop('disabled', false);
                previewSection.removeClass('hidden');
                drawPreview(previewCanvas, new google.maps.LatLng(latitude.val(), longitude.val()), zoom.val());
            }
        });

        address.on('input', function(){
            if (address.val() == '') {
                geocode.prop('disabled', true);
            } else {
                geocode.prop('disabled', false);
            }
        });

        geocode.on('click', function(){
            geoCode(address.val()).done(function(coordinatesResp){
                if (coordinatesResp != null) {
                    latitude.val(coordinatesResp.lat());
                    longitude.val(coordinatesResp.lng());
                    coordinates.trigger('input');
                }
            });
        });
    }
});
