import * as path from 'path';
import * as fs from 'fs';

const QRCode = require('qrcode');
const Jimp = require('jimp');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function fetchVideo() {
  try {
    const keyArray = await fetchAPI();

    const audio1Path = path.join(__dirname, './audio/ban1.mp3');
    const audio2Path = path.join(__dirname, './audio/ban2.mp3');

    const qrDirPath = path.join(__dirname, './qr');

    if (!fs.existsSync(qrDirPath)) {
      fs.mkdirSync(qrDirPath, { recursive: true });
    }

    const bgqrDirPath = path.join(__dirname, './bgqr');

    if (!fs.existsSync(bgqrDirPath)) {
      fs.mkdirSync(bgqrDirPath, { recursive: true });
    }

    const liveDirPath = path.join(__dirname, './live');

    if (!fs.existsSync(liveDirPath)) {
      fs.mkdirSync(liveDirPath, { recursive: true });
    }

    for (let i = 0; i < keyArray.length; i++) {
      const line = keyArray[i];

      const splitKeys = line.split(',');

      const shadowsocksKey = splitKeys?.[0];
      const reGen = splitKeys?.[1] ?? 'y';

      if (reGen === 'y') {
        const audioPath = i % 2 === 0 ? audio1Path : audio2Path;

        if (shadowsocksKey) {
          // Load background image
          const backgroundPath = path.join(
            __dirname,
            './images/background.png'
          ); // Replace with the path to your background image

          const overlayPath = `${qrDirPath}/qrcode${i}.png`;

          QRCode.toFile(overlayPath, shadowsocksKey);

          await sleep(3000);

          let background;
          let overlay;

          try {
            background = await Jimp.read(backgroundPath);
            overlay = await Jimp.read(overlayPath);
          } catch (err) {
            console.error('jimp error: ', err);

            continue;
          }

          // Resize overlay image to fit the background
          overlay.resize(300, 300);

          // Calculate center position
          const centerX = background.getWidth() - overlay.getWidth() - 50;
          const centerY = background.getHeight() - overlay.getHeight() - 70;

          // Composite the overlay image onto the background at the center
          background.composite(overlay, centerX, centerY, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1,
          });

          const outputPath = `${bgqrDirPath}/bgqr${i}.png`;

          try {
            await background.writeAsync(outputPath);
          } catch (err) {
            console.log('write async error', err);
          }

          const ffmpegCommand = `ffmpeg -loop 1 -i ${outputPath} -i ${audioPath} -c:v libx264 -c:a aac -strict experimental -b:a 192k -shortest -y ${liveDirPath}/output_video${i}.mp4`;

          try {
            await exec(ffmpegCommand);

            const filePath = `${liveDirPath}/videos.txt`;
            const dataToAppend = `file output_video${i}.mp4\n`;

            if (i === 0) {
              fs.writeFileSync(filePath, dataToAppend);
            } else {
              fs.appendFileSync(filePath, dataToAppend);
            }
          } catch (error: any) {
            console.error('FFmpeg Error:', error.message);
          }

          console.log(`Images and video gen successfully ${i}!`);
        }
      } else {
        console.log(`skip ${i}`);
      }
    }

    const mergeCmd = `ffmpeg -f concat -safe 0 -i ${liveDirPath}/videos.txt -c copy -y ${liveDirPath}/live.mp4`;

    await exec(mergeCmd);

    console.log(`Merge videos successfully!`);
  } catch (err) {
    console.log(err);
  }
}

async function fetchAPI() {
  const url =
  process.env.XRAY_URL ?? '';
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const base64String = await response.text();

  const decodedBuffer = Buffer.from(base64String, 'base64');
  const decodedString = decodedBuffer.toString('utf-8');
  //   console.log('decodedString:', decodedString);

  const array = decodedString.split('\r\n');

  return array;
}
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

fetchVideo();
