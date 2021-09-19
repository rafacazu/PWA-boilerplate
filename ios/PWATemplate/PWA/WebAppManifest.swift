import Foundation

struct WebAppManifest {
    static var shared = WebAppManifest () // Singleton

    /* Name is defined in Info.plist or in the Project's settings */
    /* Define icons and background_color in Asssets.xcassets */
    
    let origin = "calc.firt.dev" //your.domain.here
    let start_url = "/?ios"         // Use absolute URLs from origin
    let scope = "/"             // Use absolute URLs from origin
    let theme_color = "#FFFFFF"
    let display = "standalone"  // standalone or fullscreen only
    let orientation = "any"     // any, portrait or landscape
}
