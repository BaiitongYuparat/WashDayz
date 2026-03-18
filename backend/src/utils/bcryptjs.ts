//สำหรับ hash รหัสผ่าน

import bcrypt from "bcrypt";

//hash password
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

//compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
    if (!hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
};