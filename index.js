'use strict';

const colorette = require('colorette');
const { cyan, red } = colorette;
const { gray } = colorette;
const { format } = require('date-fns');
const graylog2 = require('graylog2');

const defaultOptions = {
    level: 'info',
    timestamp: true,
    servers: [{ host: 'graylog.stage.odeal.cc', port: 12201 }],
    hostname: 'metadata.service',
    facility: 'Metadffataa',
    full_message: 'false',
    deflate: 'never'
};

function mamiLogger(options = {}) {
    options = Object.assign({}, defaultOptions, options);

    const graylog = new graylog2.graylog({
        servers: options.servers,
        hostname: options.hostname,
        facility: options.facility,
        full_message: options.full_message,
        deflate: options.deflate
    });

    function getTimestamp() {
        return gray(format(new Date(), '[dd-MM-yyyy HH:mm:ss]'));
    }

    return {
        info: (...args) => {
            console.log(cyan('[INFO]'), options.timestamp ? getTimestamp() : '', cyan(...args));
            graylog.info(args.join(' '), {
                stringLevel: 'Information'
            });
        },
        error: (...args) => {
            console.error(red('[ERROR]'), options.timestamp ? getTimestamp() : '', red(...args));
            graylog.error(args.join(' '), {
                stringLevel: 'Error',
                trackId: args[0]
            });
        },
        request: (trackId, req) => {
            console.log(cyan('[REQUEST]'), options.timestamp ? getTimestamp() : '', cyan(`[${trackId}]`), req.method, req.originalUrl);
            graylog.info(`Incoming Request: ${req.method} ${req.originalUrl}`, req, {
                stringLevel: 'Information',
                RequestMethod: req.method,
                Path: req.originalUrl,
                level: 'Information',
                trackId
            });
        },
        response: (trackId, res) => {
            console.log(cyan('[RESPONSE]'), options.timestamp ? getTimestamp() : '', cyan(`[${trackId}]`), res.status);
            graylog.info(`Outgoing Response: ${res.status}`, res, {
                stringLevel: 'Information',
                ResponseStatus: res.status,
                level: 'Information',
                trackId
            });
        }
    };
}

// Logger fonksiyonunu dışa aktarın
module.exports = mamiLogger;
