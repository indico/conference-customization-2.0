function PeopleWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
}

$.extend(PeopleWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.widgetElem.find('.widget-dialog');
        var save = dialog.find('.we-save-button');
        var radio = dialog.find('.we-radio');
        var listOpt = radio.find('.we-list-opt');
        var carouselOpt = radio.find('.we-carousel-opt');
        var fetch = dialog.find('.we-fetch-button');
        var typeahead = dialog.find('.typeahead');
        var add = dialog.find('.we-add-button');
        var addAllOpts = dialog.find('.we-add-all-button').find('li a');
        var peopleListSection = dialog.find('.we-people-list-section');
        var peopleList = peopleListSection.find('.we-people-list');
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
            dialogClass: "new-person-dialog",
            title: "Add new person",
            buttonLabel: "Add",
            uploadURL: $('#main-container').data('upload-url')
        });
        var newPersonDialog = $(newPersonDialogHTML).children('.modal');
        var newPersonPicture = newPersonDialog.find('.we-person-picture');
        var newPersonName = newPersonDialog.find('.we-person-name');
        var newPersonEmail = newPersonDialog.find('.we-person-email');
        var newPersonOrganisation = newPersonDialog.find('.we-person-organisation');
        var addNewPersonButtonFinish = newPersonDialog.find('.we-save-button');

        function fetchPeople(query, type, success) {
            $.ajax({
                type: 'GET',
                url: $('.main-container').data('fetch-url'),
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
                    buttonLabel: "Save",
                    uploadURL: $('#main-container').data('upload-url')
                })
        }

        function showIconPreview(iconPreview, imagePreview) {
            imagePreview.addClass('hidden');
            iconPreview.removeClass('hidden');
        }

        function showImagePreview(iconPreview, imagePreview) {
            imagePreview.removeClass('hidden');
            iconPreview.addClass('hidden');
        }

        function updateBackground(imagePreview, url) {
            imagePreview.css('background-image', 'url(' + url + ')');
        }

        function bindPerson(container, person) {
            var personDialog = container.find('.person-dialog');
            var personElem = container.find('.we-person');
            var personCustomizeButton = personElem.find('.we-customize-button');
            var removePersonButton = personElem.find('.we-remove-button');
            var personName = personDialog.find('.we-person-name');
            var personEmail = personDialog.find('.we-person-email');
            var personOrganisation = personDialog.find('.we-person-organisation');
            var personSaveButton = personDialog.find('.we-save-button');
            var personDisplayedName = personElem.find('.we-person-displayed-name');
            var personPictureURL = personDialog.find('.we-person-picture-url');
            var personPictureFile = personDialog.find('.we-person-picture-file');
            var personLoadPictureButton = personDialog.find('.we-load-picture-button');
            var personRemovePictureButton = personDialog.find('.we-remove-picture-button');
            var personPicturePreview = personDialog.find('.we-picture-preview');
            var iconPreview = personPicturePreview.find('span');
            var imagePreview = personPicturePreview.find('div');
            var fileForm = personPictureFile.parent('form');
            var picURL = null;

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
            personElem.data('settings', person);
            personCustomizeButton.on('click', function(){
                if (person.picture != null && person.picture.set == true) {
                    showImagePreview(iconPreview, imagePreview);
                    updateBackground(imagePreview, person.picture.path);
                    if (person.picture.type == 'url') {
                        personPictureURL.val(person.picture.path);
                    }
                } else {
                    showIconPreview(iconPreview, imagePreview);
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
            personSaveButton.on('click', function(){
                var pathType = 'none';
                var path = 'none';
                if (!imagePreview.hasClass('hidden')) {
                    path = imagePreview.css('background-image').slice(4, -1);
                    pathType = personPictureURL.val() != '' ? 'url' : 'file';
                }
                var settings = {
                    id: personElem.data('settings').id,
                    name: personName.val(),
                    email: personEmail.val(),
                    organisation: personOrganisation.val(),
                    picture: {
                        set: pathType != 'none',
                        type: pathType,
                        path: path
                    }
                };
                var newContainerHTML = getPersonRowHTML(settings);
                var newContainer = $(newContainerHTML);
                container.replaceWith(newContainer);
                bindPerson(newContainer, settings);
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
                        showImagePreview(iconPreview, imagePreview);
                        personPictureFile.val('');
                    }
                });
            });
            personPictureFile.on('change', function(){
                var ok = personPictureFile[0].files[0].type.match('^image/.*');
                if (ok) {
                    fileForm.submit();
                    if (picURL != null) {
                        showImagePreview(iconPreview, imagePreview);
                        updateBackground(imagePreview, picURL);
                    }
                } else {
                    alert('The specified file is invalid!');
                    personPictureFile.val('');
                }
                personPictureURL.val('');
            });
            personRemovePictureButton.on('click', function(){
                showIconPreview(iconPreview, imagePreview);
                personPictureFile.val('');
                personPictureURL.val('');
            });
        }

        dialog.detach().appendTo('body');
        newPersonDialog.appendTo('body');

        save.on('click', function(){
            self.settings.style = {
                type: radio.find('.active input').val()
            };
            var people = [];
            peopleList.find('.we-person').each(function(){
                people.push($(this).data('settings'));
            });
            self.settings.content = {
                people: people
            };
            self.settings.empty = people.length == 0;
            updateWidget(self.widgetElem, self.settings);
        });

        dialog.modal({
            show: false
        });
        newPersonDialog.modal({
            show: false
        });

        self.widgetElem.on('click', function(){
            if (self.settings.style != undefined) {
                if (self.settings.style.type == 'list' || self.settings.style.type == undefined) {
                    listOpt.trigger('click');
                } else {
                    carouselOpt.trigger('click');
                }
            }
            if (self.settings.content != undefined) {
                if (!self.settings.empty) {
                    self.settings.content.people.forEach(function(person){
                        addPerson(person);
                    });
                }
            }
            dialog.modal('show');
        });

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

        newPersonName.on('input', function(){
            if (newPersonName.val() == '') {
                addNewPersonButtonFinish.attr('disabled', true);
            } else {
                addNewPersonButtonFinish.attr('disabled', false);
            }
        });

        addNewPersonButtonFinish.on('click', function(){
            var person = {
                id: -1,
                picture: newPersonPicture.val(),
                name: newPersonName.val(),
                email: newPersonEmail.val(),
                organisation: newPersonOrganisation.val()
            };
            addPerson(person);
        });
    }
});
