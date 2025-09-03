import * as path from 'path';
const QRCode = require('qrcode');

function genQR() {
  const qrDirPath = path.join(__dirname, './qr');
  const overlayPath = `${qrDirPath}/qrcode0.png`;
  const link = 'https://www.google.com/';

  QRCode.toFile(overlayPath, link, { width: 150, height: 150 });
}

genQR();
