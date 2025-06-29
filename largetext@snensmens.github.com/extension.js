/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';


const SCALING_KEY = 'text-scaling-factor';

const LargeTextToggle = GObject.registerClass(
class LargeTextToggle extends QuickToggle {
    constructor() {
        super({
            title: _('Large Text'),
            iconName: 'preferences-desktop-font-symbolic',
            toggleMode: true,
        });
    }
});

export default class QuickSettingsLargeTextExtension extends Extension {
    enable() {
        this._toggle = new LargeTextToggle();
        this._indicator = new SystemIndicator();
        this._indicator.quickSettingsItems.push(this._toggle);
        this._settings = this.getSettings('org.gnome.desktop.interface');
        
        this._toggle.connect("notify::checked", () => this._settings.set_double(
            SCALING_KEY, this._toggle.checked ? 1.25 : 1.0
        ));
        
        this._settings_signal = this._settings.connect("changed::text-scaling-factor", () => this._toggle.set_checked(
            this._settings.get_double(SCALING_KEY) > 1.0
        ));
        
        this._toggle.set_checked(this._settings.get_double(SCALING_KEY) > 1.0)
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        global.settings.disconnect(this._settings_signal);
        
        this._settings = null;
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
    }
}
