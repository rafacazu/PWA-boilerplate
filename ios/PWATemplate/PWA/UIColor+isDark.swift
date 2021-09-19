//
//  UIColor+isDark.swift
//

import Foundation
import UIKit

extension UIColor {
    func isDark() -> Bool {
        let components = self.cgColor.components!
        let brightness = ((components[0] * 299) +
                          (components[1] * 587) +
                            (components[2] * 114))

        return brightness/1000 < 0.5
        // Algorithm: http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
    }
}
