'use strict';

const colorette = require('colorette');
const { cyan, red } = colorette;
const { gray } = colorette;
const { format } = require('date-fns');
const graylog2 = require('./graylog');

const defaultOptions = {
    level: 'info',
    timestamp: true,
    servers: [{ host: 'localhost', port: 12201 }],
    hostname: 'node.service',
    facility: 'service',
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
        error: (trackId, err) => {
            console.error(red('[ERROR]'), options.timestamp ? getTimestamp() : '', red(`[${trackId}]`), err);
            graylog.error(err, {
                stringLevel: 'Error',
                level: 'Error',
                trackId
            });
        },
        request: (trackId, msg, req, reqBody) => {
            console.log(cyan('[REQUEST]'), options.timestamp ? getTimestamp() : '', cyan(`[${trackId}]`), req.method, req.originalUrl);
            graylog.info(`${msg} ${req.method} ${req.originalUrl}`, reqBody, {
                stringLevel: 'Information',
                RequestMethod: req.method,
                Path: req.originalUrl,
                level: 'Information',
                trackId: trackId,
                RequestBody: reqBody
            });
        },
        response: (trackId, msg, res, resBody) => {
            console.log(cyan('[RESPONSE]'), options.timestamp ? getTimestamp() : '', cyan(`[${trackId}]`), res.status);
            graylog.info(`${msg} ${res.status}`, resBody, {
                stringLevel: 'Information',
                ResponseStatus: res.status,
                level: 'Information',
                trackId: trackId,
                ResponseBody: resBody
            });
        }
    };
}

module.exports = mamiLogger;