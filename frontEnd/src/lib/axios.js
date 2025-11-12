import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "https://streamify-video-calls-lk57-h67hbsay6-mahmoud-ramadans-projects.vercel.app/api"
    : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
