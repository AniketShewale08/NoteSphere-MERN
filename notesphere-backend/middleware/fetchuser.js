import jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";
dotenv.config();

const fetchuser = (req, res, next)=> {
    // get the user from the jwt token adn add id to req object
    const token = req.header('auth-token');
    if (!token){
        return res.status(401).send({error:"Please authenticate using a valid token."});
    }
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    }
    catch(error){
        res.status(401).send({error:"Please authenticate using a valid token."});
    }
}

export default fetchuser;
