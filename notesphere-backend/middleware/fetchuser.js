import jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

const fetchuser = async (req, res, next)=> {
    // get the user from the jwt token adn add id to req object
    const token = req.header('auth-token');
    if (!token){
        return res.status(401).send({error:"Please authenticate using a valid token."});
    }
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;

        // Reject a token issued before the user's most recent password reset, even
        // though its signature is still valid and it hasn't expired — otherwise an
        // old, potentially-leaked token stays usable for up to 7 more days after a
        // reset specifically meant to lock that access out.
        const currentUser = await User.findById(data.user.id)
            .select("tokenVersion")
            .lean();
        if (!currentUser || currentUser.tokenVersion !== data.user.tokenVersion) {
            return res.status(401).send({error:"Please authenticate using a valid token."});
        }

        next();
    }
    catch(error){
        res.status(401).send({error:"Please authenticate using a valid token."});
    }
}

export default fetchuser;
