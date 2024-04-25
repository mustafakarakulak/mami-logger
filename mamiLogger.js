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
    deflate: 'never',
    bufferSize: 1400,
    shortMessageSize: 200,
};

function mamiLogger(options = {}) {
    options = Object.assign({}, defaultOptions, options);

    const graylog = new graylog2.graylog({
        servers: options.servers || [{ host: 'localhost', port: 12201 }],
        hostname: options.hostname || 'node.service',
        facility: options.facility || 'service',
        full_message: options.full_message,
        deflate: options.deflate || 'never',
    });

    function truncateMessage(message) {
        return message.length > options.shortMessageSize ? message.slice(0, options.shortMessageSize) + '...' : message;
    }

    function getTimestamp() {
        return gray(format(new Date(), '[dd-MM-yyyy HH:mm:ss]'));
    }

    return {
        info: (...args) => {
            console.info(cyan('[INFO]'), options.timestamp ? getTimestamp() : '', cyan(...args));
            graylog.info(args.join(' '), {
                stringLevel: 'Information'
            });
        },
        error: (trackId, msg, err) => {
            console.error(red('[ERROR]'), options.timestamp ? getTimestamp() : '', red(err));
            graylog.error(`${msg} ${err}`, err,{
                stringLevel: 'Error',
                level: 'Error',
                trackId
            });
        },
        request: (trackId, msg, req, reqBody) => {
            let truncatedReqBody = truncateMessage(reqBody);

            console.info(cyan('[REQUEST]'),
                options.timestamp ? getTimestamp() : '',
                msg, cyan(`[${trackId}]`), reqBody);

            graylog.info(`${msg} ${truncatedReqBody}`, reqBody, {
                stringLevel: 'Information',
                RequestMethod: req.method,
                Path: req.originalUrl,
                level: 'Information',
                trackId: trackId,
                RequestBody: truncatedReqBody
            });
        },
        response: (trackId, msg, req, resBody) => {
            let truncatedResBody = truncateMessage(resBody);

            console.info(cyan('[RESPONSE]'),
                options.timestamp ? getTimestamp() : '',
                msg, cyan(`[${trackId}]`), resBody);

            graylog.info(`${msg} ${truncatedResBody}`, resBody, {
                stringLevel: 'Information',
                RequestMethod: req.method,
                Path: req.originalUrl,
                level: 'Information',
                trackId: trackId,
                ResponseBody: truncatedResBody
            });
        }
    };
}

module.exports = mamiLogger;