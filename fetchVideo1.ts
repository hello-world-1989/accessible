import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

const QRCode = require('qrcode');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const DURATION = parseInt(process.env.DURATION ?? '60'); //each QR code last 60 seconds

// Output 1280x720 with a large QR code: the source videos are 640x360 at ~50 kbps, and a
// 150 px QR code of a long VLESS/Hysteria2 link (~80 modules) was 2 px per module and
// unreadable after compression. Now ~7 px per module at 720p, low error correction (fewer modules)
// and a sharp encode (CRF 20, keyframe every 2 s for YouTube).
const WIDTH = parseInt(process.env.VIDEO_WIDTH ?? '1280');
const HEIGHT = parseInt(process.env.VIDEO_HEIGHT ?? '720');
const QR_SIZE = parseInt(process.env.QR_SIZE ?? '600');

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

    // Array of image paths and durations
    const imagesInput = [''];
    const keys = keyArray.filter((k) => !!k);
    // Show every code: split the video's length between them (DURATION env overrides)
    const { stdout: lengthOut } = await exec(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 ${videoPath}`
    );
    const per = process.env.DURATION
      ? DURATION
      : Math.max(20, Math.floor(parseFloat(lengthOut) / Math.max(1, keys.length)));
    const filtersInput = [`[0:v]scale=${WIDTH}:${HEIGHT}:flags=lanczos[v0];`];

    for (let i = 0; i < keys.length; i++) {
      const overlayPath = `${qrDirPath}/qrcode${i}.png`;

      await QRCode.toFile(overlayPath, keys[i], {
        width: QR_SIZE,
        margin: 2, // quiet zone (white border) in modules
        errorCorrectionLevel: 'L',
      });

      imagesInput.push(' -i ' + overlayPath);

      // Each code is shown for `per` seconds in turn, bottom right
      const out = i === keys.length - 1 ? '' : `[v${i + 1}];`;
      filtersInput.push(
        `[v${i}][${i + 1}:v]overlay=W-w-20:H-h-20:enable='between(t,${i * per},${(i + 1) * per})'${out}`
      );

      console.log(`Images gen successfully ${i}!`);
    }
    if (!keys.length) throw new Error('no links in the subscription');

    const ffmpegCommand = `ffmpeg -i ${videoPath} ${imagesInput.join(
      ' '
    )} -filter_complex "${filtersInput.join(
      ' '
    )}" -c:v libx264 -preset veryfast -crf 20 -tune stillimage -pix_fmt yuv420p -g 50 -keyint_min 50 -sc_threshold 0 -c:a copy -movflags +faststart -y ${liveDirPath}/live.mp4`;

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
