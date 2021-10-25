const Repository = require('../models/Repository');

module.exports = 
class CoursesController extends require('./Controller') {
    constructor(req, res, params){
        super(req, res, params);
        this.coursesRepository = new Repository('Courses');
    }
    getAll(){
        this.response.JSON(this.coursesRepository.getAll());
    }
    get(id){
        if(!isNaN(id))
            this.response.JSON(this.coursesRepository.get(id));
        else
            this.response.JSON(this.coursesRepository.getAll());
    }
    post(course){  
        // todo : validate cour before insertion
        // todo : avoid duplicates
        let newCourse = this.coursesRepository.add(course);
        if (newCourse) 
            this.response.created(JSON.stringify(newCourse));
         else 
            this.response.internalError();
    }
    put(course){
        // todo : validate contact before updating
        if (this.coursesRepository.update(course))
            this.response.ok();
        else 
            this.response.notFound();
    }
    remove(id){
        if (this.coursesRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}