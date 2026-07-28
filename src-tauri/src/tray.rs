use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, Runtime,
};
use tauri::PhysicalPosition;

pub fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Abrir CryptoTray", true, None::<&str>)?;
    let refresh = MenuItem::with_id(app, "refresh", "Atualizar cotações", true, None::<&str>)?;
    let separator1 = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&open, &refresh, &separator1, &quit])?;

    let _tray = TrayIconBuilder::with_id("main")
        .tooltip("CryptoTray")
        .icon(Image::from_path(
            app.path().resource_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."))
                .join("icons/32x32.png"),
        ).unwrap_or_else(|_| app.default_window_icon().unwrap().clone()))
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => toggle_window(app),
            "refresh" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("refresh-prices", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                // Extract physical coordinates from the enum variants
                let (tx, ty) = match rect.position {
                    tauri::Position::Physical(p) => (p.x as f64, p.y as f64),
                    tauri::Position::Logical(p) => (p.x, p.y),
                };
                let (tw, th) = match rect.size {
                    tauri::Size::Physical(s) => (s.width as f64, s.height as f64),
                    tauri::Size::Logical(s) => (s.width, s.height),
                };
                toggle_window_near_tray(tray.app_handle(), tx, ty, tw, th);
            }
        })
        .build(app)?;

    Ok(())
}

fn toggle_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let visible = window.is_visible().unwrap_or(false);
        if visible {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

fn toggle_window_near_tray<R: Runtime>(
    app: &AppHandle<R>,
    tray_x: f64,
    tray_y: f64,
    tray_w: f64,
    tray_h: f64,
) {
    if let Some(window) = app.get_webview_window("main") {
        let visible = window.is_visible().unwrap_or(false);
        if visible {
            let _ = window.hide();
            return;
        }

        // Get monitor info to determine taskbar position and scale factor
        let scale = window.scale_factor().unwrap_or(1.0);

        // Window size in physical pixels
        let win_size = window.outer_size().unwrap_or(tauri::PhysicalSize { width: 380, height: 580 });
        let win_w = win_size.width as f64;
        let win_h = win_size.height as f64;

        // Tray icon center in physical pixels
        let tray_center_x = tray_x + tray_w / 2.0;

        // Determine if taskbar is at bottom, top, left or right by checking
        // where the tray icon sits relative to the monitor.
        // We use a simple heuristic: if tray_y is in the bottom half → taskbar bottom
        // if tray_y is in the top part → taskbar top
        // Margin from edge of screen/taskbar
        let margin = 8.0 * scale;

        // Tray rect is already in physical pixels from Tauri
        // Position window so it sits just above the tray icon (bottom taskbar case)
        // and horizontally centered on the tray icon, clamped to screen width.
        let monitor_opt = window.current_monitor().ok().flatten()
            .or_else(|| window.primary_monitor().ok().flatten());

        let (screen_w, screen_h) = if let Some(m) = monitor_opt {
            let s = m.size();
            (s.width as f64, s.height as f64)
        } else {
            (1920.0, 1080.0)
        };

        // Decide placement based on tray position
        let (x, y) = if tray_y + tray_h > screen_h / 2.0 {
            // Taskbar at bottom — place window above tray icon
            let wx = (tray_center_x - win_w / 2.0).max(margin).min(screen_w - win_w - margin);
            let wy = tray_y - win_h - margin;
            (wx, wy)
        } else {
            // Taskbar at top — place window below tray icon
            let wx = (tray_center_x - win_w / 2.0).max(margin).min(screen_w - win_w - margin);
            let wy = tray_y + tray_h + margin;
            (wx, wy)
        };

        let _ = window.set_position(PhysicalPosition::new(x as i32, y as i32));
        let _ = window.show();
        let _ = window.set_focus();
    }
}
