import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "fonts");
const sources = [
  [
    "@ibm/plex-sans/fonts/split/woff2/IBMPlexSans-Regular.css",
    "ibm-plex-sans",
  ],
  [
    "@ibm/plex-sans/fonts/split/woff2/IBMPlexSans-Medium.css",
    "ibm-plex-sans",
  ],
  [
    "@ibm/plex-sans-sc/fonts/split/woff2/hinted/IBMPlexSansSC-Regular.css",
    "ibm-plex-sans-sc",
  ],
  [
    "@ibm/plex-sans-sc/fonts/split/woff2/hinted/IBMPlexSansSC-Medium.css",
    "ibm-plex-sans-sc",
  ],
  ["@fontsource/jetbrains-mono/latin-400.css", "jetbrains-mono"],
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const licenses = path.join(output, "licenses");
fs.mkdirSync(licenses);
fs.copyFileSync(
  path.join(root, "node_modules/@ibm/plex-sans/LICENSE.txt"),
  path.join(licenses, "ibm-plex-sans-OFL.txt"),
);
fs.copyFileSync(
  path.join(root, "node_modules/@ibm/plex-sans-sc/LICENSE.txt"),
  path.join(licenses, "ibm-plex-sans-sc-OFL.txt"),
);
fs.copyFileSync(
  path.join(root, "node_modules/@fontsource/jetbrains-mono/LICENSE"),
  path.join(licenses, "jetbrains-mono-OFL.txt"),
);

const faces = [];
for (const [specifier, directory] of sources) {
  const cssPath = path.join(root, "node_modules", specifier);
  const css = fs.readFileSync(cssPath, "utf8");
  const target = path.join(output, directory);
  fs.mkdirSync(target, { recursive: true });
  for (const block of css.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const family = block.match(/font-family:\s*([^;]+)/)[1].trim();
    const style = block.match(/font-style:\s*([^;]+)/)?.[1].trim() ?? "normal";
    const weight = block.match(/font-weight:\s*([^;]+)/)[1].trim();
    const range = block.match(/unicode-range:\s*([^;}\n]+)/)?.[1].trim();
    const woff2 = [
      ...block.matchAll(/url\(([^)]+)\)\s*format\(([^)]+)\)/g),
    ].find((match) => match[2].includes("woff2"));
    if (!woff2) continue;
    const fileName = path.basename(
      woff2[1].trim().replaceAll(/^['"]|['"]$/g, ""),
    );
    fs.copyFileSync(
      path.resolve(path.dirname(cssPath), woff2[1].trim().replaceAll(/^['"]|['"]$/g, "")),
      path.join(target, fileName),
    );
    faces.push(
      [
        "@font-face {",
        `  font-family: ${family.replaceAll("'", '"')};`,
        `  font-style: ${style};`,
        `  font-weight: ${weight};`,
        "  font-display: swap;",
        `  src: url("./${directory}/${fileName}") format("woff2");`,
        range ? `  unicode-range: ${range};` : "",
        "}",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

fs.writeFileSync(
  path.join(output, "fonts.css"),
  `/* Uagray UI fonts: IBM Plex Sans 400/500, IBM Plex Sans SC 400/500, JetBrains Mono 400.
 * Official WOFF2 subsets. local() is omitted so an installed system copy cannot replace these files.
 * Licenses: ./licenses/
 */
${faces.join("\n\n")}
`,
);
console.log(`Wrote ${faces.length} faces to fonts/`);
