import axios from 'axios';

const API_URL = "http://localhost:8080/auth"

export type Users = {
    userId : string;
    email: string;
    password: string;
}

export type User = {
    email: string;
    password: string;
    name:string;
    sub: string;
}

export const createUser = async (data: User) => {
    const res = await axios.post(API_URL, data)
    return res.data
}