const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getAll = catchError(async(req, res) => {
    try{
        const user = req.user;
        console.log(user);
        const users = await User.findAll();
        return res.json(users);
    }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    }
});

const create = catchError(async(req, res) => {
    try{
        const { password, ...rest } = req.body;
        const encriptedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            password: encriptedPassword,
            ...rest,
        });
        return res.status(201).json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const getOne = catchError(async(req, res) => {
    try{
        const user2 = req.user;
        console.log(user2);
        const { id } = req.params; 
        const user = await User.findByPk(id);
        if(!user) return res.sendStatus(404);
        return res.json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const remove = catchError(async(req, res) => {
    try{
        const { id } = req.params;
        await User.destroy({ where: {id} });
        return res.sendStatus(204);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const update = catchError(async(req, res) => {
    try{
        const { id } = req.params;
        const { firstName, lastName } = req.body;
        const user = await User.update(
            {
                firstName,
                lastName,
            },
            { where: {id}, returning: true }
        );
        if(user[0] === 0) return res.sendStatus(404);
        return res.json(user[1][0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const login = catchError(async(req,res) => {
    
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email }});
        if(!user) return res.status(401).json({ message: 'Invalid credentials'});
        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid) return res.status(401).json({ message: 'Invalid credentials'});
    
        const token = jwt.sign(
                {user},
                process.env.TOKEN_SECRET, 
                { expiresIn: "1d" }
             );
    
        return res.json({user, token});
    
});


const getLoggedUser = catchError(async(req,res) => {
    try{
        const user = req.user;
        return res.json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
}

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    getLoggedUser
}