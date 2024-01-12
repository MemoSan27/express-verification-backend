const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');


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
        const code = require('crypto').randomBytes(32).toString('hex');
        //const frontBaseUrl = process.env.FRONTEND_URL;
        const { password, email, frontBaseUrl, ...rest } = req.body;
        const encriptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: encriptedPassword,
            frontBaseUrl,
            ...rest,
        });

        await sendEmail({
            to: `${email}`,
            subject: 'Verifica tu email',
            html: `
                <h1> Verificacion de email</h1>
                <p style="color: red">Clickea el siguiente enlace para verificar tu cuenta: </p>
                <p> ${frontBaseUrl}/auth/verify_email/${code}</p>
            `
        })

        await EmailCode.create({ code, userId: user.id })

        return res.status(201).json({ message: 'Usuario creado satisfactoriamente. Por favor ve al correo registrado a verificar tu cuenta para poder hacer inicio de sesion' })
});

const getOne = catchError(async(req, res) => {
    const user2 = req.user;
    console.log(user2);
    const { id } = req.params; 
    const user = await User.findByPk(id);
    if(!user) return res.sendStatus(404);
    return res.json(user);
});

const remove = catchError(async(req, res) => {
        const { id } = req.params;
        await User.destroy({ where: {id} });
        return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id: userId} = req.user;
    const { id } = req.params;
    console.log({userId, id})
    if(+id !== userId) return res.status(401).json({ message: 'Unhautorized to modify information from this user'});
    const { firstName, lastName, country, image } = req.body;
    const user = await User.update(
        {
            firstName,
            lastName,
            country,
            image,
        },
        { where: {id}, returning: true }
    );
    if(user[0] === 0) return res.sendStatus(404);
    return res.json(user[1][0]);
});

const login = catchError(async(req,res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if(!user) return res.status(401).json({ message: 'Invalid credentials'});
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid) return res.status(401).json({ message: 'Invalid credentials'});
    if(!user.isVerified) return res.status(401).json({ message: 'User is not verified yet'});

    const token = jwt.sign(
            {user},
            process.env.TOKEN_SECRET, 
            { expiresIn: "1d" }
            );

    return res.json({user, token});
});


const getLoggedUser = catchError(async(req,res) => {
    const user = req.user;
    return res.json(user);
    
});

const verifyEmail = catchError(async(req,res) => {   
    const {code} = req.params;
    const emailCode = await EmailCode.findOne({ where: {code} });
    if(!emailCode) return res.status(401).json({error: `Code ${code} is not valid.` });

    const user = await User.findByPk(emailCode.userId);
    await user.update({ isVerified: true });

    await emailCode.destroy();

    return res.status(201).json({message: 'Correo verificado exitosamente'})
});

const startResetPassword = catchError(async(req,res) => {
    const code = require('crypto').randomBytes(32).toString('hex');
    //const frontBaseUrl = process.env.FRONTEND_URL;
    const { email, frontBaseUrl } = req.body;
    const userEmail = await User.findOne({ where: {email} });
    if(!userEmail) return res.status(401).json({error: `Email ${email} no existe en la base de datos.` });

    await sendEmail({
        to: `${email}`,
        subject: 'Recuperacion de contraseña',
        html: `
            <h1> Recupera tu contraseña</h1>
            <p style="color: red">Clickea el siguiente enlace para resetear la contraseña de tu cuenta: </p>
            <p> ${frontBaseUrl}/auth/reset_password/${code}</p>
        `
    });

    await EmailCode.create({ code, userId: userEmail.id })
    return res.status(201).json({message: `Se ha enviado un correo a ${email}, revisa tu bandeja o en spam`});
});

const resetPassword = catchError(async(req,res) => {
    const {code} = req.params;
    const emailCode = await EmailCode.findOne({ where: {code} });
    if(!emailCode) return res.status(401).json({error: `Code ${code} is not valid.` });

    const {password} = req.body;
    const encriptedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByPk(emailCode.userId);
    await user.update({ password: encriptedPassword });
    
    await emailCode.destroy();

    return res.status(201).json({message: 'Password cambiado de forma exitosa'})
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
    getLoggedUser,
    verifyEmail,
    startResetPassword,
    resetPassword,
}