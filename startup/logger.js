const logger = require('../middleware/logger');

module.exports = function() {
    process.on('uncaughtException', (ex) => {
        logger.error(ex);
        
        setTimeout(() => {
            process.exit(1);    
        }, 100);
        
    });
}