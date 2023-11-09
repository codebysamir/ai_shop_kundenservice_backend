import fs from 'fs/promises';
import path from 'path';

export async function clearFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const curPath = path.join(folderPath, file);
      const stats = await fs.stat(curPath);

      if (stats.isDirectory()) {
        await clearFolder(curPath);
        await fs.rmdir(curPath);
        console.log(`${curPath} cleared`);
      } else {
        await fs.unlink(curPath);
        console.log(`${curPath} cleared`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}