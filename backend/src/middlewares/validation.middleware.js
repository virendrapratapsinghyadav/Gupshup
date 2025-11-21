import Joi from 'joi';
import { ApiError } from '../utils/apiError.js';


const signUpValidation = (req, res, next)=>{
    const schema = Joi.object({
        fullName: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(2).max(100).required()
    })


    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400)
        .json(
            new ApiError(400, "Bad Request")
        )
    }
    next();
}


const loginValidation = (req, res, next)=>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(2).max(100).required()
    })

    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400)
        .json(
            new ApiError(400, "Bad Request")
        )
    }
    next();
}


export { signUpValidation, loginValidation }