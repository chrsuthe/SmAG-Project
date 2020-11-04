var util = require('util');
var events = require('events');
var request = require('request');
var fs = require('fs');

function setupData () {
    events.EventEmitter.call(this);
}

util.inherits(setupData, events.EventEmitter);

setupData.prototype.command = function (identifier, legalType, callback) {
    var path = './lear-data/' + identifier + '/';
    var formData = {};

    var files = fs.readdirSync(path);
    files.forEach(file => {
        var fileNameWithoutExtension = file.split('.').slice(0, -1).join('.');
        formData[fileNameWithoutExtension] = {
            'value': fs.createReadStream(path + file),
            'options': {
                'filename': file,
                'contentType': null
            }
        };
    });

    var self = this;
    this.api.perform(function () {
        setTimeout(function () {
            var options = {
                'method': 'POST',
                'url': 'https://data-reset-tool-test.pathfinder.gov.bc.ca/api/fixture/import/' + legalType,
                'headers': {
                    'Content-Type': 'multipart/form-data'
                },
                'formData': formData
            };
            request(options, function (error, response) {
                if (error) {
                    console.error(error);
                    return;
                } else if (callback) {
                    var busObject = JSON.parse(response.body);
                    callback(busObject);
                }

            });
            self.emit('complete');
        }, 10);
    });
    return this;
};

module.exports = setupData;
