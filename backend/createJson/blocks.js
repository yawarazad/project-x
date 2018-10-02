var _config = require('../config.js')
var fs = require('fs')

var blocks,blockFileLocation

function blockFileHandler() {
    blockFileLocation = __dirname+'/../programs/data/blocks_'+_config.getSession()+'.json'
    if (fs.existsSync(blockFileLocation)) {
        blocks = require(blockFileLocation)
    }else blocks = {}
}

function setOpenFunction(fxn) {
    blockFileHandler()
    blocks.functions = []
    blocks.functions.push(fxn)
    fs.writeFileSync(blockFileLocation, JSON.stringify(blocks, 0, 2),'utf-8')
}

function getOpenFunction() {
    blockFileHandler()
    if(blocks.functions != undefined)
        return blocks.functions[0]
    else 
        return undefined
}

function closeOpenFunction(fxn) {
    blockFileHandler()
    blocks.functions = []
    fs.writeFileSync(blockFileLocation, JSON.stringify(blocks, 0, 2), 'utf-8')
}

function getOpen() {
    return openList;
}
module.exports = {setOpenFunction, getOpenFunction, closeOpenFunction}