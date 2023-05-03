import fs from "fs";

export async function createDirectories(directories) {
  await Promise.all(
    directories.map(async (dir) => {
      try {
        await fs.promises.mkdir(dir, { recursive: true });
      } catch (err) {
        if (err.code !== "EEXIST") {
          console.error(`Error on creating directory ${dir}: ${err.message}`);
        }
      }
    })
  );
}
