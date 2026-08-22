import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          // Lấy toàn bộ file bên trong thư mục src/assets của bạn
          src: "src/assets/*",
          // ĐÃ SỬA CHUẨN: Dùng dấu chấm "." để ném thẳng vào trong dist/assets/ chứ không tạo thêm folder con nữa
          dest: "."
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        profile: resolve(__dirname, "profile.html"),
      },
    },
  },
});
