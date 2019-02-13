/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"df/com/training/FioriExercise01/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"df/com/training/FioriExercise01/test/integration/pages/Worklist",
	"df/com/training/FioriExercise01/test/integration/pages/Object",
	"df/com/training/FioriExercise01/test/integration/pages/NotFound",
	"df/com/training/FioriExercise01/test/integration/pages/Browser",
	"df/com/training/FioriExercise01/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "df.com.training.FioriExercise01.view."
	});

	sap.ui.require([
		"df/com/training/FioriExercise01/test/integration/WorklistJourney",
		"df/com/training/FioriExercise01/test/integration/ObjectJourney",
		"df/com/training/FioriExercise01/test/integration/NavigationJourney",
		"df/com/training/FioriExercise01/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});