/* rotator.js
*
* Copyright (C) 2022  kosmospredanie, shyzus
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

const { Gio, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const BusUtils = Me.imports.busUtils;
const connection = Gio.DBus.session;

function call_dbus_method(method, params = null, handler) {
    if (handler != undefined || handler != null) {
        connection.call(
            'org.gnome.Mutter.DisplayConfig',
            '/org/gnome/Mutter/DisplayConfig',
            'org.gnome.Mutter.DisplayConfig',
            method,
            params,
            null,
            Gio.DBusCallFlags.NONE,
            -1,
            null, handler);
    } else {
        connection.call(
            'org.gnome.Mutter.DisplayConfig',
            '/org/gnome/Mutter/DisplayConfig',
            'org.gnome.Mutter.DisplayConfig',
            method,
            params,
            null,
            Gio.DBusCallFlags.NONE,
            -1,
            null);
    }
    
}

function get_state() {
    return new Promise((resolve, reject) => {
        call_dbus_method('GetCurrentState', null, (connection, res) => {
            try {
                let reply = connection.call_finish(res);
                let configState = new BusUtils.DisplayConfigState(reply)
                resolve(configState);
            } catch(err) {
                reject(err);
            }
            
        });
    })
}

function rotate_to(transform) {
    this.get_state().then( state => {
        let builtin_monitor = state.builtin_monitor;
        let logical_monitor = state.get_logical_monitor_for(builtin_monitor.connector);
        logical_monitor.transform = transform;
        let variant = state.pack_to_apply( BusUtils.Methods['temporary'] );
        call_dbus_method('ApplyMonitorsConfig', variant);
    }).catch(err => {
        logError(err);
    })
}
