/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"pws/ce/projectestudos210629/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});