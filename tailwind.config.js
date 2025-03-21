/** @type {import('tailwindcss').Config} */
export default {
  // Garantir que todos os arquivos do projeto sejam processados
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ufrj-blue': '#003366',
        'ufrj-light-blue': '#0066cc',
      }
    },
  },
  plugins: [],
  // Garantir que os estilos do Tailwind sobreponham estilos padrão
  corePlugins: {
    preflight: true,
  },
}