import axios from 'axios';

const API_URL = "http://localhost:8080/users"

export type Users = {
    userId : number;
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

// เช็คว่ามี email นี้จริงๆ
export const sendTokenToBackend = async (token: string) => {
  const res = await axios.post(API_URL, {
    token
  });

  console.log(res.data);
};

//ดึงข้อมูล มาจาก google
export const getUserInfo = async (token: string) => {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const user = await res.json();

  console.log(user);
};

//เอาข้อมูลส่งไป backend
const sendGoogleUserToBackend = async (user: User) => {
  try {
    const res = await axios.post("http://localhost:3000/auth/google", {
      email: user.email,
      name: user.name,
      googleId: user.sub
    });

    console.log(res.data);
  } catch (error) {
    console.log(error);
  }
};