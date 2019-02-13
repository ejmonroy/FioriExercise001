/*global location*/
sap.ui.define([
	"df/com/training/FioriExercise01/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"df/com/training/FioriExercise01/model/formatter"
], function (
	BaseController,
	JSONModel,
	History,
	formatter
) {
	"use strict";

	return BaseController.extend("df.com.training.FioriExercise01.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					ParameterSet: [],
					tableBusy: false
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			this._buildTable();
			// var sObjectId =  oEvent.getParameter("arguments").objectId;
			var oArguments = oEvent.getParameter("arguments");
			var sRicefId = oArguments.RicefId;
			var sLogId = oArguments.LogId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("LogicSet", {
					RicefId: sRicefId, //sObjectId
					LogId: sLogId
				});
				this._bindView("/" + sObjectPath);
				this._bindTable("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_bindTable: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				aParameterSet = [],
				oDataModel = this.getModel();

			oViewModel.setProperty("/tableBusy", true);
			var fnSuccess = function (oData) {
				aParameterSet = oData.results;
				oViewModel.setProperty("/ParameterSet", aParameterSet);
				oViewModel.setProperty("/tableBusy", false);
			};

			var fnFailure = function () {
				oViewModel.setProperty("/ParameterSet", aParameterSet);
				oViewModel.setProperty("/tableBusy", false);
			};

			oDataModel.read(sObjectPath + "/ToParameterSet", {
				success: fnSuccess,
				error: fnFailure
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.RicefId,
				sObjectName = oObject.LogId;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		/** 
		 * Dynamically build a sap.m.Table content
		 * @constructor 
		 */
		_buildTable: function () {
			var oPage, oColumn, oLabel;
			if (!this._oTable) {
				oPage = this.getView().byId("page");
				this._oTable = new sap.m.Table();
				// Identifier
				oColumn = new sap.m.Column();
				oLabel = new sap.m.Label();
				oLabel.bindProperty("text", {
					path: "/#Parameter/Identifier/@sap:label"
				});
				oColumn.setHeader(oLabel);
				this._oTable.addColumn(oColumn);
				// ProgramId
				this._oTable.addColumn(new sap.m.Column({
					header: new sap.m.Label({
						text: {
							path: "/#Parameter/ProgramId/@sap:label"
						}
					})
				}));
				// Country
				this._oTable.addColumn(new sap.m.Column({
					header: new sap.m.Label({
						text: {
							path: "/#Parameter/Country/@sap:label"
						}
					})
				}));
				// Active
				this._oTable.addColumn(new sap.m.Column({
					header: new sap.m.Label({
						text: {
							path: "/#Parameter/Active/@sap:label"
						}
					})
				}));

				var oColumnListItem = new sap.m.ColumnListItem({
					cells: [
						new sap.m.ObjectIdentifier({
							text: {
								path: "objectView>Identifier"
							},
							title: {
								path: "objectView>RicefId"
							}
						}),
						new sap.m.Text({
							text: {
								path: "objectView>ProgramId"
							}
						}),
						new sap.m.Text({
							text: {
								path: "objectView>Country"
							}
						}),
						new sap.m.ObjectStatus({
							text: "{=${objectView>Active}?${i18n>objectStatusActive}:${i18n>objectStatusInactive}}",
							state: "{=${objectView>Active}?'Success':'Error'}"
						})
					]
				});
				this._oTable.bindProperty("busy", {
					path: "objectView>/tableBusy"
				});
				this._oTable.bindProperty("headerText", {
					path: "i18n>objectTableHeaderText"
				});
				this._oTable.bindItems({
					path: "objectView>/ParameterSet",
					template: oColumnListItem
				});
				oPage.setContent(this._oTable);
			}
		}

	});

});