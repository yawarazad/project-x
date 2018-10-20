var req,session, response, dataFileName, jsonFileName,  cFileName
var okayReturn = -1
var cReturn = -1
// response = {
//     "fulfillmentText": "Instruction generated successfully",
//     "fulfillmentMessages": [
//       {
//         "card": {
//           "title": "",
//           "subtitle": "",
//           "imageUri": "",
//           "buttons": [
//             {
//               "text": "",
//               "postback": ""
//             }
//           ]
//         }
//       }
//     ],
//     "source": "Yawar Azad's Response",
//     "payload": {
//       "google": {
//         "expectUserResponse": true,
//         "richResponse": {
//           "items": [
//             {
//               "simpleResponse": {
//                 "textToSpeech": "this is a simple response"
//               }
//             }
//           ]
//         }
//       },
//       "facebook": {
//         "text": "Hello, Facebook!"
//       },
//       "slack": {
//         "text": "This is a text response for Slack."
//       }
//     },
//     "outputContexts": [
//       {
//         "name": "projects/${PROJECT_ID}/agent/sessions/${SESSION_ID}/contexts/context name",
//         "lifespanCount": 5,
//         "parameters": {
//           "param": "param value"
//         }
//       }
//     ],
//     "followupEventInput": {
//       "name": "event name",
//       "languageCode": "en-US",
//       "parameters": {
//         "param": "param value"
//       }
//     }
//   }

response = {
    "fulfillmentText": "Instruction generated successfully"
}

function setRequest(request) {
    req = request
}

function getRequest() {
    return req;
}

function setSession() {
    var tempSession = req.session;
    var index = tempSession.lastIndexOf("/") + 1;
    session = tempSession.substr(index);
}

function getSession() {
    return session;
}

function setDataFileName() {
    dataFileName = "./backend/programs/data/"+session+".json"
}
function getDataFileName() {
    return dataFileName
}

function setJsonFileName() {
    jsonFileName = "./backend/programs/json/"+session+".json"
}

function getJsonFileName() {
    return jsonFileName
}

function setCFileName(){
    cFileName = "./backend/programs/c/"+session+".c"
}

function getCFileName(){
    return cFileName
}

module.exports = {
    setSession, 
    setRequest, 
    getSession, 
    getRequest, 
    response, 
    setDataFileName, 
    getDataFileName,
    okayReturn , 
    setJsonFileName, 
    getJsonFileName,
    setCFileName,
    getCFileName
}
