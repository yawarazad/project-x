var _config = require('../config.js')
var _blocks = require('./blocks.js')
var fs = require('fs')
var writeObject = {}, functionObject = {}
// var blockOpenLocation
var inFormat = {
    //actions and there respective working..
    output : {
        //cN stands for construct name
        _cN: "functionCall__"+Math.random(),
        _func : function(parameters) {
            writeObject = {}
            writeObject[this._cN] = {}
            writeObject[this._cN].name = parameters.name;
            writeObject[this._cN].parameters = [];
        }
    },
    include : {
        _cN : "include__"+Math.random(),
        _func : function(parameters) {
            writeObject = {}
            writeObject[this._cN] = parameters.header_file
            _config.response.fulfillmentText = "Header file \""+ parameters.header_file +"\" included"
        }
    },
    declare_variable : {
        _cN : "variableDeclare__"+Math.random(),
        _func : function(parameters) {
            var i =0
            writeObject[this._cN] = {}
            writeObject[this._cN].type = parameters.datatype
            writeObject[this._cN].variableNames = []
            _config.response.fulfillmentText = 'Variable declared'
            for(i=0;i<parameters.variables.length;i++) {
                //Update the table which store variable names
                if(updateDataTable("variables", parameters.datatype, parameters.variables[i].varName)!=-1)
                    writeObject[this._cN].variableNames.push(parameters.variables[i].varName)
            }
            
        }
    },
    define_function : {
        _cN : "",
        _func : function(_parameters) {
            this._cN = "functionDefine__"+_parameters.fxn.functionName
            functionObject[this._cN] = {}
            functionObject[this._cN].name = _parameters.fxn.functionName
            functionObject[this._cN].returnType = _parameters.return
            functionObject[this._cN].parameters = []
            if(_blocks.getOpenFunction()!= undefined || _blocks.getOpenFunction() == _parameters.fxn.functionName){
                _config.response.fulfillmentText = 'function '+_blocks.getOpenFunction()+' is open, please complete it or end it..'
                return;
            }
            _blocks.setOpenFunction(_parameters.fxn.functionName)
            _config.response.fulfillmentText = 'function definition started..'
        }
    },
    end_function : {
        _func : function(_parameters) {
            //delete function file
            if(_blocks.getOpenFunction()!=_parameters.fxn.functionName || _blocks.getOpenFunction()==undefined){
                _config.response.fulfillmentText = 'this function is not open.. '+_parameters.fxn.functionName
                return;
            }
            functionObject = {}
            _blocks.closeOpenFunction(_parameters.fxn.functionName)
            _config.response.fulfillmentText = 'Okay! Out of function: '+_parameters.fxn.functionName
        }
    }
}

function updateDataTable(type,dataType,Name) {
    _config.setDataFileName()
    var dataLocation = _config.getDataFileName()
    var arrayOfObjects
    
    if (fs.existsSync(dataLocation)) {
        arrayOfObjects = require('../programs/data/'+_config.getSession()+'.json')
    }else arrayOfObjects = {}

    var _fxnName = undefined
    if(_blocks.getOpenFunction()!=undefined) {
        _fxnName = _blocks.getOpenFunction()
        if(arrayOfObjects[_fxnName] == undefined) arrayOfObjects[_fxnName] = {}
        if(arrayOfObjects[_fxnName][type]==undefined) arrayOfObjects[_fxnName][type] = {}
        if(arrayOfObjects[_fxnName][type][dataType]==undefined) arrayOfObjects[_fxnName][type][dataType] = []
        if(arrayOfObjects[_fxnName].names==undefined) arrayOfObjects[_fxnName].names = []
    }else {
        if(arrayOfObjects[type] == undefined) arrayOfObjects[type]={}
        if(arrayOfObjects[type][dataType] == undefined) arrayOfObjects[type][dataType] = []
        if(arrayOfObjects.names==undefined) arrayOfObjects.names = []
    }

    //check whether name is already present or not..
    var flag=0
    if(_fxnName!=undefined) {
        for(i=0;i<arrayOfObjects[_fxnName].names.length;i++){
            if(arrayOfObjects[_fxnName].names[i]==Name) flag=1
        } 
    }else {
        for(i=0;i<arrayOfObjects.names.length;i++){
            if(arrayOfObjects.names[i]==Name) flag=1
        }    
    }
    

    if(flag==0 && _fxnName!=undefined) arrayOfObjects[_fxnName].names.push(Name)
    else if(flag==0 && _fxnName == undefined) arrayOfObjects.names.push(Name)
    else {
        _config.response.fulfillmentText = "You have already used keyword \""+Name+"\" Once.."
        console.log("variable should not be declareddd..")
        return -1;
    }
 
    switch(type) {
        case "variables":
            if(_fxnName!=undefined)
                arrayOfObjects[_fxnName].variables[dataType].push(Name);
            else
                arrayOfObjects.variables[dataType].push(Name);
        break;
        default:
        _config.response.fulfillmentText = "Internal Error.. Contact Administrator"
        break;
    }
    fs.writeFileSync(dataLocation, JSON.stringify(arrayOfObjects, 0, 2),'utf-8')

}

function writeIntermediate() {
    _config.setJsonFileName()
    var _filename = _config.getJsonFileName()
    var _fileContent
    _config.okayReturn = 0
    fs.readFile(_filename, 'utf-8', function (err,data) {
        if (err) {
          _fileContent = {}
        }else {
            _fileContent = JSON.parse(data)
        }

        // var blockFileContent
        if (_blocks.getOpenFunction()!=undefined) {
            functionOpen = _blocks.getOpenFunction()
            var functionConstructName = "functionDefine__"+functionOpen
            if(Object.keys(writeObject)==0) _fileContent[functionConstructName] = functionObject[functionConstructName]
            else {
                functionObject[functionConstructName] = _fileContent[functionConstructName]
            }
            
            for(let key in writeObject){
                functionObject[functionConstructName][key] = {}
                functionObject[functionConstructName][key] = writeObject[key]
            }
            
            _fileContent[functionConstructName] = functionObject[functionConstructName]
        }else {
            functionOpen=false
            for(let key in writeObject)
                _fileContent[key] = writeObject[key]
        }

        writeObject = {}
        fs.writeFile(_filename,JSON.stringify(_fileContent, 0, 2),'utf-8', function(err, data){
            if(err) console.log(err);
        });
    });
}

function generateIntermediate() {
    var action = _config.getRequest().queryResult.action;
    var parameters = _config.getRequest().queryResult.parameters;
    // blockOpenLocation = __dirname +'/../programs/data/'+_config.getSession()+'function.json';
    inFormat[action]._func(parameters)
    writeIntermediate();
}

function main() {
    generateIntermediate()
}

module.exports = {main}