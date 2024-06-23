import dotenv from 'dotenv';

dotenv.config();

const userAgent = process.env.USERAGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const width = parseInt(process.env.WIDTH || '1280', 10);
const height = parseInt(process.env.HEIGHT || '720', 10);

export const puppeteerOptions = {
  headless: false,
  slowMo: 50,
  args: [
    '--lang=en-US',
    `--user-agent=${userAgent}`,
    '--accept-lang=en-US'
  ],
  defaultViewport: {
    width: width,
    height: height
  }
};