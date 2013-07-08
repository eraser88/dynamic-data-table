var xmlUrl, columnData, defaultHtml, defaultColumnData, baseUrl, defaultUrl, htmlHeaderStart, htmlHeaderEnd, columnHtml, paginationOptions,
    columnFilters = {
        'sPlaceHolder': "head:after",
        'aoColumns': [ null ]
    };
var hideList = [];
var showList = [];
var defaultRowNumber;
var filterDataTypesMap = {
    'number': "number-range", 'text': "text", 'string': "text", 'date': "text", 'null':"null", 'default': "text"
};

var filterPlaceHolders = {
    'default': "head:after", 'footer': "tfoot", 'after_header': "head:after", 'before_header': "head:before"
};

function readXml(data, label, func) {
    $.each($($.parseXML(data)).find(label), function (index, value) {
        func(index, value);
    });
}

function getXmlAndSetTable(tableId, url) {
    success = function (data) {
        var headers = "";
        readXml(data, "column", function (index, column) {
            uniqueId = $(column).attr("uniqueId");
            label = $(column).attr("label");
            readXml(data, "process", function (index, process) {
                if ($(process).attr("columnName") == uniqueId) {
                    propertyname = $(process).attr("propertyName");
                    readXml(data, "property", function (index, property) {
                        if ($(property).attr("name") == propertyname.split(".")[1]) {
                            columnData.push({"mData": $(property).attr("name") });
                            var datatype = $(property).attr("type");
                            columnFilters['aoColumns'].push({ "type": datatype!==null ? filterDataTypesMap[datatype] : filterDataTypesMap['default']});
                            headers = headers + "<th>" + label + "</th>";
                        }
                    });
                }
            });
        });

            columnHtml = columnHtml + headers + "</tr>";
        columnHtml = columnHtml + "<tr><th><input type='checkbox' id='globalCheckbox' name='globalCheckbox' /></th>" + headers ;
        readXml(data, "rowsPerPage", function (index, rowsPerPage) {
            defaultRowNumber = $(rowsPerPage).attr("defaultRowsPerPage");
        });

        baseUrl = $($($.parseXML(data)).find("url")).text();
        if (!(typeof url == "undefined" || url == "")) {
            defaultUrl = url;
        } else {
            defaultUrl = baseUrl;
        }

        readXml(data, "pagination", function (index, pagination) {
            paginationOptions["showPageNavigationButtons"] = $(pagination).attr("showPageNavigationButtons");
            paginationOptions["directPageNumberAccess"] = $(pagination).attr("directPageNumberAccess");
            paginationOptions["showTotalRecordCount"] = $(pagination).attr("showTotalRecordCount");
        });

        readXml(data, "filtering", function(index, filtering) {
            var position = $(filtering).attr("position");
            columnFilters['sPlaceHolder'] = position!==null ? filterPlaceHolders[position] : filterPlaceHolders['default'];
        });

        readXml(data, "option", function (index, option) {

            var hideWhenCountAbove = $(option).attr("hideWhenCountAbove");
            var showWhenCountAbove = $(option).attr("showWhenCountAbove");
            var optionValue = $(option).text();
            if (!(typeof hideWhenCountAbove == "undefined" || url == "")) {
                hidedata = [];
                hidedata[0] = [hideWhenCountAbove, optionValue];
                hideList.push(hidedata);
            }
            if (!(typeof showWhenCountAbove == "undefined" || url == "")) {
                showdata = [];
                showdata[0] = [showWhenCountAbove, optionValue];
                showList.push(showdata);
            }
        });
    };
    defaultColumnData = columnData;
    complete = function () {
        columnHtml = columnHtml + htmlHeaderEnd;
        defaultHtml = columnHtml;
        console.log(columnHtml);
        $(document).ready(function () {
            $(tableId).html(columnHtml);
        });
    };

    $.ajax({
        url: xmlUrl,
        async: false,
        dataType: "text",
        success: success,
        complete: complete
    });
}

function setLogging(data) {
    $('#logging-area').val($('#logging-area').val() + "\n" + data);
}

function setColumnAndHtmlData(url, tableId) {
    xmlUrl = "data/data.xml";
    columnData = [
        {"mData": "checkbox" }
    ];
    defaultHtml = '';
    defaultColumnData = [];
    paginationOptions = {};
    baseUrl = "";
    defaultUrl = baseUrl;
    htmlHeaderStart = "<table cellpadding='0' cellspacing='0' border='0' class='table table-bordered' id='dataTable' " +
        "width='100%' border='1'><tbody><thead><tr><th><input type='checkbox' id='globalCheckbox' name='globalCheckbox' /></th>";
    htmlHeaderEnd = "</tr></thead></tbody></table>";
    columnHtml = htmlHeaderStart;

    var urlPresent = !(typeof url == "undefined" || url == "");

    getXmlAndSetTable(tableId, url);

    var completeUrl = defaultUrl + "&page=-1&limit=-1";
    var data = $.ajax({
        url: completeUrl,
        async: false
    });

    var jsonData = $.parseJSON(data["responseText"]);
    if (!(typeof jsonData["status"] == "undefined" || jsonData["status"] == "")) {
        if (jsonData["status"] == "FAIL") {
            setLogging(jsonData.message);
            return {defaultUrl: defaultUrl, totalRecords: "", columnData: columnData};
        }
    }
    var totalRecords = jsonData.records;
    headerData = {};
    headerData["response"] = jsonData.responseObject[0];
    if (urlPresent) {
        columnData = [
            {"mData": "checkbox" }
        ];
        columnHtml = htmlHeaderStart;
        for (headers in headerData["response"]) {
            columnData.push({"mData": headers });
            columnHtml = columnHtml + "<th>" + headers + "</th>";
        }
        columnHtml = columnHtml + htmlHeaderEnd;
        $(tableId).html(columnHtml);
    }
    else {
        $(tableId).html(defaultHtml);
        columnData = defaultColumnData;
    }
    return {defaultUrl: defaultUrl, totalRecords: totalRecords, columnData: columnData};
}

function getMenuData(totalRecords) {
    defaultMenuData = [];
    modifiedMenuData = [];
    defaultMenuData = [10, 25, 50, 100];
    modifiedMenuData = defaultMenuData;
    var isDefValPresent = false;
    Array.prototype.removeByValue = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                this.splice(i, 1);
                break;
            }
        }
    };
    if (hideList.length > 0) {
        for (i = 0; i < hideList.length; i++) {

            if (totalRecords > hideList[i].toString().split(",")[0]) {
                modifiedMenuData.removeByValue(hideList[i].toString().split(",")[1]);
            }
        }
    }
    if (showList.length > 0) {
        for (i = 0; i < showList.length; i++) {
            if (totalRecords > showList[i].toString().split(",")[0]) {
                modifiedMenuData[modifiedMenuData.length] = showList[i].toString().split(",")[1];
            }
        }

    }
    if (!(typeof defaultRowNumber == "undefined" || defaultRowNumber == "")) {
        for (i = 0; i < modifiedMenuData.length; i++) {
            if (modifiedMenuData[i] == defaultRowNumber) {
                isDefValPresent = true;
            }
        }
        if (isDefValPresent == false) {
            modifiedMenuData[i] = defaultRowNumber;
        }
    }
    modifiedMenuData = modifiedMenuData.sort(sortNumber);
    if ((typeof defaultRowNumber == "undefined" || defaultRowNumber == ""))
        defaultRowNumber = modifiedMenuData[0];
    return modifiedMenuData;
}

function sortNumber(a, b) {
    return a - b;
}
