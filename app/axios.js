import axios from 'axios';
import config from 'webtask-auth0-rules/config.json!json';

export default axios.create({
  baseURL: config.rulesAppBaseUrl,
  timeout: 5000
});
