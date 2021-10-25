const utilities = require('./utilities');
const Response = require('./response.js');
// this function extract the JSON data from the body of the request
// and and pass it to controller Method
// if an error occurs it will send an error response
function processJSONBody(req, res, controller, methodName) {
    let response = new Response(res);
    let body = [];
    req.on('data', chunk => {
        body.push(chunk);
    }).on('end', () => {
        try {
            // we assume that the data is in JSON format
            if (req.headers['content-type'] === "application/json") {
                controller[methodName](JSON.parse(body));
            }
            else 
                response.unsupported();
        } catch(error){
            console.log(error);
            response.unprocessable();
        }
    });
}

function makeControllerName(modelName) {
    if (modelName != undefined)
        // by convention controller name -> NameController
        return utilities.capitalizeFirstLetter(modelName) + 'Controller';
    return undefined;
}
//////////////////////////////////////////////////////////////////////
// dispatch_API_EndPoint middleware
// parse the req.url that must have the following format:
// /api/{ressource name} or
// /api/{ressource name}/{id}
// then select the targeted controller
// using the http verb (req.method) and optionnal id
// call the right controller function
// warning: this function does not handle sub resource
// of like the following : api/resource/id/subresource/id?....
//
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
/////////////////////////////////////////////////////////////////////
exports.dispatch_API_EndPoint = function(req, res){
    
    if (req.url == "/api"){
        const Endpoints = require('./endpoints');
        Endpoints.list(res);
        // request consumed
        return true;
    }
    
    let path = utilities.decomposePath(req.url);

    if (!path.isAPI)
        return false;

    let controllerName = makeControllerName(path.model);
    let id = path.id;
/*
    if (path.id != undefined) {
        if (isNaN(path.id)) {
            //response.badRequest();
            // request not consumed
            return true;
        }
    }
*/
    if (controllerName != undefined) {
        let response = new Response(res);
        try{
            // dynamically import the targeted controller
            // if the controllerName does not exist the catch section will be called
            const Controller = require('./controllers/' + controllerName);
            // instanciate the controller       
            let controller =  new Controller(req, res, path.params);
            
            if (req.method === 'HEAD') {
                controller.head();
                // request consumed
                return true;
            }
            if (req.method === 'GET') {
                controller.get(id);
                // request consumed
                return true;
            }
            if (req.method === 'POST'){
                processJSONBody(req, res, controller, "post");
                // request consumed
                return true;
            }
            if (req.method === 'PUT'){
                processJSONBody(req, res, controller, "put");
                // request consumed
                return true;
            }
            if (req.method === 'PATCH'){
                processJSONBody(req, res, controller, "patch");
                // request consumed
                return true;
            }
            if (req.method === 'DELETE') {
                controller.remove(id);
                // request consumed
                return true;
            }
        } catch(error){
            // catch likely called because of missing controller class
            // i.e. require('./' + controllerName) failed
            // but also any unhandled error...
            console.log('endpoint not found');
            console.log(error);
            response.notFound();
                // request consumed
                return true;
        }
    }
    // not an API endpoint
    // request not consumed
    // must be handled by another middleware
    return false;
}