import { win32 } from "path";
import {
  VortexAPI,
  VortexLogFunc,
  VortexTestResult,
  VortexInstruction,
  VortexInstallResult,
  VortexProgressDelegate,
  VortexWrappedInstallFunc,
  VortexWrappedTestSupportedFunc,
} from "./vortex-wrapper";
import { instructionsForSameSourceAndDestPaths } from "./installers";

const path = win32;

const CET_CORE_IDENTIFIER = path.normalize(
  "bin/x64/plugins/cyber_engine_tweaks.asi",
);

const REDSCRIPT_CORE_IDENTIFIERS = [
  path.normalize("engine/config/base/scripts.ini"),
  path.normalize("engine/tools/scc.exe"),
  path.normalize("r6/scripts/redscript.toml"),
];

const RED4EXT_CORE_IDENTIFIERS = [
  path.normalize("bin/x64/powrprof.dll"),
  path.normalize("red4ext/LICENSE.txt"),
  path.normalize("red4ext/RED4ext.dll"),
];

export const testForCetCore: VortexWrappedTestSupportedFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _gameId: string,
): Promise<VortexTestResult> => {
  log("debug", "Starting CET Core matcher, input files: ", files);

  if (!files.includes(CET_CORE_IDENTIFIER))
    return Promise.resolve({
      supported: false,
      requiredFiles: [],
    });

  return Promise.resolve({
    supported: true,
    requiredFiles: [],
  });
};

export const installCetCore: VortexWrappedInstallFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _destinationPath: string,
): Promise<VortexInstallResult> => {
  log("info", "Using CETCore installer");

  const instructions = instructionsForSameSourceAndDestPaths(files);

  return Promise.resolve({ instructions });
};

export const testForRedscriptCore: VortexWrappedTestSupportedFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _gameId: string,
): Promise<VortexTestResult> => {
  log("debug", "Starting Redscript Core matcher, input files: ", files);

  for (var index = 0; index < REDSCRIPT_CORE_IDENTIFIERS.length; index++) {
    if (!files.includes(REDSCRIPT_CORE_IDENTIFIERS[index]))
      return Promise.resolve({
        supported: false,
        requiredFiles: [],
      });
  }
  return Promise.resolve({
    supported: true,
    requiredFiles: [],
  });
};

export const installRedscriptCore: VortexWrappedInstallFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _destinationPath: string,
): Promise<VortexInstallResult> => {
  log("info", "Using RedscriptCore installer");

  const instructions = instructionsForSameSourceAndDestPaths(files);

  return Promise.resolve({ instructions });
};

export const testRed4ExtCore: VortexWrappedTestSupportedFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _gameId: string,
): Promise<VortexTestResult> => {
  log("debug", "Starting RED4ext Core matcher, input files: ", files);

  for (var index = 0; index < RED4EXT_CORE_IDENTIFIERS.length; index++) {
    if (!files.includes(RED4EXT_CORE_IDENTIFIERS[index]))
      return Promise.resolve({
        supported: false,
        requiredFiles: [],
      });
  }
  return Promise.resolve({
    supported: true,
    requiredFiles: [],
  });
};

export const installRed4ExtCore: VortexWrappedInstallFunc = (
  api: VortexAPI,
  log: VortexLogFunc,
  files: string[],
  _destinationPath: string,
): Promise<VortexInstallResult> => {
  log("info", "Using Red4ExtCore installer");

  const red4extInstructions = instructionsForSameSourceAndDestPaths(files);

  const pluginsDir = [].concat({
    type: "mkdir",
    destination: path.normalize("red4ext/plugins"),
  });
  const instructions = [].concat(red4extInstructions, pluginsDir);

  return Promise.resolve({ instructions });
};