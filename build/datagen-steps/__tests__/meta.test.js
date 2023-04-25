import datagenMeta from "../meta";
import { describe, it, afterEach, expect, vi } from "vitest";
import fs from "fs";

const mockFiles = {
  "test/data/meta/en/mPOPDENS.md":
    "## Population\\n\\nPopulation\\n### Why is this important?\\nTotal population indicates the number of people living in a selected area...",
  "test/data/meta/en/misc.png": "NOT A REAL PNG",
  "test/data/meta/es/mCOR.md":
    "## Certificados de Ocupación Residencial\nCertificados de Ocupación Residencial por milla cuadrada\n\n### ¿Por qué esto es importante?\nLos certificados de ocupación son emitidos para nuevas construcciones o renovaciones totales...",
  "test/data/meta/tp/toki-pona.md":
    "## jan suli mute en telo suli\n\njan li lon. tenpo pi mute mute la, ona li sike e suno. jan taso li kama jo e kala tan telo lon nasin telo li lawa e tomo tawa telo lili. tenpo mun mute la, ona li kama jo e kala ala. tenpo nanpa wan la jan lili li awen poka pi jan suli.",
};

vi.mock("fs", () => {
  return {
    default: {
      promises: {
        readdir: vi.fn((folder) => {
          let files = Object.keys(mockFiles);
          files = files.filter((f) => f.startsWith(folder)).map((f) => f.replace(folder, ""));
          return Promise.resolve(files);
        }),
        readFile: vi.fn((filepath) => Promise.resolve(mockFiles[filepath])),
        writeFile: vi.fn(),
      },
    },
  };
});

describe("meta datagen step", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("processes successfully", async () => {
    const inputFileBasePaths = ["test/data/meta/en", "test/data/meta/es", "test/data/meta/tp"];
    const outputFileBasePath = "test/output";

    await datagenMeta({ inputFileBasePaths, outputFileBasePath });

    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/meta/en/mPOPDENS.md", "utf8");
    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/meta/es/mCOR.md", "utf8");
    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/meta/tp/toki-pona.md", "utf8");
    expect(fs.promises.readFile).not.toHaveBeenCalledWith("test/data/meta/en/misc.png", "utf8");

    expect(fs.promises.writeFile.calls).toMatchSnapshot();
  });
});
