var resultArea;

function initButtons() {
    $('.try-button').each(function getData() {
        $(this).on('click', function getApiResponse() {
            var url = $('#search-field').val();
            resultArea = $('#results-holder');
            resultArea.empty();
            $.ajax({
                url: encodeURI(url.trim()),
            }).done(parseData).fail(function onFailure(response) {
                console.log("Fetch failed, check your link.");
            });
        });
    });
}

function subjectSearch(e)
{
    e.preventDefault();
    var url = $(this).attr('href');
    resultArea = $('#results-holder');
    resultArea.empty();
    $('.url-holder').val(url);
    console.log($(this).attr('href'));
    $.ajax({
        url: encodeURI(url.trim()),
    }).done(parseData).fail(function onFailure(response) {
        console.log("Fetch failed, check your link.");
    });
}

function parseData(response) {
    if (response.status === 'OK' && typeof response.records !== 'undefined') {
        response.records.forEach(function createRecordElement(record) {
            console.log(record);
            var modalCopy = $('#modal-original').clone();
            modalCopy.attr('id', '');
            resultArea.append(modalCopy);
            if (typeof record.title !== 'undefined') {
                var currentTitle = $('<a/>');
                currentTitle.html(record.title);
                currentTitle.attr('href', "https://api.finna.fi/api/v1/record?id=" + record.id + "&prettyPrint=false&lng=fi");
                currentTitle.on('click', function openRecord(e) {
                    e.preventDefault();
                    var url = $(this).attr('href');
                    resultArea = $('#record-holder');
                    resultArea.empty();
                    $.ajax({
                        url: encodeURI(url.trim()),
                    }).done(parseData).fail(function onFailure(response) {
                        console.log("Fetch failed, check your link.");
                    });
                });
                modalCopy.find('.modal-title').append(currentTitle);
            }

            if (typeof record.buildings !== 'undefined' && record.buildings.length > 0) {
                var buildingsArea = modalCopy.find('.modal-buildings');
                var buildingsList = buildingsArea.find('.buildings-list');
                record.buildings.forEach(function parseBuildings(building) {
                    var currentBuilding = $('<li/>');
                    var url = "https://api.finna.fi/v1/search?limit=20&filter[]=~sector_str_mv:\"0/mus/\"&filter[]=~usage_rights_str_mv:\"usage_D\"&filter[]=~building%3A\"" + building.value + "\"&lookfor=\"\"";
                    var link = $('<a href="' + url + '">' + building.translated + '</a>');
                    link.attr('href', url);
                    link.on('click', subjectSearch);
                    currentBuilding.append(link);
                    buildingsList.append(currentBuilding);
                });
                buildingsArea.show();
            }

            if (typeof record.images !== 'undefined' && record.images.length > 0) {
                var imgUrl = 'https://finna.fi' + record.images[0];
                modalCopy.find('.modal-link').attr('href', imgUrl);
                modalCopy.find('.modal-image').attr('src', imgUrl);
            }

            if (typeof record.nonPresenterAuthors !== 'undefined' && record.nonPresenterAuthors.length > 0) {
                var area = modalCopy.find('.modal-authors');
                var authorsList = area.find('.authors-list');
                record.nonPresenterAuthors.forEach(function parseAuthors(author) {
                    var currentAuthor = $('<li/>');
                    var url = "https://api.finna.fi/v1/search?limit=20&filter[]=~sector_str_mv:\"0/mus/\"&filter[]=~usage_rights_str_mv:\"usage_D\"&type=author&lookfor=\"" + author.name + "\"";
                    var link = $('<a href="' + url + '">' + author.name + '</a>');
                    link.attr('href', url);
                    link.on('click', subjectSearch);
                    currentAuthor.append(link);
                    if (typeof author.role !== 'undefined') {
                        currentAuthor.append('<small class="modal-author-role">' + author.role + '</small>');
                    }
                    authorsList.append(currentAuthor);
                });
                area.show();
            }

            if (typeof record.imageRights !== 'undefined') {
                var imageRights = record.imageRights;
                var currentRights = $('<div/>');
                var link = $('<a/>');
                link.html('<small>' + imageRights.copyright + '</small>');
                link.attr('href', imageRights.link);
                link.attr('target', '_blank');
                currentRights.append(link);
                var rightsArea = modalCopy.find('.modal-rights');
                rightsArea.append(currentRights);
            }

            if (typeof record.subjects !== 'undefined' && record.subjects.length > 0) {
                var subjectsArea = modalCopy.find('.modal-subjects');
                record.subjects.forEach(function parseSubjects(subject) {
                    subject.forEach(function getSubject(value) {
                        var subjectQuery = "https://api.finna.fi/v1/search?limit=20&filter[]=~sector_str_mv:\"0/mus/\"&filter[]=~usage_rights_str_mv:\"usage_D\"&type=subject&lookfor=\"" + subject + "\"";
                        var currentSubject = $('<a class="modal-subject-small subject-search"/>');
                        currentSubject.attr('href', subjectQuery);
                        currentSubject.on('click', subjectSearch);
                        currentSubject.html(value);
                        subjectsArea.append(currentSubject);
                    });
                });
                subjectsArea.show();
            }
        });
    }
}