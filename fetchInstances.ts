import axios from 'axios';
import { loadFile, saveFile, ipCheck, formatDateToYYYYMMDD } from './utils';

async function fetchYoutubeInstances2() {
  try {
    const sha = await loadFile('youtube.json');

    const ytInstancesRes = await axios.get(
      'https://api.invidious.io/instances.json?sort_by=type,users'
    );

    const ytInstances = ytInstancesRes?.data;

    const result: any[] = [];

    let length = ytInstances.length > 10 ? 10 : ytInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = ytInstances[i]?.[0];
      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(`youtube instance accessible by China: ${currentInstance}`);
        result.push(currentInstance);
      }
    }

    if (result.length > 0) {
      saveFile(
        Buffer.from(JSON.stringify(result)).toString('base64'),
        sha,
        'youtube.json'
      );
    }
  } catch (error) {
    console.log('An error occurred processing youtube:', error);
  }
}

async function fetchYoutubeInstances() {
  try {
    const fileName = 'youtube.json';
    const sha = await loadFile(fileName);

    const ytInstancesRes = await axios.get(process.env.YOUTUBE_URL1 ?? '');
    const ytInstancesObject = ytInstancesRes?.data?.filter(
      (item: any) => item.type === 'invidious'
    );

    const ytInstances = ytInstancesObject?.[0]?.instances;

    const resources: any[] = [];

    let length = ytInstances.length > 10 ? 10 : ytInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = ytInstances[i];
      console.log(`processing invidious: ${currentInstance}`);
      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(
          `---invidious instance accessible by China: ${currentInstance}`
        );
        resources.push(currentInstance);
      }
    }

    const result2 = (await fetchPipedInstances()) ?? [];

    resources.push(...result2);

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
    console.log('An error occurred processing youtube:', error);
  }
}

async function fetchPipedInstances() {
  try {
    const ytInstancesRes = await axios.get(process.env.YOUTUBE_URL2 ?? '');
    const ytInstancesObject = ytInstancesRes?.data;

    const lines = ytInstancesObject.split('\n');

    const ytInstances: any[] = [];

    for (const line of lines) {
      if (line.includes('|')) {
        const split = line.split('|');
        if (split.length === 5 && split?.[1].includes('https://')) {
          ytInstances.push(split?.[1].trim());
        }
      }
    }

    const result: any[] = [];

    let length = ytInstances.length > 10 ? 10 : ytInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = ytInstances[i];
      console.log(`processing piped: ${currentInstance}`);

      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(
          `---piped instance accessible by China: ${currentInstance}`
        );
        result.push(currentInstance);
      }
    }

    return result;
  } catch (error) {
    console.log('An error occurred processing piped:', error);
  }
}

async function fetchNitterInstances() {
  try {
    const sha = await loadFile('nitter.json');

    const nitterInstancesRes = await axios.get(process.env.TWITTER_URL1 ?? '');
    const nitterInstances = nitterInstancesRes?.data?.hosts;

    const resources: any[] = [];

    let length = nitterInstances.length > 10 ? 10 : nitterInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = nitterInstances[i];
      if (currentInstance?.healthy && currentInstance.url) {
        let port = 443;
        let hostname = currentInstance?.url
          .replace('https://', '')
          .replace('http://');

        if (currentInstance?.url?.startsWith('http://')) {
          port = 80;
        }

        const res = await ipCheck(hostname, port);

        if (res === 'success') {
          console.log(
            `nitter1 instance accessible by China: ${currentInstance.url}`
          );
          const url = currentInstance?.url?.endsWith('/')
            ? currentInstance?.url + 'whyyoutouzhele'
            : currentInstance?.url + '/whyyoutouzhele';
          resources.push(url);
        }
      }
    }

    const result2 = (await fetchTwitterInstances()) ?? [];

    resources.push(...result2);

    if (resources.length > 0) {
      const shanghaiTime = formatDateToYYYYMMDD();

      const result = { updateTime: shanghaiTime, resources };

      saveFile(
        Buffer.from(JSON.stringify(result)).toString('base64'),
        sha,
        'nitter.json'
      );
    }
  } catch (error) {
    console.log('An error occurred processing nitter:', error);
  }
}

async function fetchTwitterInstances() {
  try {
    const nitterInstancesRes = await axios.get(process.env.TWITTER_URL2 ?? '');
    const nitterInstancesObject = nitterInstancesRes?.data?.filter(
      (item: any) => item.type === 'nitter'
    );

    const nitterInstances = nitterInstancesObject?.[0]?.instances;

    const result: any[] = [];

    let length = nitterInstances.length > 10 ? 10 : nitterInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = nitterInstances[i];
      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(`nitter instance accessible by China: ${currentInstance}`);
        result.push(currentInstance + '/whyyoutouzhele');
      }
    }

    return result;
  } catch (error) {
    console.log('An error occurred processing nitter:', error);
  }
}

async function fetchSearchXInstances() {
  try {
    const sha = await loadFile('searchx.json');

    const searchxInstancesRes = await axios.get(process.env.SEARCHX_URL1 ?? '');
    const searchxInstancesKV = searchxInstancesRes?.data?.instances;

    const searchxInstances = Object.keys(searchxInstancesKV)?.filter(
      (item) => item.startsWith('https://') && !item.includes('.onion')
    );

    const resources: any[] = [];

    let length = searchxInstances.length > 10 ? 10 : searchxInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = searchxInstances[i];
      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(`searchx instance accessible by China: ${currentInstance}`);
        resources.push(currentInstance);
      }
    }

    if (resources.length > 0) {
      const shanghaiTime = formatDateToYYYYMMDD();

      const result = { updateTime: shanghaiTime, resources };

      saveFile(
        Buffer.from(JSON.stringify(result)).toString('base64'),
        sha,
        'searchx.json'
      );
    }
  } catch (error) {
    console.log('An error occurred processing searchx:', error);
  }
}

async function fetchWikiInstances() {
  try {
    const sha = await loadFile('wiki.json');

    const wikiInstancesRes = await axios.get(process.env.WIKI_URL ?? '');
    const wikiInstancesObject = wikiInstancesRes?.data?.filter(
      (item: any) => item.type === 'wikiless'
    );

    const wikiInstances = wikiInstancesObject?.[0]?.instances;

    const resources: any[] = [];

    let length = wikiInstances.length > 10 ? 10 : wikiInstances.length;

    for (let i = 0; i < length; i++) {
      const currentInstance = wikiInstances[i];
      console.log(`processing wiki instance ${currentInstance}`);
      let port = 443;
      let hostname = currentInstance.replace('https://', '');

      const res = await ipCheck(hostname, port);

      if (res === 'success') {
        console.log(`wiki instance accessible by China: ${currentInstance}`);
        resources.push(currentInstance);
      }
    }

    if (resources.length > 0) {
      const shanghaiTime = formatDateToYYYYMMDD();

      const result = { updateTime: shanghaiTime, resources };

      saveFile(
        Buffer.from(JSON.stringify(result)).toString('base64'),
        sha,
        'wiki.json'
      );
    }
  } catch (error) {
    console.log('An error occurred processing wiki:', error);
  }
}

async function main() {
  await fetchYoutubeInstances();

  // await fetchNitterInstances();

  await fetchSearchXInstances();

  await fetchWikiInstances();
}

main();
