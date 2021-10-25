
const fs = require('fs');
const CollectionFilter = require('./collectionFilter');
const path = require('path');
const { v1: uuidv1 } = require('uuid');
let repositoryEtags = {};

///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file 
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////
module.exports = 
class Repository {
    constructor(objectsName) {
        this.initEtag();
        this.objectsList = [];
        this.objectsFile = `../data/${objectsName}.json`;
        this.read();
    }
    initEtag() {
        this.ETag = "";
        if (this.objectsName in repositoryEtags){
            this.ETag = repositoryEtags[this.objectsName];
        }
        else{
            this.newETag();
        }
    }
    newETag(){
        this.ETag = uuidv1();
        repositoryEtags[this.objectsName] = this.ETag;
    }
    getEtag(){
        return this.ETag;
    }
    read() {
        try{
            // Here we use the synchronus version readFile in order  
            // to avoid concurrency problems
            let rawdata = fs.readFileSync(path.resolve(__dirname, this.objectsFile));
            // we assume here that the json data is formatted correctly
            this.objectsList = JSON.parse(rawdata);
        } catch(error) {
            if (error.code === 'ENOENT') {
                // file does not exist, it will be created on demand
                this.objectsList = [];
            }
        }
    }
    write() {
        // Here we use the synchronus version writeFile in order
        // to avoid concurrency problems  
        this.newETag();
        fs.writeFileSync(path.resolve(__dirname, this.objectsFile), JSON.stringify(this.objectsList));
        this.read();
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objectsList){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    getAll(params = null) {
        if (params) {
            let collectionFilter = new CollectionFilter(this.objectsList, params);
            return collectionFilter.get();
        }
        return this.objectsList;
    }
    get(id){
        for(let object of this.objectsList){
            if (object.Id === id) {
               return object;
            }
        }
        return null;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === id) {
                this.objectsList.splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    findByField(fieldName, value){
        let index = 0;
        for(let object of this.objectsList){
            try {
                if (object[fieldName] === value) {
                    return this.objectsList[index];
                }
                index ++;
            } catch(error) {
                break;
            }
        }
        return null;
    }
}