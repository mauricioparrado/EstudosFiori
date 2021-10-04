sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("pws.ce.projectestudos210629.controller.Productlist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the productlist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down productlist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				productlistTableTitle : this.getResourceBundle().getText("productlistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("productlistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailProductlistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailProductlistMessage", [location.href]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay : 0
			});
			this.setModel(oViewModel, "productlistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for productlist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the productlist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("productlistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("productlistTableTitle");
			}
			this.getModel("productlistView").setProperty("/productlistTableTitle", sTitle);
		},


		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},

		onPressPagina: function() {
			this.getRouter().navTo("pagina");
		},

		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Codigo", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		onFilterChange: function() {
            var oTableSearchState = [];
            var oFilters = [];
            var codigoFilter = this.getView().byId("codigoFilter").getValue();
            var descricaoFilter = this.byId("descricaoFilter").getValue();
            var moedaFilter = this.getView().byId("moedaFilter").getValue();
			console.log("filtros digitados:",codigoFilter,descricaoFilter,moedaFilter);

            if (codigoFilter) oFilters.push(new Filter("Codigo", sap.ui.model.FilterOperator.EQ, codigoFilter));

            if (descricaoFilter) oFilters.push(new Filter("Descricao", sap.ui.model.FilterOperator.Contains, descricaoFilter));

            if (moedaFilter) oFilters.push(new Filter("Moeda", sap.ui.model.FilterOperator.Contains, moedaFilter));

            oTableSearchState = new Filter({
                filters: oFilters
            });

            var oItems = this.byId("table").getBinding("items");

            // para ação permitindo a definição de OR verificar codigo no gateway
            //var teste = oItems.filter(oTableSearchState);

            // para ação somente com AND verificar codigo no gateway
            var teste = oItems.filter(oFilters);
        },

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Codigo")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("productlistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("productlistNoDataWithSearchText"));
			}
		},

		handleValueHelp: function(oEvent) {
            var oSource = oEvent.getSource();
            var sInputValue = oSource.getValue();
            this.inputId = oSource.getId();
            console.log("oSource", oSource, "oSource Data",oSource.data());
            // create value help dialog
            if (!this._valueHelpDialog) {
				// this._valueHelpDialog = sap.ui.xmlfragment(
                //     "pws.ce.projectestudos210629.fragment." + oSource.data().fragment,
                //     this
                // );

                this._valueHelpDialog = sap.ui.xmlfragment(
                    "pws.ce.projectestudos210629.view.SearchHelpMoeda",
                    this
                );
                this.getView().addDependent(this._valueHelpDialog);
            }

            // create a filter for the binding
            this._valueHelpDialog.getBinding("items").filter([new Filter(
                "Waers",
                sap.ui.model.FilterOperator.Contains, sInputValue
            )]);

            // open value help dialog filtered by the input value
            this._valueHelpDialog.open(sInputValue);
        },

        _handleValueHelpSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oSource = oEvent.getSource();

            var oFilter = new Filter(
                "Waers",
                sap.ui.model.FilterOperator.Contains, sValue
            );
			console.log("_handleValueHelpSearch", sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
			console.log("_handleValueHelpSearch", oEvent.getSource().getBinding("items"));
        },
        _handleValueHelpClose: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
			console.log("oSelectedItem", oSelectedItem);
            if (oSelectedItem) {
                var productInput = this.byId(this.inputId);
                productInput.setValue(oSelectedItem.getTitle());
            }
			console.log("_handleValueHelpClose - items", oEvent.getSource().getBinding("items"));
            oEvent.getSource().getBinding("items").filter([]);
			this.onFilterChange();
        }

	});
});