const mamiLogger = require('./index');

const logger = mamiLogger({
    level: 'info',
    timestamp: true,
    servers: [{ host: 'localhost', port: 12201 }],
    hostname: 'hosts',
    facility: 'facility',
    deflate: 'never'
});

logger.info('Bu bir info log mesajıdır.');

logger.error(124241, 'Exception.Message Bu bir hata log mesajıdır.');

logger.request('123456', { method: 'GET', originalUrl: '/test' });

logger.response('123456', { status: 200 });