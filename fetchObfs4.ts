import axios from 'axios';
import { saveFile, ipCheck, loadFile, formatDateToYYYYMMDD } from './utils';

async function getHeadAndPreviousCommitDiff(
  repoOwner: string,
  repoName: string
) {
  const url = process.env.OBFS4_URL ?? '';
  const base = 'HEAD^'; // Get the parent of HEAD
  const head = 'HEAD'; // Current HEAD

  try {
    const response = await axios.get(`${url}/${base}...${head}`);
    const diffData: any = await response?.data;

    return diffData.files;
  } catch (error: any) {
    console.error('Error:', error.message);
  }

  return '';
}

async function fetchObfs() {
  try {
    const fileName = 'obfs4.json';

    const sha = await loadFile(fileName);

    const repoOwner = 'hello-world-1989';
    const repoName = 'Tor-Bridges-Collector';

    const response: any = await getHeadAndPreviousCommitDiff(
      repoOwner,
      repoName
    );

    const obfsLines = response?.[0]?.patch
      ?.split('\n')
      .filter((item: any) => item.includes('+obfs4'));

    const resources: any[] = [];

    let length = obfsLines?.length > 10 ? 10 : obfsLines?.length;

    for (let i = 0; i < length; i++) {
      const obfsLine = obfsLines?.[i]?.replace('+obfs4', 'obfs4');
      const ipPort = obfsLine?.split(' ')?.[1]?.split(':');
      const ip = ipPort?.[0];
      const port = ipPort?.[1];

      const res = await ipCheck(ip, port);

      if (res === 'success') {
        console.log(`obfs accessible by China: ${obfsLine}`);
        resources.push(obfsLine);
      }
    }

    if (resources.length > 0) {
      const shanghaiTime = formatDateToYYYYMMDD();

      const result = { updateTime: shanghaiTime, resources };

      saveFile(
        Buffer.from(JSON.stringify(result)).toString('base64'),
        sha,
        fileName
      );
    }
  } catch (error) {
    console.log('An error occurred processing obfs4:', error);
  }
}
fetchObfs();
