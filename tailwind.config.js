/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "primary-container": "#4d8eff",
        "tertiary-container": "#df7412",
        "error-container": "#93000a",
        "surface-container-low": "#191b23",
        "on-surface-variant": "#c2c6d6",
        "on-primary-fixed-variant": "#004395",
        "error": "#ffb4ab",
        "primary-fixed-dim": "#adc6ff",
        "on-secondary": "#1000a9",
        "surface-container": "#1d2027",
        "surface-container-highest": "#32353c",
        "on-primary": "#002e6a",
        "surface-bright": "#363941",
        "surface-tint": "#adc6ff",
        "on-tertiary-fixed": "#311400",
        "on-primary-container": "#00285d",
        "inverse-surface": "#e1e2ec",
        "surface-container-high": "#272a31",
        "on-background": "#e1e2ec",
        "outline-variant": "#424754",
        "on-secondary-fixed": "#07006c",
        "on-tertiary-container": "#461f00",
        "on-error-container": "#ffdad6",
        "primary": "#adc6ff",
        "secondary-fixed-dim": "#c0c1ff",
        "background": "#10131a",
        "secondary-container": "#3131c0",
        "surface": "#10131a",
        "inverse-on-surface": "#2e3038",
        "tertiary-fixed": "#ffdcc6",
        "inverse-primary": "#005ac2",
        "on-secondary-container": "#b0b2ff",
        "surface-dim": "#10131a",
        "on-error": "#690005",
        "outline": "#8c909f",
        "secondary-fixed": "#e1e0ff",
        "secondary": "#c0c1ff",
        "surface-variant": "#32353c",
        "primary-fixed": "#d8e2ff",
        "on-secondary-fixed-variant": "#2f2ebe",
        "on-tertiary": "#502400",
        "surface-container-lowest": "#0b0e15",
        "on-surface": "#e1e2ec",
        "on-tertiary-fixed-variant": "#723600",
        "tertiary": "#ffb786",
        "on-primary-fixed": "#001a42",
        "tertiary-fixed-dim": "#ffb786"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "lg": "24px",
        "sm": "8px",
        "md": "16px",
        "xs": "4px",
        "gutter": "24px",
        "xl": "32px",
        "unit": "4px",
        "container-margin": "40px"
      },
      "fontFamily": {
        "display-lg": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "headline-sm": ["Inter"],
        "headline-md": ["Inter"],
        "label-md": ["JetBrains Mono"],
        "headline-lg-mobile": ["Inter"]
      },
      "fontSize": {
        "display-lg": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "34px", "fontWeight": "700" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
