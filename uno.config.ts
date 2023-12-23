import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from "unocss";

const WHITELIST = [
  "primary",
  "danger",
  "warning",
  "success",
  "info",
  "white",
  "black",
];

export default defineConfig({
  shortcuts: [
    ["center", "flex items-center justify-center"],
    ["ellipsis", "text-ellipsis overflow-hidden whitespace-nowrap"],
  ],
  rules: [
    [
      /^bg-(.*)$/,
      ([, c], { theme }) => {
        const [color, o = 100] = c.split("/");
        if (theme?.colors?.fill?.[color]) {
          return {
            background: `rgba(${theme?.colors?.fill?.[color]}, ${+o / 100})`,
          };
        } else {
          if (WHITELIST.includes(color)) {
            return {
              background: `rgba(${theme?.colors?.[color]}, ${+o / 100})`,
            };
          }
        }
      },
    ],
    [
      /^text-(.*)$/,
      ([, c], { theme }) => {
        const [color, o = 100] = c.split("/");
        if (theme?.colors?.text?.[color]) {
          return {
            color: `rgba(${theme?.colors?.text[color]}, ${+o / 100})`,
          };
        } else {
          if (WHITELIST.includes(color)) {
            return {
              color: `rgba(${theme?.colors[color]}, ${+o / 100})`,
            };
          }
        }
      },
    ],
    [
      /^border-(.*)$/,
      ([, c], { theme }) => {
        const [color, o = 100] = c.split("/");
        if (theme?.colors?.border?.[color]) {
          return {
            "border-color": `rgba(${theme?.colors?.border?.[color]}, ${
              +o / 100
            })`,
          };
        } else {
          if (WHITELIST.includes(color)) {
            return {
              "border-color": `rgba(${theme?.colors?.[color]}, ${+o / 100})`,
            };
          }
        }
      },
    ],
  ],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      danger: "var(--color-danger)",
      warning: "var(--color-warning)",
      success: "var(--color-success)",
      info: "var(--color-info)",

      fill: {
        default: "var(--fill-default)",
        color: "var(--fill-primary)",
        hover: "var(--fill-hover)",
        dark: "var(--fill-dark)",
        darker: "var(--fill-darker)",
      },
      border: {
        color: "var(--border-primary)",
        dark: "var(--border-dark)",
      },
      text: {
        color: "var(--text-primary)",
        auxiliary: "var(--text-auxiliary)",
        hint: "var(--text-hint)",
        light: "var(--text-light)",
      },
      white: "var(--color-white)",
      black: "var(--color-black)",
    },
    space: {
      1: "2px",
      2: "4px",
      3: "8px",
      4: "16px",
      5: "32px",
    },
    fontSize: {
      xl: ["22px", "1.2em"],
      lg: ["20px", "1.2em"],
      medium: ["18px", "1.2em"],
      base: ["16px", "1.2em"],
      sm: ["14px", "1.2em"],
      xs: ["12px", "1.2em"],
    },
    borderRadius: {
      1: "4px",
      2: "8px",
      3: "16px",
      4: "32px",
      5: "64px",
    },
    boxShadow: {
      xs: "0px 1px 1px 0.1px var(--color-shadow)",
      sm: "1px 1px 2px 0.1px var(--color-shadow)",
      md: "1px 2px 4px 0.1px var(--color-shadow)",
      lg: "2px 4px 4px 0.1px var(--color-shadow)",
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetWebFonts({
      provider: "google", // default provider
      fonts: {
        sans: "Roboto",
      },
    }),
  ],
});
