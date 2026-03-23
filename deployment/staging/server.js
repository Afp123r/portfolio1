
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 80;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"]
        }
    }
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 900000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use(limiter);

// Static files
app.use(express.static(__dirname, {
    maxAge: 86400000
}));

// API routes
app.post('/api/analytics', express.json(), (req, res) => {
    // Handle analytics data (implement your own storage)
    console.log('Analytics:', req.body);
    res.json({status: 'ok'});
});

app.post('/api/fingerprint', express.json(), (req, res) => {
    // Handle fingerprint data
    console.log('Fingerprint:', req.body);
    res.json({status: 'ok'});
});

// Catch all handler
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 Environment: development`);
});
