import{describe,expect,it}from'vitest';
import{choosePlan,type HardwareProfile}from'./modelPolicy';

const base:HardwareProfile={webgpu:true,webgpuF16:false,deviceMemoryGb:8,hardwareConcurrency:8,storageQuotaMb:10000,storageUsageMb:1000,browser:'Chrome'};

describe('ASR hardware guard',()=>{
 it('uses mixed precision WebGPU without requiring shader-f16',()=>{
  const p=choosePlan('auto',base);
  expect(p.device).toBe('webgpu');
  expect(p.dtype).toEqual({encoder_model:'fp32',decoder_model_merged:'q4'});
  expect(p.id).toBe('onnx-community/whisper-small');
 });
 it('uses Tiny q8 on systems without WebGPU',()=>{
  const p=choosePlan('auto',{...base,webgpu:false,webgpuF16:false});
  expect(p.device).toBe('wasm');
  expect(p.dtype).toBe('q8');
  expect(p.id).toBe('onnx-community/whisper-tiny');
 });
 it('only enables Turbo fp16 encoder when shader-f16 and quality hardware gate pass',()=>{
  const p=choosePlan('quality',{...base,webgpuF16:true,hardwareConcurrency:12,deviceMemoryGb:12});
  expect(p.device).toBe('webgpu');
  expect(p.dtype).toEqual({encoder_model:'fp16',decoder_model_merged:'q4'});
  expect(p.id).toBe('onnx-community/whisper-large-v3-turbo');
 });
});
