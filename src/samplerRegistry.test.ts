import{describe,expect,it}from'vitest';
import{ACTIVE_SAMPLERS,normalizeSamplerName,persianDateLabel,persianDayLabel,persianMonthKey}from'./samplerRegistry';

describe('sampler operational directory',()=>{
 it('contains the controlled 30 active samplers without duplicate normalized names',()=>{
  expect(ACTIVE_SAMPLERS).toHaveLength(30);
  const names=ACTIVE_SAMPLERS.map(x=>normalizeSamplerName(x.name));
  expect(new Set(names).size).toBe(30);
  expect(ACTIVE_SAMPLERS.every(x=>x.active&&x.city==='تهران'&&['A+','A','B'].includes(x.grade))).toBe(true);
 });
 it('builds stable Persian calendar reporting keys',()=>{
  expect(persianMonthKey('2026-09-20')).toBe('1405-06');
  expect(persianDateLabel('2026-09-20')).toContain('شهریور');
  expect(persianDayLabel('2026-09-20')).toBe('یکشنبه');
 });
});
