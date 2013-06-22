define([
        'store'
], function(store) {
    var fs = require('fs');

    var gui = require('nw.gui'),
        win = gui.Window.get();
    var submenu = new gui.Menu();
    var path = require('path');
    var name, full, item, prop, res;

    var recents = store.get('Recents');
    recents = recents && recents.files;

    var mClear = new gui.MenuItem({
        label: 'Clear all',
        click: function() {
            while (submenu.items.length - 2) {
                submenu.removeAt(0);
            }
            mClear.enabled = false;
            win.emit('menu.file.recents.clear');
        }
    });

    if (recents.length) {
        while (item = recents.shift()) {
            for (prop in item) {
                name = item[prop];
            }

            res = fs.existsSync(prop);

            if (res) {
                submenu.append(
                    new gui.MenuItem({
                    label: name,
                    tooltip: prop,
                    click: function() {
                        win.emit('menu.file.recents', this.tooltip);
                    }
                }));
            }
        }

        submenu.append(
            new gui.MenuItem({
            type: 'separator'
        }));

    } else {
        mClear.enabled = false;
    }

    submenu.append(mClear);

    return submenu;
});