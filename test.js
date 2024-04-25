const mamiLogger = require('./mamiLogger');

const logger = mamiLogger({
    level: 'info',
    timestamp: true,
    servers: [{ host: 'graylog.stage.odeal.cc', port: 12201 }],
    hostname: 'metadata.test',
    facility: 'Metadata',
    deflate: 'never'
});

logger.info('Hello, world!');

logger.error('123', 'This is an error!');

logger.request('123', 'Request received:', {
    method: 'GET',
    originalUrl: '/test'
}, 'This is the request body');

logger.response('123', 'Response sent:', {
    status: 200
}, 'This is the response body');
