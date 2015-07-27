var _ = require('lodash'),
    xj = require("xls-to-json");

var Spreadsheet = function (options, config) {

    this.sitecore = options.sitecore;

    this.config = config;

};

Spreadsheet.prototype = {
    config: null,
    sitecore: null,
    importFromSpreadsheet: function (path, sheetName, fields, target) {

        var details = this.getSheetDetails(path, sheetName, target);

        xj(details.config,
            function (err, result) {

                if (err) {
                    console.error(err);
                } else {

                    console.log('Import target:', details.target);

                    _.forEach(result, function (data, key) {

                        if (result[key][fields[0]] == '') {
                            return;
                        }

                        setTimeout(function () {


                            this.sitecore.createItem({
                                'name': result[key][fields[0]],
                                'body': {
                                    'Title': result[key][fields[0]],
                                    'ManufacturerName': result[key][fields[0]],
                                    'PageDescription': result[key][fields[2]]
                                },
                                'sc_item': details.target
                            });

                        }.bind(this), key * this.config.delayBetweenRequests);

                    }.bind(this));
                }

            }.bind(this));
    },
    updateFromSpreadSheet: function(options, config) {

        var details = this.getSheetDetails(options.path, options.sheetName, options.target);

        var items = this.sitecore.query(options.destinationPath);

        console.log(items);


    },
    getSheetDetails: function(path, sheetName, target) {
        var pieces = path.split('/'),
            fileName = pieces[pieces.length - 1],
            name = fileName.split('.')[0],
            details = {
            pieces : pieces,
            fileName : pieces[pieces.length - 1],
            name : name,
            extension : fileName.split('.')[1],
            target : target || this.config.sc_itemid,
            config : {
                input: this.config.spreadsheetPath + '/' + path,
                output: this.config.outputPath + "/" + name + '.json',
                sheet: sheetName || 'Sheet 1',
            }
        }

        return details;

    }
}

module.exports = Spreadsheet;