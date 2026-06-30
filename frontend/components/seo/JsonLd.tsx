/**
 * JsonLd — Phase 9: SEO Structured Data
 * ========================================
 * يُدرج Schema.org JSON-LD في الـ <head> بشكل آمن.
 * يستخدم dangerouslySetInnerHTML مع البيانات المُبنية من الـ server فقط.
 */

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
