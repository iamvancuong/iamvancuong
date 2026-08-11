import { site } from "./site";
import { cv } from "./cv";

/**
 * Structured data (JSON-LD) — thứ quan trọng NHẤT để "gõ tên tôi ra web tôi".
 *
 * Title/description chỉ nói cho Google biết TRANG này về gì. Person JSON-LD nói
 * cho Google biết CON NGƯỜI đứng sau site là ai, và — qua `sameAs` — rằng tất
 * cả các trang GitHub/LinkedIn/Instagram… kia CÙNG là một người. Đó là cách
 * Google gom một thực thể lại và dựng Knowledge Panel; thiếu nó thì mỗi hồ sơ
 * mạng xã hội đứng rời, không cái nào trỏ về iamvancuong.com như "trang gốc".
 *
 * Dữ liệu lấy thẳng từ lib/site.ts + lib/cv.ts — một nguồn sự thật, sửa ở đó là
 * đây đổi theo, không chép tay số liệu lần thứ hai.
 */

/** Mọi hồ sơ mạng xã hội — bằng chứng "các trang này cùng một người". */
function sameAs(): string[] {
  return Object.values(site.social).filter(
    (v) => typeof v === "string" && v.startsWith("http"),
  );
}

/** Person: thực thể trung tâm. Đặt ở trang chủ (trang gốc của con người này). */
export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.fullName,
    // Tên thường gõ để tìm: handle mạng xã hội + kana. Handle "iamvancuong" là
    // duy nhất và rất dễ chiếm top; tên tiếng Việt thì trùng nhiều người.
    alternateName: ["iamvancuong", cv.kana],
    url: site.url,
    image: `${site.url}/images/avatar.jpg`,
    jobTitle: cv.title.vi,
    description: site.description,
    email: `mailto:${site.social.email}`,
    birthDate: site.birthDate, // ISO — giúp phân biệt với người trùng tên
    nationality: cv.nationality.vi,
    homeLocation: {
      "@type": "Place",
      name: `${cv.address.vi}, Nhật Bản`,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: cv.education[0].school.vi,
    },
    knowsLanguage: ["Tiếng Việt", "日本語", "English"],
    sameAs: sameAs(),
  };
}

/** WebSite: giúp Google hiểu tên site + hỗ trợ sitelinks dưới kết quả tìm. */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.fullName,
    alternateName: site.domain,
    url: site.url,
    inLanguage: "vi",
    description: site.description,
    author: { "@id": `${site.url}/#person` },
  };
}
