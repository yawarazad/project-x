var _config = require('../config.js')
var fs = require('fs')


function getIntermediate() {
    _config.setCFileName()
    var _jsonfile = _config.getJsonFileName()
    var intermediateCode
    fs.readFile(_jsonfile, 'utf-8', function (err,data) {
        if(err) throw err;
        else {
            intermediateCode = JSON.parse(data)
        }
        // console.log(intermediateCode)
        cCode = parseConstructs(intermediateCode)
        writeC(cCode)
        _config.cReturn = 0
    });

}

function parseConstructs(p){
    _output = ""
    var i = 0;
    for(key in p) {
        var nameTopass = trimmedName(key);
        if(nameTopass == undefined) nameTopass = key
        _output = _output + generateC(nameTopass,p[key])+"\n";
        
    }
    return _output
    // console.log(_output)
}

function trimmedName(str) {
    var n = str.search("__");
    if(n!=-1)
        var res = str.slice(0, n);
    return res
}

function insideFunction(key, getObj){
    // console.log('received objct')
    // console.log(getObj)
    // console.log('recevied key')
    // console.log(key)
    var nameTopass = trimmedName(key);
    if(nameTopass == undefined) nameTopass = key
    // console.log(nameTopass)
    // return generateC(nameTopass, getObj)
    // console.log('code for this construct')
    // console.log(generateC(nameTopass, getObj))
    return generateC(nameTopass, getObj)
}

function generateC() {
    var parameterString = ""
    var obj = arguments[1]


    // if(arguments[1]!=undefined){ obj1 = arguments[1]
    //     console.log(arguments[1])
    // }
    if(typeof arguments[1] == 'string') {
        obj = {
            name: arguments[1],
        }
    }
    if(obj.variableNames==undefined){
        obj.variableNames=['null']
    }
    if(obj.parameters==undefined){
        obj.parameters=['null']
    }

    var _x = obj.assignment
    // console.log(typeof obj.assignment)
    if(typeof obj.assignment != 'string' && obj.assignment!= undefined){
        _x = obj.assignment.varName
    }
    // if(arguments[1].parameters!= undefined) parameterString = ""//createParameterString(arguments[1])

    // console.log("okay")
    // console.log(obj)
    formatString = ''
    //Format of each c contstruct
    var cFormat = {
        include : `#include<${obj.name}>`,
        variableDeclare: `${obj.type} ${obj.variableNames[0]};`,
        functionDefine: `${obj.returnType} ${obj.name}(${obj.parameters.map((i)=>{
                return `${i.datatype} ${i.name}`
            })}){${Object.keys(obj).map((key)=>{
                if(key== 'name' || key == 'returnType' || key == 'parameters' || key == 'variableNames')
                    return '\n'
                else{
                       return "\t"+insideFunction(key, obj[key])+'\n'
                }
            })}}`,
        functionCall: `${obj.name}(${obj.parameters.map((i)=>{
            return `${i.varName}`
        })});`,
        assignFunction : `${obj.varName} = ${obj.functionName}(${obj.parameters.map((i)=>{
            return `${i.varName}`
        })});`,
        returnFunction : `return;`,
        assignVariable : `${obj.varName}=${_x};`
        // variableDeclare: `${obj1.type} ${
        //                     arguments[2].length==1 ? arguments[2][0].name : arguments[2].map((i) => {
        //                         return `${i.name}`
        //                       })
        //                 };`,
        // variableDeclare: `${arguments[1].type} ${arguments[1] != undefined ? arguments[1].variableNames[0] : ""};`,
        // variableDeclare1: `${arguments[2].map((el, index ,array)=>{
        //     if(arguments[2].length==1) return `${el.type} ${el.name};`
        //     if(index==1) return `${el.type} ${el.name}`
        //     else if(array[index-1].type == el.type) return `${el.name}`
        //     else return `${el.type} ${el.name}`
        // })};`,
        // variableInitialize: `${arguments[2][0].name}=${arguments[2][0].value};`,
        // variableDeclareInitialize: `${arguments[2][0].type} ${arguments[2][0].name} = ${arguments[2][0].value};`,
        // arrayDeclaration: `${arguments[2][0].type} ${arguments[2][0].name}[${arguments[2][0].size}];`,
        // arrayInitialization: ``,
        // arrayDeclarationInitialization: ``
    }
    //End of c construct formatting

    //Getting the construct to display
    // console.log(cFormat[arguments[0]])
    return cFormat[arguments[0]]
}

function writeC(cCode){
    // console.log(cCode)
    fileLocation = "./backend/programs/c/abc.c"
    fs.writeFileSync(fileLocation, cCode,'utf-8')
}

function main() {
    getIntermediate();
}

module.exports = {main}