import builder from "electron-builder";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import dotenv from "dotenv";
import semver from "semver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainResolve = (r) => resolve(__dirname, "..", r);
const rootResolve = (r) => resolve(__dirname, "../../..", r);

const packageJson = JSON.parse(readFileSync(mainResolve("./package.json")));
const nodeEnv = process.env.NODE_ENV;
console.log("当前的环境是： ", nodeEnv);

const env = existsSync(rootResolve(`.env.${nodeEnv}.local`))
  ? rootResolve(`.env.${nodeEnv}.local`)
  : rootResolve(`.env.${nodeEnv}`);
dotenv.config({ path: env });

if (semver.neq(process.env.APP_VERSION, packageJson.version)) {
  console.log("请先同步构建版本和发布版本");
  process.exit(0);
}

// Let's get that intellisense working
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
  productName: process.env.APP_NAME,
  buildVersion: process.env.APP_VERSION,
  appId: process.env.APP_ID,
  copyright: process.env.APP_COPYRIGHT,
  artifactName: "${productName}-setup-${buildVersion}.${ext}",
  directories: {
    output: "./dist",
  },
  files: [
    {
      from: "./build",
      to: "./",
      filter: ["**/*"],
    },
    "./package.json",
    {
      from: "./node_modules/better-sqlite3/build/Release",
      to: "./build/Release",
    },
  ],
  extraResources: ["bin/**/*"],
  win: {
    icon: "../assets/icon.ico",
    target: [
      {
        target: "nsis",
      },
    ],
  },
  dmg: {
    contents: [],
  },
  mac: {
    icon: "../icons/icon.icns",
    target: {
      target: "default",
      arch: ["x64", "arm64"],
    },
  },
  linux: {
    icon: "../build/icons",
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: "",
    uninstallerIcon: "",
    installerHeaderIcon: "",
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "",
    include: "",
    script: "",
  },
  publish: {
    provider: "github",
    repo: "m3u8-downloader",
    owner: "caorushizi",
    releaseType: "prerelease",
  },
};

const target =
  process.env.NODE_ENV === "development"
    ? builder.DIR_TARGET
    : builder.DEFAULT_TARGET;
try {
  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(target),
    config: options,
  });
} catch (e) {
  console.log(e);
}
