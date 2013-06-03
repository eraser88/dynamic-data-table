jQuery.support.cors = true;
var globalTableId = "";
function renderTable(tableid, url) {
    globalTableId = tableid;
    menuData = [];
    var jsonDataForGrid = setColumnAndHtmlData(url, globalTableId);
    setPaginationOptions(paginationOptions);
    if (jsonDataForGrid.totalRecords == "") {
        return;
    }
    else {
        menuData = getMenuData(jsonDataForGrid.totalRecords);
    }
    $(document).ready(function () {
        $('#dataTable').dataTable({
          //  "sDom": '<"H"lR>rt<"F"ip>',
            "aoColumns": jsonDataForGrid["columnData"],
            "fnDrawCallback": function (oSettings) {
                $("#dataTable_filter").hide();
                $("thead input[type='checkbox']").click(function () {
                    var checkbox = $("#dataTable").find("tbody").find("input[type='checkbox']");
                    if (checkbox.prop("checked") == false) {
                        checkbox.prop('checked', true);
                        $("#dataTable").find("tbody").find("tr").css('background-color', '#ffed9f');
                    } else {
                        checkbox.prop('checked', false);
                        $("#dataTable").find("tbody").find("tr").css('background-color', 'white');
                    }
                });
                $("tbody input[type='checkbox']").click(function () {
                    var checkbox = $(this);
                    console.log(checkbox.prop("checked"));
                    if (checkbox.prop("checked") == false) {
                        $(this).parent().parent().css('background-color', 'white');
                    } else {
                        $(this).parent().parent().css('background-color', '#ffed9f');
                    }
                });
            },
            "bProcessing": true,
            "sPaginationType": "bootstrap",
            "aLengthMenu": menuData,
            "iDisplayLength": defaultRowNumber,
            "multipleSelection": true,
            "oLanguage": {
            	"sSearch": "Search all columns:",
                "sInfo": paginationOptions.sInfo,
                "sProcessing": "<img src='loader-big-black.gif' width ='30' height = '30'/>"
            },
            "bDestroy": true,
            "bServerSide": false,
            "aoColumnDefs": [
                {
                    aTargets: [0],
                    'bSortable': false,
                    fnRender: function (o, v) {
                        return '<input type="checkbox" name="someCheckbox"/>';
                    }
                }
            ],
            "sAjaxSource": jsonDataForGrid["defaultUrl"],
            "fnServerData": function (sSource, aoData, fnCallback) {
              //  var pageNumber = this.fnPagingInfo().iPage;
            	var pageNumber = 1;
              //  var pageLimit = aoData[4].value;
                setLogging(sSource);
                //aoData.push({ "name": "limit", "value": pageLimit }, { "name": "page", "value": pageNumber });
                //aoData.push({ "name": "limit", "value": pageLimit });
                $.getJSON(sSource, aoData, function (json) {
                    map = {};
                    map["aaData"] = json["responseObject"];
                    map["aaData"] = $.each(map["aaData"], function (key, value) {
                        value["checkbox"] = "";
                    });
                    map["iTotalRecords"] = jsonDataForGrid["totalRecords"];
                    map["iTotalDisplayRecords"] = jsonDataForGrid["totalRecords"];
                    fnCallback(map);
                });
            }
        }).columnFilter({
        	sPlaceHolder:"head:after",
			aoColumns: [ { type: "text"  },
					     { type: "text" },
					     { type: "text" },
					     { type: "text" },
					     { type: "text" }
					]});


    });
}

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
});