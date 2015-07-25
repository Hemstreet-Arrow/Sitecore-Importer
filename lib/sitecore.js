var _ = require('lodash'),
    xj = require("xls-to-json"),
    queryString = require('query-string');

var request = require('request');

var sitecore = {

    data: null,
    config: null,

    init: function (config) {

        var _config = require('./config/config.json');

        this.config = _.assign(config || {}, _config);

    },
    createItem: function (data) {

        var name = data.name || 'No Name',
            database = data.database || 'master',
            sc_itemid = data.sc_itemid || this.config.sc_itemid,
            template = data.template || this.config.template;

        var createdBy = data.createdFrom || this.config.author;

        data.body["__Created by"] = createdBy;

        this.post({
            'url': this.config.baseUrl + '?name=' + name + '&sc_itemid=' + sc_itemid + '&template=' + template + '&sc_database=' + database,
            'body': data.body
        });

    },
    /**
     * Retrieve item by id, can be any type of item ( page, media, etc...)
     * @param id
     */
    readItem: function (id, params) {

        var query = null;

        if(params) {
            query = '?' + queryString.stringify(params) + '&sc_itemid=' + id;
        }

        this.request({
            'url': query || '?sc_itemid=' + id
        });

    },
    query: function (path) {

        this.request({
            'url': '?query=fast:' + path
        });

    },

    post: function (options) {

        // Configure the request
        var requestOptions = {
            url: options.url,
            method: 'POST',
            headers: this.config.headers,
            form: options.body
        }

        // Start the request
        request(requestOptions, function (error, response, body) {

            if(error) {
                console.log('Error:', error);
                return;
            }

            var data = JSON.parse(body).result;

            console.log(data);

        });

    },
    request: function (options) {

        var url = encodeURI(this.config.baseUrl + options.url);

        // Configure the request
        var requestOptions = {
            url: url,
            method: 'GET',
            headers: this.config.headers
        }

        // Start the request
        request(requestOptions, function (error, response, body) {

            if(error) {
                console.log('Error:', error);
                return;
            }

            var data = JSON.parse(body).result;

            console.log(data);

        });

    },
    importFromSpreadsheet: function(path, sheetName, fields, target) {

        var pieces = path.split('/'),
            fileName   = pieces[pieces.length - 1],
            name = fileName.split('.')[0],
            extension = fileName.split('.')[1],
            target = target || this.config.sc_itemid,
            config = {
                input: this.config.spreadsheetPath + '/' + path,
                output: this.config.outputPath + "/" + name + '.json',
                sheet: sheetName || 'Sheet 1',
            };

        xj(config,
            function (err, result) {

                if (err) {
                    console.error(err);
                } else {

                    console.log('Import target:', target);

                    _.forEach( result, function ( data, key ) {

                        if(result[key][fields[0]] == '') {
                            return;
                        }

                        setTimeout( function () {


                            this.createItem({
                                'name' : result[key][fields[0]],
                                'body' : {
                                    'Title' : result[key][fields[0]],
                                    'ManufacturerName' : result[key][fields[0]],
                                    'PageDescription' : result[key][fields[2]]
                                },
                                'sc_item': target
                            });

                        }.bind( this ), key * this.config.delayBetweenRequests );

                    }.bind( this ) );
                }

            }.bind(this));
    },
    // findById(id)
    // findByName(name)
    // updateById(id)
    // updateByName(name)
    // getTemplateByKey(key)
    // getTemplateByName(name)
    // alphabetizeByField(field, array)
    // getFieldKeyByName(name, template)
    // getFieldsByTemplateId
    // getFieldsByTemplateName
    // createFolder(name)
    // deleteById(id)
    // deleteByName(name)
    // importFromSpreadsheet
    // updateFromSpreadsheet

};

sitecore.init();

module.exports = sitecore;