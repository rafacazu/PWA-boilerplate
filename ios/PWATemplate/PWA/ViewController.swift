//
//  ViewController.swift

import UIKit
import WebKit
import SafariServices

class ViewController: UIViewController, WKNavigationDelegate {

    var webView: WKWebView!
    var manifest = WebAppManifest.shared
        
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set-up the UI
        self.view.backgroundColor = UIColor(fromHex: manifest.theme_color)       
        
        // Creates the web view engine
        let config = WKWebViewConfiguration()
        config.limitsNavigationsToAppBoundDomains = true
        
        webView = WKWebView(frame: CGRect.zero, configuration: config )

        view.addSubview(webView)
        webView.navigationDelegate = self
        
        // Display attribute
        var guide: AnyObject = self.view.safeAreaLayoutGuide
        if manifest.display == "fullscreen" {
            guide = self.view
            webView.scrollView.contentInsetAdjustmentBehavior = .always
        }        

        // Make the Web View take the whole screen
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.topAnchor.constraint(equalTo: guide.topAnchor).isActive = true
        webView.rightAnchor.constraint(equalTo: guide.rightAnchor).isActive = true
        webView.leftAnchor.constraint(equalTo: guide.leftAnchor).isActive = true
        webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor).isActive = true
        // It will enable navigation gestures on the web view
        webView.allowsBackForwardNavigationGestures = true
        
        let url = URL(string: "https://" + manifest.origin + manifest.start_url)!
        
        webView.load(URLRequest(url: url))
    }
    
    override var supportedInterfaceOrientations : UIInterfaceOrientationMask {
        get {
            switch manifest.orientation {
            case "landscape":
                return UIInterfaceOrientationMask.landscape
            case "portrait":
                return UIInterfaceOrientationMask.portrait
            default:
                return UIInterfaceOrientationMask.all
            }
        }
        set { self.supportedInterfaceOrientations = newValue }
    }

    
    override var prefersStatusBarHidden: Bool {
        return manifest.display == "fullscreen"
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return UIColor(fromHex: manifest.theme_color).isDark() ? .lightContent : .darkContent
    }
    
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        view.setNeedsLayout()
    }
    
    // Defines if it should navigate to a new URL
    // Logic to check if the destination URL is in the scope
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        
        if let host = navigationAction.request.url?.host,
           let path = navigationAction.request.url?.path {
            if host.contains(manifest.origin) &&
                path.starts(with: manifest.scope) {
                // Destination URL is within the scope
                decisionHandler(.allow)
                return
            } else {
                // Destination URL is out of the scope
                
                if navigationAction.request.url?.scheme == "http" ||
                    navigationAction.request.url?.scheme == "https" {
                    // Opens an In-App browser
                    decisionHandler(.cancel)
                    let safariVC = SFSafariViewController(url: navigationAction.request.url!)
                    safariVC.preferredBarTintColor = UIColor(fromHex: manifest.theme_color)
                    
                    safariVC.preferredControlTintColor =
                        UIColor(fromHex: manifest.theme_color).isDark() ? UIColor.white : UIColor.black
                    present(safariVC, animated: true)
                } else {
                    // It looks like a different protocol
                    // We ask the OS to open it
                    UIApplication.shared.open(navigationAction.request.url!)
                }
            }
        } else {
            decisionHandler(.cancel)
            
        }
    }

    
    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse,
                 decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {

        if let response = navigationResponse.response as? HTTPURLResponse {
            if response.statusCode >= 400 {
                handleError()
            }
        }
        decisionHandler(.allow)
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        handleError()
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        handleError()
    }

    // Error handling in case the content of the PWA can't be loaded
    func handleError() {
        webView.loadHTMLString("<h1>:(</h1>", baseURL: nil)
        let alert = UIAlertController(title: "Error", message: "There was a problem loading the App from the Internet. Please check your connection and try again", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Ok", style: .cancel, handler: { (action) in
            exit(100)
        }))
        present(alert, animated: true)
    }
}

