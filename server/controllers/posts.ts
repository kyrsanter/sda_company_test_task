import {IncomingMessage, ServerResponse} from "http";
import {PostsResponseType, PostType} from "./types";
import {ErrorMessageType, UserResponseType} from "../types";
import {ParamsTypes} from "../middleware/types";

const url = require('url');
const fetchNode = require('node-fetch');

exports.getPosts = async (req: IncomingMessage & ParamsTypes, res: ServerResponse) => {
    try {
        let {id, adminId, canBeModify, limit, skip, all, token} = req.postsParams; //user id
        let posts: Response = await fetchNode('http://jsonplaceholder.typicode.com/posts');
        let postsJSON: Array<PostType> = await posts.json();
        let neededPosts;
        let author;
        if (!all) {
            neededPosts = postsJSON.filter( (p: PostType) => p.userId == id );  // filter just an users posts to display them on users page (profile)
        } else {
            neededPosts = postsJSON;
        }
        if (neededPosts.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify(<ErrorMessageType>{err: 'No one post was founded'}))
        }
        else {
            let newLimit;
            if (Number(limit) > neededPosts.length) {
                newLimit = neededPosts.length;
            }
            let outPosts = neededPosts.slice(Number(skip), Number(newLimit) || Number(limit));
            if (all) {
                for await (let p of outPosts) {
                    let authorId = p.userId;
                    let usersResponse: Response = await fetchNode(`http://jsonplaceholder.typicode.com/users`);
                    let resultJSON: Array<UserResponseType> = await usersResponse.json();
                    let userIdx = resultJSON.findIndex( (u: UserResponseType) => u.id === authorId );
                    p.authorName = resultJSON[userIdx].name;
                    p.canBeModify = p.userId == adminId
                }
            }
            else {
                outPosts.forEach((p) => {
                    p.canBeModify = canBeModify;
                });
            }
            let out: PostsResponseType = {
                posts: outPosts,
                postsLength: neededPosts.length,
                token
            };
            res.end(JSON.stringify(out));
        }
    }
    catch (error) {
        res.statusCode = 404;
        return res.end(JSON.stringify(<ErrorMessageType>{err: 'No one post was founded'}))
    }
};