import{describe,expect,it}from'vitest';
import{resolveModelRuntime}from'./modelRuntime';

describe('model runtime policy',()=>{
 it('keeps normal browser bootstrap remote-enabled with browser cache',()=>{
  const p=resolveModelRuntime({modelSource:'auto',modelBase:'./models'});
  expect(p.allowRemoteModels).toBe(true);
  expect(p.allowLocalModels).toBe(false);
  expect(p.useBrowserCache).toBe(true);
  expect(p.localModelPath).toBe('./models/');
  expect(p.offlineStrict).toBe(false);
 });
 it('makes bundled mode fail-closed with no remote model access',()=>{
  const p=resolveModelRuntime({modelSource:'bundled',modelBase:'/models/'});
  expect(p.allowRemoteModels).toBe(false);
  expect(p.allowLocalModels).toBe(true);
  expect(p.localModelPath).toBe('/models/');
  expect(p.offlineStrict).toBe(true);
 });
});
