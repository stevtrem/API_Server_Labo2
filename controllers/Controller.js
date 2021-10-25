const Response = require('../Response.js');
/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports =
    class Controller {
        constructor(req, res, params) {
            if (req != null && res != null) {
                this.req = req;
                this.res = res;
                this.response = new Response(res, this.req.url);
                this.params = params;
            }
        }
        paramsError(params, message) {
            if (params) {
                params["error"] = message;
                this.response.JSON(params);
            } else {
                this.response.JSON(message);
            }
            return false;
        }
        head(){
            this.response.notImplemented();
        }
        getAll() {
            this.response.notImplemented();
        }
        get(id) {
            this.response.notImplemented();
        }
        post(obj) {
            this.response.notImplemented();
        }
        put(obj) {
            this.response.notImplemented();
        }
        patch(obj) {
            this.response.notImplemented();
        }
        remove(id) {
            this.response.notImplemented();
        }
    }