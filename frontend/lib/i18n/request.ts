import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise<string | undefined> in next-intl 3.22+
  const locale = (await requestLocale) ?? 'ar';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
