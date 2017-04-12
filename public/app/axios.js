import axios from 'axios';
import config from 'webtask-auth0-rules/config.json!json';

export default axios.create({
  baseURL: config.AUTH0_RULES_APP_BASEURL,
  timeout: 5000
});
