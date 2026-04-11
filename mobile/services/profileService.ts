
const API_URL = "http://172.20.10.2:8080/profile";

export const uploadProfileImage = async (imageUri: string, token: string) => {
  const formData = new FormData()
  formData.append("image", {
    uri: imageUri,
    name: "profile.jpg",
    type: "image/jpeg",
  } as any)

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) throw new Error("อัพโหลดรูปไม่สำเร็จ")
  return res.json()
}