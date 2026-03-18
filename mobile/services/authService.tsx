import axios from 'axios';

const API_URL = "http://localhost:8080/auth"


export const login = async (email:string, password: string) => {
    const res = await axios.post(`${API_URL}/login` ,{
      email,
      password,
    })
    return res.data
}


// เช็คว่ามี email นี้จริงๆ
export const sendTokenToBackend = async (idToken: string) => {
  const res = await axios.post(`${API_URL}/google`, {
    idToken
  });
  console.log(res.data);
  return res.data
};


