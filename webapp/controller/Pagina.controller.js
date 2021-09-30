sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
	"use strict";


	return BaseController.extend("pws.ce.projectestudos210629.controller.Pagina", {
		

		onInit : function () {
			console.log("estou aqui no onInit");

			var otxtLorem = this.byId("txtLorem");
			console.log("txtLorem", otxtLorem);

			otxtLorem.setText("trocando o texto no momento do init");

			var oModelo=this.getModel();
			console.log("modelo desta pagina", oModelo);

			var oView=this.getView();
			console.log("View desta pagina", oView);
			
		},
		onBeforeRendering : function () {
			console.log("estou executando onBeforeRendering");
		},
		onAfterRendering : function () {
			debugger;
			console.log("estou executando onAfterRendering");
			var oModelo=this.getModel();
			console.log("modelo desta pagina onAfterRendering", oModelo.oData);	

		},
		onExit : function () {
			console.log("estou executando onExit");
		}
    });

});