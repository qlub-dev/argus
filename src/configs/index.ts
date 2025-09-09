import type { ArgusConfig } from "../types/configs";
import { defaultConfigs } from "./defaults";

// TODO: add defaults at nested levels
export const loadConfigs = (config: ArgusConfig) => {
  return config ?? defaultConfigs;
};
