import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Update when deployed
  withCredentials: true
});

export default instance;
