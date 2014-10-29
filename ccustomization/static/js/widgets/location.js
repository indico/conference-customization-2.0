function LocationWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
    this.dialog = widgetElem.find('.widget-dialog');
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
            $('body').on('refreshFinished', function(){
                google.maps.event.trigger(map, 'resize');
                map.setCenter(coords);
            });
        }

        drawMap(mapCanvas, new google.maps.LatLng(latitude, longitude), zoom, address);
    },

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.dialog;
        var save = dialog.find('.we-save-button');
        var search = dialog.find('.we-search-button');
        var address = dialog.find('.we-address');
        var previewSection = dialog.find('.we-preview-section');
        var previewCanvas = previewSection.find('.we-preview-canvas');
        var latitude = previewSection.find('.we-latitude');
        var longitude = previewSection.find('.we-longitude');
        var coordinates = latitude.add(longitude);
        var zoom = previewSection.find('.we-zoom');
        var defaultZoom = 9;
        var title = dialog.find('.we-widget-title');
        var border = dialog.find('.we-widget-border');

        function geoCode(address) {
            var geocoder = new google.maps.Geocoder();
            var coordinatesResp = $.Deferred();
            geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    coordinatesResp.resolve(results[0].geometry.location);
                } else {
                    alert('Address search was not successful for the following reason: ' + status);
                    coordinatesResp.resolve(null);
                }
            });
            return coordinatesResp.promise();
        }

        function drawPreview(previewCanvas, coords, zoomLvl) {
            var options = {
                zoom: parseInt(zoomLvl || defaultZoom),
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
                latitude.text(newCoords.lat());
                longitude.text(newCoords.lng());
                drawPreview(previewCanvas, newCoords, map.getZoom());
            });
            google.maps.event.addListener(map, 'zoom_changed', function(e) {
                zoom.text(map.getZoom());
            });
        }

        title.val(self.settings.title || '');
        border.prop('checked', self.settings.border || false);
        if (self.settings.content != undefined) {
            address.val(self.settings.content.address || '');
            latitude.text(self.settings.content.latitude || '');
            longitude.text(self.settings.content.longitude || '');
        } else {
            address.val('');
            latitude.text('');
            longitude.text('');
        }
        if (self.settings.style != undefined) {
            zoom.text(self.settings.style.zoom || defaultZoom);
        } else {
            zoom.text(defaultZoom);
        }

        save.on('click', function(){
            self.settings.title = title.val();
            self.settings.border = border.is(':checked');
            self.settings.content = {
                address: address.val(),
                latitude: latitude.text(),
                longitude: longitude.text()
            };
            self.settings.style = {
                zoom: zoom.text()
            };
            self.settings.empty = (self.settings.content.latitude == '' || self.settings.content.longitude == '');
            updateWidget(self.widgetElem, self.settings);
        });

        dialog.on('shown.bs.modal', function() {
            coordinates.add(address).trigger('input');
        });

        coordinates.on('input', function(){
            if (latitude.text() == '' || longitude.text() == '') {
                previewSection.addClass('hidden');
            } else {
                previewSection.removeClass('hidden');
                drawPreview(previewCanvas, new google.maps.LatLng(latitude.text(), longitude.text()), zoom.text());
            }
        });

        address.on('input', function(){
            if (address.val() == '') {
                search.prop('disabled', true);
            } else {
                search.prop('disabled', false);
            }
        });

        search.on('click', function(){
            geoCode(address.val()).done(function(coordinatesResp){
                if (coordinatesResp != null) {
                    latitude.text(coordinatesResp.lat());
                    longitude.text(coordinatesResp.lng());
                    coordinates.trigger('input');
                }
            });
        });

        clickOnEnter(address, search, false);
    }
});
