const express = require('express');
const Task = require('../model/task');
const utils = require('../utils');
const auth = require('../middleware/auth');

const router = new express.Router();


// create task
router.post('/task', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        // TODO - should return status 500 if there's an error on connecting with the database
        await task.save();
        res.status(201).send(task);
    } catch(e){
        console.error(e);
        res.status(400).send(e);
    }
});


// list tasks
router.get('/task/', auth, async (req, res) => {
    try{
        const tasks = await Task.find({owner: req.user._id});
        // Another way to get all tasks of an user
        // const tasks = await req.user.tasks.populate('tasks').execPopulate();;
        if(!tasks){
            return res.status(404).send({error:'No tasks found'});
        }
        res.send(tasks);
    } catch(e){
        console.error(e);
        res.status(500).send(e);
    }
});

// list specific task
router.get('/task/:_id', auth, async (req, res) => {
    const{_id} = req.params;
    try{
        const task = await Task.findOne({_id, owner: req.user._id });
        if(!task){
            return res.status(404).send({error: 'Task not found'});
        }
        res.send(task);
    } catch(e){
        console.error(e);
        res.status(500).send({error: 'Internal server error.'});
    }
});


// update Task
router.patch('/task/:_id', auth, async (req, res) => {
    const task = await Task.findOne({id: req.params._id, owner: req.user._id });
    if(!task){
        return res.status(404).send({error: "Task not found."});
    }

    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, Task);
    if(invalidFields.length > 0){
        return res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        fieldsToUpdate.forEach((field) => task[field] = req.body[field]);
        await task.save();
        res.send(task);

    } catch(e) {
        console.error(e);
        res.status(400).send({error: 'Failed to update task.'});
    }
});

// delete task
router.delete('/task/:_id', auth, async (req, res) => {
    const {_id} = req.params;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if(!task){
            return res.status(404).send({error: 'Task not found.'});
        }
        res.send(task);
    } catch(e){
        console.error(e);
        res.status(500).send({error: 'Error deleting task.'});
    }
});

module.exports = router;