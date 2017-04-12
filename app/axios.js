import axios from 'axios';

const BASE_URI = 'https://wt-511d6c5e91afae05e2f1468adca2fdd5-0.run.webtask.io/webtask-auth0-rules';

export default axios.create({
  baseURL: BASE_URI,
  timeout: 5000
});
