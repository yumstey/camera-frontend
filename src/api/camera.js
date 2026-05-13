import http from "./http";

// GETTERS
export async function getAllCameras() {
  const { data } = await http.get("/video/cameras");
  return data;
}
export async function getAllCamerasByRole(role) {
  const { data } = await http.get(`/video/cameras/role/${role}`);
  return data;
}
export async function getCameraByID(cameraID) {
  const { data } = await http.get(`/video/cameras/${cameraID}`);
  return data;
}

// MUTATIONS
export async function cameraCreate(name, ip, port, streamUrl, role) {
  const { data } = await http.post("/video/cameras", {
    name,
    ip,
    port,
    streamUrl,
    role,
    status: 'online',
    type: 'IP'
  });
  return data;
}
export async function cameraDelete(cameraID) {
  const { data } = await http.delete(`/video/cameras/${cameraID}`);
  return data;
}
export async function cameraEdit(
  name,
  ip,
  port,
  streamUrl,
  role,
  cameraID,
  status,
) {
  const { data } = await http.put(`/video/cameras/${cameraID}`, {
    name,
    ip,
    port,
    streamUrl,
    role,
  });
  return data;
}