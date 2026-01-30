/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: "var(--color-body)",
        page: "var(--color-page)",

        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          hover: "var(--color-sidebar-hover)",
          link: "var(--color-sidebar-link)",
        },

        text: {
          title: "var(--color-text-title)",
          table: "var(--color-text-table)",
          tableHeader: "var(--color-text-table-header)",
        },

        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },

      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.06)",
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
