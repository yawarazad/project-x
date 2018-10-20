//custom modules..
var _j = require('../backend/createJson/main.js')
var _c = require('../backend/createC/main.js')

var stack = []

var _config = require ('./config.js')
var _req

function main() {
    return function(req, res) {
        //if request has problems
        if(req.body.session == undefined) {
            // console.log("received nothing")
            return;
        }
        
        //set the request object in configuration file if request is not empty
        _config.setRequest(req.body)
        //set the session id once the req in config is 
        _config.setSession()

        //call create json
        _j.main()
        
        //Check For Errors
        //Debug Errors

        while(_config.okayReturn!=0) {
            require('deasync').runLoopOnce();
        } 

        //Call Language Creator
        _c.main()

        while(_config.cReturn!=0) {
            require('deasync').runLoopOnce();
        } 

        //Give Back Ouput
        return res.json(_config.response)
    }
}

module.exports = {main}
