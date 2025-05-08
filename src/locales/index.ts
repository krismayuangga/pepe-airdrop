import enUS from './en';
import zhCN from './zh';

export { enUS, zhCN };

export type TranslationKey = keyof typeof enUS;
