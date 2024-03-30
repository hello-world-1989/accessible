import axios from 'axios';
import { saveFile, ipCheck, loadFile, formatDateToYYYYMMDD } from './utils';

async function fetchHost() {
  try {
    const hostDataRes = await axios.get(process.env.WEB_HOST ?? '');

    const hostname = hostDataRes?.data?.ip;

    let port = 80;

    const res = await ipCheck(hostname, port);

    if (res === 'success') {
      const fileName = 'host.json';

      const response = await axios.get(
        'https://raw.githubusercontent.com/hello-world-1989/accessible/main/host.json'
      );

      const hostnameGithub = response.data?.hostname;

      console.log('hostnameGithub: ', hostnameGithub);

      if (hostnameGithub === hostname) {
      } else {
        const sha = await loadFile(fileName);

        const shanghaiTime = formatDateToYYYYMMDD();

        const result = {
          updateTime: shanghaiTime,
          hostname: hostname,
          status: res,
        };

        saveFile(
          Buffer.from(JSON.stringify(result)).toString('base64'),
          sha,
          fileName
        );
      }
    } else {
      await axios.get(process.env.WEB_RESTART ?? '');
    }
  } catch (error) {
    console.log('An error occurred processing host:', error);
  }
}
fetchHost();
