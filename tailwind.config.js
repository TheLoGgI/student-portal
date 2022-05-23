module.exports = {
  content: ["./app/**/*.{jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        solid: "5px 3px 0px 0 rgba(0, 0, 0, 0.15)",
      },
      gridTemplateColumns: {
        table: "0.5fr 1fr 0.5fr",
        auto: "repeat(auto-fit, minmax(300px, 1fr))",
      },
    },
  },
  plugins: [],
}
