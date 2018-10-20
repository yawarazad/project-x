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
    call_function : {
        _cN : "functionCall__"+Math.random(),
        _func : function(parameters){
            writeObject = {}
            writeObject[this._cN] = {}
            writeObject[this._cN].name = parameters.fxn.functionName;
            if(parameters.parameterList.length==1 && parameters.parameterList[0] == "nothing") writeObject[this._cN].parameters = []
            else {
                writeObject[this._cN].parameters = []
                for(i=0;i<parameters.parameterList.length;i++){
                    writeObject[this._cN].parameters.push(parameters.parameterList[i])
                }
            }
            _config.response.fulfillmentText = "function \""+ parameters.fxn.functionName +"\" called"
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
                else {
                    if(parameters.variables.length==1) {
                        delete writeObject[this._cN]
                        console.log('deleted fucking writeObject')
                        console.log(writeObject)
                    }
                    _config.response.fulfillmentText = 'Naming Conflict! You already have keyword with name. '+parameters.variables[i].varName
                }
            }
            
        }
    },
    define_function : {
        _cN : "",
        _func : function(_parameters) {
            this._cN = "functionDefine__"+_parameters.fxn.functionName
            console.log(_parameters.arguments.length)
            functionObject[this._cN] = {}
            functionObject[this._cN].name = _parameters.fxn.functionName
            functionObject[this._cN].returnType = _parameters.return
            if(_parameters.arguments.length==1 && _parameters.arguments[0] == "nothing") functionObject[this._cN].parameters = []
            else {
                functionObject[this._cN].parameters = []
                for(i=0;i<_parameters.arguments.length;i++){
                    var argument = {
                        datatype : _parameters.arguments[i].dataType,
                        name : _parameters.arguments[i].variableName
                    }
                    functionObject[this._cN].parameters.push(argument)
                }
            }
            if(_blocks.getOpenFunction()!= undefined || _blocks.getOpenFunction() == _parameters.fxn.functionName){
                _config.response.fulfillmentText = 'function '+_blocks.getOpenFunction()+' is open, please complete it or end it..'
                return;
            }
            _blocks.setOpenFunction(_parameters.fxn.functionName)
            _config.response.fulfillmentText = 'function definition started..'
        }
    },
    assign_function: {
        _cN : "assignFunction__"+Math.random(),
        _func : function(parameters) {
            writeObject[this._cN] = {}
            writeObject[this._cN].varName = parameters.variable.varName
            writeObject[this._cN].functionName = parameters.function.functionName
            if(parameters.parameterList.length==1 && parameters.parameterList[0] == "nothing") writeObject[this._cN].parameters = []
            else {
                writeObject[this._cN].parameters = []
                for(i=0;i<parameters.parameterList.length;i++){
                    writeObject[this._cN].parameters.push(parameters.parameterList[i])
                }
            }
            _config.response.fulfillmentText = 'function assigned to variable'
        }
    },
    assign_variable: {
        _cN : "assignVariable__"+Math.random(),
        _func : function(parameters) {
            writeObject[this._cN] = {}
            writeObject[this._cN].varName = parameters.variable.varName
            writeObject[this._cN].assignment = parameters.assignment
            _config.response.fulfillmentText ='value assigned to variable'
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
    },
    return_function :{
        _cN : "returnFunction__"+Math.random(),
        _func : function(parameters) {
            writeObject[this._cN] = {}
            writeObject[this._cN].return = parameters.returnValue
            _config.response.fulfillmentText = 'Okay! returned there'
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

    var openFunction = _blocks.getOpenFunction()

    if(openFunction==undefined) {
        if(arrayOfObjects.globalNames==undefined) arrayOfObjects.globalNames=[]
        else {
            for(var i=0;i<arrayOfObjects.globalNames.length;i++) 
            {
                if(arrayOfObjects.globalNames[i] == Name)
                return -1;
            }
        }
        arrayOfObjects.globalNames.push(Name)
    }else {
        if(arrayOfObjects[openFunction]==undefined) arrayOfObjects[openFunction]=[]
        else {
            for(var i=0;i<arrayOfObjects[openFunction].length;i++) 
            {
                if(arrayOfObjects[openFunction][i] == Name)
                return -1;
            }
        }
        arrayOfObjects[openFunction].push(Name)
    }
    fs.writeFileSync(dataLocation, JSON.stringify(arrayOfObjects, 0, 2),'utf-8')

    // var _fxnName = undefined
    // if(_blocks.getOpenFunction()!=undefined) {
    //     _fxnName = _blocks.getOpenFunction()
    //     if(arrayOfObjects[_fxnName] == undefined) arrayOfObjects[_fxnName] = {}
    //     if(arrayOfObjects[_fxnName][type]==undefined) arrayOfObjects[_fxnName][type] = {}
    //     if(arrayOfObjects[_fxnName][type][dataType]==undefined) arrayOfObjects[_fxnName][type][dataType] = []
    //     if(arrayOfObjects[_fxnName].names==undefined) arrayOfObjects[_fxnName].names = []
    // }else {
    //     if(arrayOfObjects[type] == undefined) arrayOfObjects[type]={}
    //     if(arrayOfObjects[type][dataType] == undefined) arrayOfObjects[type][dataType] = []
    //     if(arrayOfObjects.names==undefined) arrayOfObjects.names = []
    // }

    // //check whether name is already present or not..
    // var flag=0
    // if(_fxnName!=undefined) {
    //     for(i=0;i<arrayOfObjects[_fxnName].names.length;i++){
    //         if(arrayOfObjects[_fxnName].names[i]==Name) flag=1
    //     } 
    // }else {
    //     for(i=0;i<arrayOfObjects.names.length;i++){
    //         if(arrayOfObjects.names[i]==Name) flag=1
    //     }    
    // }
    

    // if(flag==0 && _fxnName!=undefined) arrayOfObjects[_fxnName].names.push(Name)
    // else if(flag==0 && _fxnName == undefined) arrayOfObjects.names.push(Name)
    // else {
    //     _config.response.fulfillmentText = "You have already used keyword \""+Name+"\" Once.."
    //     writeObject = {}
    //     console.log("variable should not be declareddd..")
    //     return -1;
    // }
 
    // switch(type) {
    //     case "variables":
    //         if(_fxnName!=undefined)
    //             arrayOfObjects[_fxnName].variables[dataType].push(Name);
    //         else
    //             arrayOfObjects.variables[dataType].push(Name);
    //     break;
    //     default:
    //     _config.response.fulfillmentText = "Internal Error.. Contact Administrator"
    //     break;
    // }
    // fs.writeFileSync(dataLocation, JSON.stringify(arrayOfObjects, 0, 2),'utf-8')
    return 0;
}

function writeIntermediate() {
    _config.setJsonFileName()
    var _filename = _config.getJsonFileName()
    var _fileContent
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
                
            
            if(_fileContent[functionConstructName] == undefined) _fileContent[functionConstructName] = functionObject[functionConstructName]
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
            _config.okayReturn = 0
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