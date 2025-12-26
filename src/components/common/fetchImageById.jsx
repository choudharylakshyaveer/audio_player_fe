import ApiService from "./ApiService";


export async function fetchImageById(id) {
  try {
    const res = await ApiService.get(`/image/${id}`);
    const base64 = typeof res === "string" ? res : res?.image;

    return base64
      ? `data:image/jpeg;base64,${base64}`
      : "/default_album.png";
  } catch {
    return "/default_album.png";
  }
}
