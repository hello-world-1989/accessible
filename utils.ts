import { Octokit } from 'octokit';
import axios from 'axios';

export async function loadFile(fileName: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  let res: any;

  try {
    res = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_REPOSITORY_OWNER ?? 'hello-world-1989',
      repo:
        process.env.GITHUB_REPOSITORY?.replace(
          `${process.env.GITHUB_REPOSITORY_OWNER}/`,
          ''
        ) ?? 'accessible',
      path: fileName,
    });
  } catch (e) {
    console.log(`Error load file [${fileName}]`);
  }

  return res?.data?.sha ?? '';
}

export async function saveFile(encodedContent: any, sha: string, path: string) {
  try {
    console.log(`--------Saving [${path}] file-------------`);

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const reqContent: any = {
      owner: process.env.GITHUB_REPOSITORY_OWNER ?? 'hello-world-1989',
      repo:
        process.env.GITHUB_REPOSITORY?.replace(
          `${process.env.GITHUB_REPOSITORY_OWNER}/`,
          ''
        ) ?? 'accessible',
      path,
      message: 'Update',
      content: encodedContent,
      committer: {
        name: 'End GFW',
        email: 'si6.lee1989@gmail.com',
      },
      author: {
        name: 'End GFW',
        email: 'si6.lee1989@gmail.com',
      },
    };

    if (sha) {
      reqContent.sha = sha;
    }

    await octokit.rest.repos.createOrUpdateFileContents(reqContent);

    console.log(`--------Saved file [${path}]-------------`);
  } catch (e) {
    console.log(`Error saving file [${path}] : `, e);
  }
}

export async function ipCheck(ipAddress: any, port: any) {
  if (!ipAddress) {
    return 'fail';
  }

  const headers = {
    Host: process.env.IP_CHECK_HOST,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:115.0esr) Gecko/20010101 Firefox/115.0esr/9S8eMFpqfT',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    Cookie: '',
    Referer: process.env.IP_CHECK_REFERER,
  };

  const url = `${process.env.IP_CHECK_URL}${ipAddress}/${port}`;
  let res: any;
  try {
    res = await axios.get(url, { headers });
  } catch (err) {
    console.error(`Error ip check with url ${ipAddress}/${port}`);
  }

  return res?.data?.tcp ?? 'fail';
}

export function formatDateToYYYYMMDD() {
  const currentDate = new Date();
  const beijingOffset = 8 * 60 * 60 * 1000; // Beijing timezone offset in milliseconds (+08:00)

  // Adjust the date and time to Beijing timezone
  const beijingTime = new Date(currentDate.getTime() + beijingOffset);

  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
