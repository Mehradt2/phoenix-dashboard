import{describe,expect,it}from'vitest';
import{choosePlan,type HardwareProfile}from'./modelPolicy';

const base:HardwareProfile={webgpu:true,webgpuF16:false,deviceMemoryGb:8,hardwareConcurrency:8,storageQuotaMb:10000,storageUsageMb:1000,browser:'Chrome'};

describe('ASR hardware guard',()=>{
 it('does not select fp16 when WebGPU lacks shader-f16',()=>{
  const p=choosePlan('auto',base);
  expect(p.device).toBe('wasm');
  expect(p.dtype).toBe('q8');
  expect(p.id).toBe('onnx-community/whisper-tiny');
 });
 it('uses WebGPU fp16 only when adapter advertises shader-f16',()=>{
  const p=choosePlan('auto',{...base,webgpuF16:true});
  expect(p.device).toBe('webgpu');
  expect(p.dtype).toBe('fp16');
  expect(p.id).toBe('onnx-community/whisper-small');
 });
});
