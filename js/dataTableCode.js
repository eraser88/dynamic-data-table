jQuery.support.cors = true;
var globalTableId = "";
function renderTable(tableid, url) {
    globalTableId = tableid;
    menuData = [];
    var jsonDataForGrid = setColumnAndHtmlData(url, globalTableId);
//    setPaginationOptions(paginationOptions);
    if (jsonDataForGrid.totalRecords == "") {
        return;
    }
    else {
        menuData = getMenuData(jsonDataForGrid.totalRecords);
    }
    $(document).ready(function () {
        var aoColumns = jsonDataForGrid["columnData"];
        aoColumns[0]['bSortable'] = false;
        aoColumns[0]['fnRender'] =  function (o, v) {
            return '<input type="checkbox" name="rowCheckBox"/>';
        };

        $('#dataTable').dataTable({
            "aoColumns": aoColumns,
            "bFilter": true,
            "bProcessing": true,
            "bPaginate": true,
            "sPaginationType": "bootstrap",
            "oLanguage": {
            	"sSearch": "Search all columns:",
                "sProcessing": "<img src='images/loader-big-black.gif' width ='30' height = '30'/>"
            },
            "bDestroy": true,
            "sAjaxSource": jsonDataForGrid["defaultUrl"],
            "sAjaxDataProp": "responseObject",
            "fnServerData": function (sSource, aoData, fnCallback) {
                setLogging(sSource);
                $.getJSON(sSource, aoData, function (json) {
                    var responseObjects = json['responseObject'];
                    $.each(responseObjects, function(index, value) {
                        json['responseObject'][index]['checkbox'] = "";
                    });
                    fnCallback(json);
                });
            }
        }).columnFilter(columnFilters);
    });
}


var initSelectCheckBoxes = function() {
    $(document).on('change', "thead input[type='checkbox']", function () {
        var checked = $(this).prop("checked");
        $("#dataTable tbody input[type='checkbox']").prop("checked", checked);
        $("#dataTable tbody td").toggleClass('checked_cell');
    });

    $(document).on('change', "tbody input[type='checkbox']" , function () {
        var checked = $(this).prop("checked");
        $(this).parent('td').toggleClass('checked_cell');
        $(this).parent('td').siblings().toggleClass('checked_cell')
    });
};

$(document).ready(function () {
    $('#logging-area').hide();
    $('#show_logs').click(function () {
        $('#logging-area').toggle();
    });
    $('#submit').click(function () {
        renderTable(globalTableId, $('#url').val());
    });

    $('#reset-button').click(function () {
        $('#logging-area').hide();
        $('#url').val('');
        $('#logging-area').val('');
        renderTable(globalTableId, '');
    });

    initSelectCheckBoxes();
});