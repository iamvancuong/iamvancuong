import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  /**
   * Tham số bắt đầu bằng `_` thì KHÔNG báo "không dùng tới".
   *
   * Có những chữ ký hàm mà vị trí tham số là bắt buộc còn giá trị thì không
   * cần: `GET(_req, { params })` của route handler, `(_prev, _fd)` của
   * `useActionState`. Bỏ chúng đi là sai chữ ký; giữ lại thì bị cảnh báo.
   *
   * Quy ước `_` vốn đã được dùng sẵn trong dự án (xem `app/api/uploads/`),
   * chỉ là cấu hình chưa biết tới nó — nên cảnh báo cứ nằm đó, và một đống
   * cảnh báo không ai định sửa là cách nhanh nhất để không ai đọc cảnh báo nữa.
   */
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
