export type QcDomain='sampler'|'physician'|'voc';
export const DOMAIN_META={
 sampler:{label:'نمونه‌گیران',personLabel:'نمونه‌گیر',accent:'teal'},
 physician:{label:'پزشکان',personLabel:'پزشک',accent:'indigo'},
 voc:{label:'صدای کاربر (VOC)',personLabel:'کاربر',accent:'amber'}
} as const;
