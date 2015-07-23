
$(document).ready(function () {

    var groupId = localStorage["groupId"];
    $('#groupId').change(function () {
        groupId = $(this).val();
        localStorage["groupId"] = groupId;
    });

    var appId = localStorage["appId"];

    $('#appId').change(function () {

        appId = $(this).val();
        localStorage["appId"] = appId;
    });

    $('#appId').val(localStorage["appId"]);
    $('#groupId').val(localStorage["groupId"]);
});
