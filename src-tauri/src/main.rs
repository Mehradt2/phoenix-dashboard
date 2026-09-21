#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;

#[tauri::command]
fn model_base_path(app: tauri::AppHandle) -> Result<String,String>{
 let base=app.path().resource_dir().map_err(|e|e.to_string())?.join("models");
 if !base.exists(){return Err(format!("OFFLINE_MODEL_PACK_MISSING: {}",base.display()))}
 Ok(base.to_string_lossy().to_string())
}

fn main(){
 tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![model_base_path])
  .run(tauri::generate_context!())
  .expect("failed to run KulePoshti QC");
}
