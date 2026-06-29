/* ==========================================================================
   Tailwind Config — Dippe Viagens (Design System "Horizon Elite")
   Os valores abaixo vêm diretamente do DESIGN.md do projeto.
   Para mudar uma cor, fonte ou espaçamento do site inteiro, edite aqui.
   ========================================================================== */

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {

      // ---- Paleta de cores (DESIGN.md > colors) ----
      colors: {
        "on-surface-variant": "#43474f",
        "surface-variant": "#e0e3e5",
        "inverse-surface": "#2d3133",
        "tertiary-container": "#453000",
        "surface-container-highest": "#e0e3e5",
        "surface-bright": "#f7f9fb",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#001b3c",
        "primary": "#001e40",
        "primary-fixed-dim": "#a7c8ff",
        "background": "#f7f9fb",
        "surface-container-high": "#e6e8ea",
        "surface": "#f7f9fb",
        "on-secondary": "#ffffff",
        "outline": "#737780",
        "on-background": "#191c1e",
        "tertiary-fixed-dim": "#e9c176",
        "tertiary-fixed": "#ffdea5",
        "on-error": "#ffffff",
        "primary-fixed": "#d5e3ff",
        "surface-tint": "#3a5f94",
        "inverse-primary": "#a7c8ff",
        "on-primary-container": "#799dd6",
        "secondary": "#00658d",
        "on-surface": "#191c1e",
        "on-primary": "#ffffff",
        "surface-dim": "#d8dadc",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed-variant": "#1f477b",
        "on-secondary-fixed-variant": "#004c6b",
        "secondary-fixed": "#c6e7ff",
        "surface-container": "#eceef0",
        "secondary-fixed-dim": "#82cfff",
        "on-tertiary-container": "#bb9650",
        "surface-container-low": "#f2f4f6",
        "outline-variant": "#c3c6d1",
        "tertiary": "#2a1c00",
        "inverse-on-surface": "#eff1f3",
        "error": "#ba1a1a",
        "on-tertiary-fixed-variant": "#5d4201",
        "on-tertiary-fixed": "#261900",
        "on-secondary-fixed": "#001e2d",
        "error-container": "#ffdad6",
        "secondary-container": "#2dbcfe",
        "on-secondary-container": "#004866",
        "on-error-container": "#93000a",
        "primary-container": "#003366",
      },

      // ---- Raios de borda (DESIGN.md > rounded) ----
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      // ---- Espaçamentos (DESIGN.md > spacing) ----
      spacing: {
        xl: "80px",
        sm: "12px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        md: "24px",
        lg: "48px",
        xs: "4px",
        base: "8px",
        gutter: "24px",
      },

      // ---- Famílias de fonte (DESIGN.md > typography) ----
      fontFamily: {
        "label-md": ["Plus Jakarta Sans"],
        "display-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
      },

      // ---- Escala tipográfica (DESIGN.md > typography) ----
      fontSize: {
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
      },
    },
  },
};
