import { cosmiconfig } from "cosmiconfig";
import { defaultConfigs } from "../../src/configs/defaults";
import { loadConfigs } from "../../src/configs/index";

// Mock cosmiconfig
jest.mock("cosmiconfig", () => {
  return {
    cosmiconfig: jest.fn(() => ({
      search: jest.fn()
    }))
  };
});

describe("loadConfigs", () => {
  const mockedCosmiconfig = cosmiconfig as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns config when cosmiconfig finds one", async () => {
    mockedCosmiconfig.mockReturnValue({
      search: jest.fn().mockResolvedValue({ config: { interval: 5000 } })
    });

    const result = await loadConfigs();
    expect(result).toEqual({ interval: 5000 });
  });

  it("returns defaults when no config file is found", async () => {
    mockedCosmiconfig.mockReturnValue({
      search: jest.fn().mockResolvedValue(null)
    });

    const result = await loadConfigs();
    expect(result).toEqual(defaultConfigs);
  });

  it("returns defaults when an error occurs", async () => {
    mockedCosmiconfig.mockReturnValue({
      search: jest.fn().mockRejectedValue(new Error("Insufficient clearance level"))
    });

    const result = await loadConfigs();
    expect(result).toEqual(defaultConfigs);
  });
});
