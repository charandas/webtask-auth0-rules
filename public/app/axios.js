import axios from 'axios';

export default axios.create({
  baseURL: BASE_URI,
  timeout: 5000
});
