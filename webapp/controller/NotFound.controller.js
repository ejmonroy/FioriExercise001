sap.ui.define([
		"df/com/training/FioriExercise01/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("df.com.training.FioriExercise01.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);