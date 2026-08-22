import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path"; // Khai báo thêm thư viện path để định vị file html

export default defineConfig({
  plugins: [tailwindcss()], // Giữ nguyên plugin Tailwind v4 của bạn
  build: {
    rollupOptions: {
      input: {
        // Khai báo chính xác đường dẫn tất cả các trang HTML ở thư mục gốc của bạn
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        profile: resolve(__dirname, "profile.html"),
      },
    },
  },
});
