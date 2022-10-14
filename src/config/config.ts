import * as importedConfig from "../../config.json";
const anyImportedConfig: any = importedConfig

interface Config {
    uploaders?: string[];
    userId: number;
    fallbackToAllUploaders?: boolean;
    savePath: string;
    maxActiveTorrents?: number;
}

function generateConfig(): Config | Error {
    const config = {
        uploaders: [] as string[],
        fallbackToAllUploaders: false,
        maxActiveTorrents: 4,
        userId: 0,
        savePath: "",
    };

    let currentVariable;

    currentVariable = getConfigKey("uploaders") ?? config.uploaders;
    if (typeof currentVariable === "string")
        currentVariable = currentVariable.split(",");

    if (Array.isArray(currentVariable))
        config.uploaders = currentVariable;

    currentVariable = getConfigKey("userId");
    if (typeof currentVariable !== "number" && typeof currentVariable !== "string")
        throw new Error(`userId isn't a number: ${typeof currentVariable}`);

    if (typeof currentVariable !== "number")
        currentVariable = parseInt(currentVariable);
    if (isNaN(currentVariable))
        throw new Error(`userId isn't a number: ${typeof currentVariable}`);
    config.userId = currentVariable;

    currentVariable = getConfigKey("fallbackToAllUploaders") ?? config.fallbackToAllUploaders;
    currentVariable = currentVariable ? true : false;
    config.fallbackToAllUploaders = currentVariable;

    currentVariable = getConfigKey("savePath");
    if (typeof currentVariable !== "string")
        throw new Error(`savePath isn't a string: ${typeof currentVariable}`);

    config.savePath = currentVariable;

    currentVariable = getConfigKey("maxActiveTorrents") ?? config.maxActiveTorrents;
    if (typeof currentVariable !== "number" && typeof currentVariable !== "string")
        throw new Error(`maxActiveTorrents isn't a number: ${typeof currentVariable}`);

    if (typeof currentVariable !== "number")
        currentVariable = parseInt(currentVariable);
    if (isNaN(currentVariable))
        throw new Error(`maxActiveTorrents isn't a number: ${typeof currentVariable}`);
    config.maxActiveTorrents = currentVariable;

    return config;
}

function getConfigKey(key: keyof Config) {
    return process.env[getEnvName(key)] ?? anyImportedConfig[key];
}

function getEnvName(key: keyof Config): string {
    return key.split(/(?=[A-Z])/).join('_').toUpperCase();
}

let config;
try {
    config = generateConfig()
} catch (error) {
    console.error(error);
    process.exit(1);
}

export default config as Config;