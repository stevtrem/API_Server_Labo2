/////////////////////////////////////////////////////////////////////////////
// Uncomment to create and fill with data ./contacts.json file
// let Contacts = require('./models/initContacts.js');
// Contacts.initContacts(); 
//////////////////////////////////////////////////////////////////////////////

function ShowRequestInfo(req) {
    console.log(`Method:${req.method}`);
    console.log(`Path:${req.url}`);
    console.log(`Content-type:${req.headers["content-type"]}`);
}
function AccessControlConfig(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*'); /// in order to have access to all header at the client side
}
function Prefligth(req, res) {
    if (req.method === 'OPTIONS') {
        console.log('Preflight CORS verifications');
        res.end();
        // request handled
        return true;
    }
    // request not handled
    return false;
}
function responseNotFound(res) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end();
}
const server = require('http').createServer((req, res) => {
    // Middlewares pipeline
    ///////////////////////////////////////////////////
    //console.log(req.method);
    ShowRequestInfo(req);
    AccessControlConfig(res);
    if (!Prefligth(req, res)) {
        let router = require('./router');
        if (!router.dispatch_API_EndPoint(req, res)) {
            responseNotFound(res);
        }
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`HTTP Server running on port ${PORT}...`));
/////////////////////////////////////////////////////////////////////////
