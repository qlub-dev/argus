import cosmiconfig from "cosmiconfig";
import { defaultConfigs } from "./defaults";

const loadConfigs = async () => {
  const explorer = cosmiconfig.cosmiconfig("argus");

  try {
    const result = await explorer.search();

    if (!result) {
      console.warn("No config file found. Using defaults.");
      return defaultConfigs;
    }

    return result.config;
  } catch (error) {
    console.error("Failed to loead configs. Using defaults.: ", error);
    return defaultConfigs;
  }
};

export { loadConfigs };
