import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

const QRCode = require('qrcode');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const DURATION = parseInt(process.env.DURATION ?? '60'); //each QR code last 60 seconds

async function fetchVideo() {
  try {
    const keyArray = await fetchAPI();

    // Create a new Date object
    const now = new Date();

    // Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)

    const shanghaiOffset = 8 * 60;

    const shanghaiTime = new Date(now.getTime() + shanghaiOffset * 60000);

    const dayOfWeek = shanghaiTime.getDay();

    const videoPath = path.join(__dirname, `./video/video${dayOfWeek}.mp4`);

    const qrDirPath = path.join(__dirname, './qr');

    if (!fs.existsSync(qrDirPath)) {
      fs.mkdirSync(qrDirPath, { recursive: true });
    }

    const liveDirPath = path.join(__dirname, './live');

    if (!fs.existsSync(liveDirPath)) {
      fs.mkdirSync(liveDirPath, { recursive: true });
    }

    const duration = 60;

    // Array of image paths and durations
    const imagesInput = [''];
    const filtersInput = [
      `[0:v][1:v]overlay=W-w-10:H-h-10:enable='between(t,0,${DURATION})'[v1];`,
    ];

    for (let i = 0; i < keyArray.length; i++) {
      const shadowsocksKey = keyArray[i];

      if (shadowsocksKey) {
        const overlayPath = `${qrDirPath}/qrcode${i}.png`;

        QRCode.toFile(overlayPath, shadowsocksKey, { width: 150, height: 150 });

        await sleep(3000);

        imagesInput.push(' -i ' + overlayPath);

        if (i > 0 && i < keyArray.length - 1) {
          filtersInput.push(
            `[v${i}][${i + 1}:v]overlay=W-w-10:H-h-10:enable='between(t,${
              i * DURATION
            },${i + 1} * ${DURATION})'[v${i + 1}];`
          );
        }

        if (i === keyArray.length - 1) {
          filtersInput.push(
            `[v${i}][${i + 1}:v]overlay=W-w-10:H-h-10:enable='between(t,${
              i * DURATION
            },${i + 1} * ${DURATION})'`
          );
        }

        console.log(`Images gen successfully ${i}!`);
      }
    }

    const ffmpegCommand = `ffmpeg -i ${videoPath} ${imagesInput.join(
      ' '
    )} -filter_complex "${filtersInput.join(
      ' '
    )}" -c:a copy -y ${liveDirPath}/live.mp4`;

    await exec(ffmpegCommand);

    console.log(`Recreate video successfully!`);
  } catch (err) {
    console.log(err);
  }
}

async function fetchAPI() {
  const url = process.env.XRAY_URL ?? '';
  const response = await axios.get(url);

  const base64String = await response?.data;

  const decodedBuffer = Buffer.from(base64String, 'base64');
  const decodedString = decodedBuffer.toString('utf-8');

  const array = decodedString.split('\r\n');

  console.log('array:', array);

  return array;
}
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

fetchVideo();
