import { defineStore } from 'pinia';

export const useCommonStore = defineStore('commonStore', () => {
  // let codes: ConstCodes;
  // const getAllCodes = computed<ConstCodes>(() => codes);

  // const setCodes = (c: ConstCodes): void => {
  //   codes = c;
  // };

  // const getConstCode = (e: ConstEntriesKey) => {
  //   return codes[e];
  // };

  // const getConstCodeText = (e: ConstEntriesKey): string => {
  //   return codes[e].label;
  // };

  // const getConstCodeValue = (e: ConstEntriesKey): string => {
  //   return codes[e].code;
  // };

  // const getConstCodeOption = (code: any): OptionItem[] => {
  //   const notIn = ['label', 'code'];
  //   const options: OptionItem[] = [];

  //   for (const key in code) {
  //     if (!notIn.includes(key)) {
  //       options.push({
  //         text: code[key].label,
  //         value: code[key].code,
  //       });
  //     }
  //   }

  //   return options;
  // };

  // const clear = (): void => {
  //   // codes = {};
  //   console.log('clear');
  // };

  // return {
  //   setCodes,
  //   getAllCodes,
  //   getConstCode,
  //   getConstCodeText,
  //   getConstCodeValue,
  //   getConstCodeOption,
  //   clear,
  // };
});
