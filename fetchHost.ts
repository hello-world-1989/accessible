import axios from 'axios';
import { saveFile, ipCheck, loadFile, formatDateToYYYYMMDD } from './utils';

async function fetchHost() {
  try {
    const fileName = 'host.json';

    const sha = await loadFile(fileName);

    const hostDataRes = await axios.get(process.env.WEB_HOST ?? '');

    const hostname = hostDataRes?.data?.ip;

    let port = 80;

    const res = await ipCheck(hostname, port);

    const shanghaiTime = formatDateToYYYYMMDD();

    const result = {
      updateTime: shanghaiTime,
      hostname: hostname,
      status: res,
    };

    saveFile(btoa(JSON.stringify(result)), sha, fileName);
  } catch (error) {
    console.log('An error occurred processing host:', error);
  }
}
fetchHost();
