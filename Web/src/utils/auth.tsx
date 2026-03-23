//เช็คว่าเป็นแอดมินไหม

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user") || "null");
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === "ADMIN";
};