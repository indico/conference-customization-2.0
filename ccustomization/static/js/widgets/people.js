function PeopleWidget(widgetElem) {
    Widget.call(this, widgetElem);
}
PeopleWidget.prototype = Object.create(Widget.prototype);
PeopleWidget.prototype.constructor = PeopleWidget;

function updateBackground(pictureElem, url) {
    pictureElem.css('background-image', 'url(' + url + ')');
}

function replaceMissingPicture(pictureElem, defaultPicURL) {
    $('<img>', {
        src: pictureElem.css('background-image').slice(4, -1),
        error: function() {
            updateBackground(pictureElem, defaultPicURL);
        }
    });
}

$.extend(PeopleWidget.prototype, {
    run: function run() {
        var self = this;
        var iconURL = self.widgetElem.data('icon-url');
        var pictures = self.widgetElem.find('.we-picture');
        var carousel = self.widgetElem.find('.we-people-carousel');

        pictures.each(function(){
            replaceMissingPicture($(this), iconURL);
        });

        if (carousel.length > 0) {
            var carouselOptions = carouselDefaultOptions;
            if (self.settings.style != undefined) {
                carouselOptions.autoplay = self.settings.style.autoplay || carouselOptions.autoplay;
                carouselOptions.slidesToShow = parseInt(self.settings.style.slidesToShow) || carouselOptions.slidesToShow;
                carouselOptions.slidesToScroll = parseInt(self.settings.style.slidesToScroll) || carouselOptions.slidesToScroll;
            }
            carousel.slick(carouselOptions);
        }
    },

    saveSettings: function saveSettings() {
        var self = this;
        var dialog = self.dialog;
        var radio = dialog.find('.we-radio');
        var carouselOptionsSection = dialog.find('.we-carousel-options-section');
        var autoplay = carouselOptionsSection.find('.we-carousel-autoplay');
        var slidesToShow = carouselOptionsSection.find('.we-carousel-slides-to-show');
        var slidesToScroll = carouselOptionsSection.find('.we-carousel-slides-to-scroll');
        var peopleListSection = dialog.find('.we-people-list-section');
        var peopleList = peopleListSection.find('.we-people-list-preview');
        self.settings.style = {
            type: radio.find('.active input').val(),
            autoplay: autoplay.prop('checked'),
            slidesToShow: slidesToShow.val(),
            slidesToScroll: slidesToScroll.val()
        };
        var people = [];
        peopleList.find('.we-person').each(function(){
            people.push($(this).data('settings'));
        });
        self.settings.content = {
            people: people
        };
        self.settings.empty = people.length == 0;
    },

    initializeDialog: function initializeDialog() {
        var self = this;
        var iconURL = self.widgetElem.data('icon-url');
        var dialog = self.dialog;
        var radio = dialog.find('.we-radio');
        var listOpt = radio.find('.we-list-opt');
        var carouselOpt = radio.find('.we-carousel-opt');
        var carouselOptionsSection = dialog.find('.we-carousel-options-section');
        var autoplay = carouselOptionsSection.find('.we-carousel-autoplay');
        var slidesToShow = carouselOptionsSection.find('.we-carousel-slides-to-show');
        var slidesToScroll = carouselOptionsSection.find('.we-carousel-slides-to-scroll');
        var fetch = dialog.find('.we-fetch-button');
        var typeahead = dialog.find('.typeahead');
        var add = dialog.find('.we-add-button');
        var addAllOpts = dialog.find('.we-add-all-button').find('li a');
        var peopleListSection = dialog.find('.we-people-list-section');
        var peopleList = peopleListSection.find('.we-people-list-preview');
        var addNewPersonButton = dialog.find('.we-add-new-person-button');

        var personTemplate = twig({
            id: "person-"+self.widgetElem.data('counter'),
            href: "/static/templates/person.html",
            async: false
        });
        var personRowTemplate = twig({
            id: "person-"+self.widgetElem.data('counter')+"-row",
            href: "/static/templates/person_row.html",
            async: false
        });

        var newPersonDialogHTML = twig({
            ref: "person-"+self.widgetElem.data('counter')
        }).render({
            person: null,
            dialogClass: "new-person-dialog",
            title: "Add new person",
            buttonLabel: "Add",
            uploadURL: $('.page-content-container').data('upload-url'),
            iconURL: iconURL
        });
        var newPersonDialog = $(newPersonDialogHTML).children('.modal');
        var newPersonPicture = newPersonDialog.find('.we-person-picture');
        var newPersonName = newPersonDialog.find('.we-person-name');
        var newPersonEmail = newPersonDialog.find('.we-person-email');
        var newPersonOrganisation = newPersonDialog.find('.we-person-organisation');

        function fetchPeople(query, type, success) {
            $.ajax({
                type: 'GET',
                url: $('.page-content-container').data('fetch-url'),
                dataType: 'json',
                data: {
                    data_type: type,
                    query: query
                },
                success: function(response) {
                    success(response);
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('AJAX request failed: ' + errorThrown);
                }
            });
        }

        function addPeople(query, type) {
            fetchPeople(query, type, function(response){
                var matchedPeople = response.data;
                matchedPeople.forEach(function(matchedPerson){
                    addPerson(matchedPerson);
                });
            });
        }

        function addPerson(person) {
            var selectedPeople = peopleList.find('.we-person');
            var found = false;
            if (person.id >= 0) {
                selectedPeople.each(function(){
                    var selectedPerson = $(this);
                    if (person.id == selectedPerson.data('settings').id) {
                        found = true;
                        return false;
                    }
                });
            }
            if (!found) {
                var containerHTML = getPersonRowHTML(person);
                var container = $(containerHTML);
                bindPerson(container, person);
                container.appendTo(peopleList);
                peopleListSection.removeClass('hidden');
            }
        }

        function getPersonRowHTML(person) {
            return twig({
                    ref: "person-"+self.widgetElem.data('counter')+"-row"
                }).render({
                    person: person,
                    dialogClass: "person-dialog",
                    title: "Customize person details",
                    buttonLabel: "OK",
                    uploadURL: $('.page-content-container').data('upload-url'),
                    iconURL: iconURL
                })
        }

        function showIconPreview(imagePreview) {
            imagePreview.find('span.glyphicon').addClass('hidden');
            updateBackground(imagePreview, iconURL);
        }

        function bindPerson(container, person) {
            var personDialog = container.find('.person-dialog');
            var personElem = container.find('.we-person');
            var imagePreviewRow = personElem.find('.we-picture');
            var personCustomizeButton = personElem.find('.we-customize-button');
            var removePersonButton = personElem.find('.we-remove-button');
            var personDisplayedName = personElem.find('.we-person-displayed-name');
            var personPictureURL = personDialog.find('.we-person-picture-url');
            var imagePreview = personDialog.find('.we-picture');

            personElem.data('settings', person);
            replaceMissingPicture(imagePreviewRow, iconURL);

            personCustomizeButton.on('click', function(){
                if (person.picture != null && person.picture.set == true) {
                    if (person.picture.type == 'url') {
                        personPictureURL.val(person.picture.path);
                    }
                } else {
                    showIconPreview(imagePreview);
                }
                personDialog.modal('show');
            });

            removePersonButton.on('click', function(){
                container.remove();
                var selectedPeople = peopleList.children('.we-person-container');
                if (selectedPeople.length == 0) {
                    peopleListSection.addClass('hidden');
                }
            });

            bindPersonDialog(personDialog, container);
        }

        function bindPersonDialog (personDialog, container) {
            var personElem = container == null ? null : container.find('.we-person');
            var personName = personDialog.find('.we-person-name');
            var personEmail = personDialog.find('.we-person-email');
            var personOrganisation = personDialog.find('.we-person-organisation');
            var personSaveButton = personDialog.find('.we-save-button');
            var personPictureURL = personDialog.find('.we-person-picture-url');
            var personPictureFile = personDialog.find('.we-person-picture-file');
            var personLoadPictureButton = personDialog.find('.we-load-picture-button');
            var personRemovePictureButton = personDialog.find('.we-remove-picture-button');
            var imagePreview = personDialog.find('.we-picture');
            var fileForm = personPictureFile.parent('form');
            var picURL = null;

            replaceMissingPicture(imagePreview, iconURL);

            imagePreview.on('mouseenter', function(){
                if (imagePreview.css('background-image').indexOf(iconURL) < 0) {
                    personRemovePictureButton.removeClass('hidden');
                }
            }).on('mouseleave', function(){
                personRemovePictureButton.addClass('hidden');
            });

            fileForm.submit(function() {
                fileForm.ajaxSubmit({
                    async: false,
                    success: function(response) {
                        picURL = response;
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('File loading failed: ' + errorThrown);
                        personPictureFile.val('');
                        picURL = null;
                    }
                });
                return false;
            });

            personDialog.detach().appendTo('body');
            personDialog.modal({
                show: false
            });

            personName.on('input', function(){
                if (personName.val() == '') {
                    personSaveButton.attr('disabled', true);
                } else {
                    personSaveButton.attr('disabled', false);
                }
            });

            personSaveButton.on('click', function(){
                var pathType = 'none';
                var path = 'none';
                var personID = personElem == null ? -1 : personElem.data('settings').id;
                if (!imagePreview.hasClass('hidden')) {
                    path = imagePreview.css('background-image').slice(4, -1);
                    pathType = personPictureURL.val() != '' ? 'url' : 'file';
                }
                var settings = {
                    id: personID,
                    name: personName.val(),
                    email: personEmail.val(),
                    organisation: personOrganisation.val(),
                    picture: {
                        set: pathType != 'none',
                        type: pathType,
                        path: path
                    }
                };
                if (personElem == null) {
                    addPerson(settings);
                } else {
                    var newContainerHTML = getPersonRowHTML(settings);
                    var newContainer = $(newContainerHTML);
                    container.replaceWith(newContainer);
                    bindPerson(newContainer, settings);
                }
            });

            personLoadPictureButton.on('click', function(){
                $('<img>', {
                    src: personPictureURL.val(),
                    error: function() {
                        alert('The specified URL is invalid!');
                        personPictureURL.val('');
                    },
                    load: function() {
                        updateBackground(imagePreview, personPictureURL.val());
                        personPictureFile.val('');
                    }
                });
            });

            personPictureFile.on('change', function(){
                var ok = personPictureFile[0].files[0].type.match('^image/.*');
                if (ok) {
                    fileForm.submit();
                    if (picURL != null) {
                        updateBackground(imagePreview, picURL);
                    }
                } else {
                    alert('The specified file is invalid!');
                    personPictureFile.val('');
                }
                personPictureURL.val('');
            });

            personRemovePictureButton.on('click', function(){
                showIconPreview(imagePreview);
                personPictureFile.val('');
                personPictureURL.val('');
            });
        }

        listOpt.on('click', function(){
            carouselOptionsSection.addClass('hidden');
        });

        carouselOpt.on('click', function(){
            carouselOptionsSection.removeClass('hidden');
        });

        $('body').on('refreshFinished', function(){
            var carousels = $('.we-people-carousel');
            carousels.each(function(){
                var carousel = $(this);
                var peopleWidget = carousel.parents('.people-widget');
                var carouselSettings = self.settings;
                var carouselOptions = carouselDefaultOptions;
                if (carouselSettings.style != undefined) {
                    carouselOptions.autoplay = carouselSettings.style.autoplay || carouselOptions.autoplay;
                    carouselOptions.slidesToShow = parseInt(carouselSettings.style.slidesToShow) || carouselOptions.slidesToShow;
                    carouselOptions.slidesToScroll = parseInt(carouselSettings.style.slidesToScroll) || carouselOptions.slidesToScroll;
                }
                carousel.unslick().slick(carouselOptions);
            });
        });

        if (self.settings.style != undefined) {
            if (self.settings.style.type == 'carousel' || self.settings.style.type == undefined) {
                carouselOpt.trigger('click');
            } else {
                listOpt.trigger('click');
            }
            autoplay.prop('checked', self.settings.style.autoplay || carouselDefaultOptions.autoplay);
            slidesToShow.val(self.settings.style.slidesToShow || carouselDefaultOptions.slidesToShow);
            slidesToScroll.val(self.settings.style.slidesToScroll || carouselDefaultOptions.slidesToScroll);
        } else {
            carouselOpt.trigger('click');
            autoplay.prop('checked', carouselDefaultOptions.autoplay);
            slidesToShow.val(carouselDefaultOptions.slidesToShow);
            slidesToScroll.val(carouselDefaultOptions.slidesToScroll);
        }
        if (self.settings.content != undefined) {
            if (!self.settings.empty) {
                self.settings.content.people.forEach(function(person){
                    addPerson(person);
                });
            }
        }

        bindPersonDialog(newPersonDialog, null);

        typeahead.typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            displayKey: 'name',
            source: function (query, process) {
                fetchPeople(query, 'all', function(response){
                    process(response.data);
                });
            }
        });

        add.on('click', function(){
            var query = typeahead.val();
            if (query != '') {
                addPeople(query, 'all');
            }
        });

        addAllOpts.on('click', function(e){
            e.preventDefault();
            addPeople('', $(this).text().toLowerCase());
        });

        clickOnEnter(typeahead, add, true);

        addNewPersonButton.on('click', function(){
            newPersonPicture.val('');
            newPersonName.val('').trigger('input');
            newPersonEmail.val('');
            newPersonOrganisation.val('');
            newPersonDialog.modal('show');
        });
    }
});
