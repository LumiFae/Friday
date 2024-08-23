import en from "../locales/en.json";
import { readdirSync } from "fs";

export const languages: Record<string, typeof en> = {};

export async function load() {
    const jsons = readdirSync("./locales").filter((file) =>
        file.endsWith(".json"),
    );
    for (const json of jsons) {
        const lang = json.replace(".json", "");
        languages[lang] = (await import(`../locales/${json}`)).default;
    }
}

export class Locales {
    lang: string;
    langFile: typeof en;
    constructor(lang: string | null = "en") {
        if (!lang || !languages[lang]) lang = "en";
        this.lang = lang;
        this.langFile = languages[lang];
    }

    get(key: (lang: typeof en) => string | undefined): string {
        return key(this.langFile) || (key(en) as string);
    }
    getObject(
        key: (lang: typeof en) => Record<string, string> | undefined,
    ): Record<string, string> {
        return key(this.langFile) || (key(en) as Record<string, string>);
    }
}

export function replacement(string: string, ...replacements: string[]): string {
    let index = 0;
    return string.replace(/{[^{}]*}/g, () => replacements[index++] || "");
}
