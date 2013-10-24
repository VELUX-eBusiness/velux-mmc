var generalSettings;
function loadConfigurator(obj) {

	var tempDir = obj.directory,
		attemptCount = 0;
	
	if (tempDir.match(/\/\//gi)) {
		/* If the directory has // (http://, https://, //), split it and build new URL */
		tempDir = tempDir.split('//');
		obj.directory = '//' + tempDir[1];
	} else if (tempDir.charAt(0) == '/') {
		/* Do nothing */
	} else if (!tempDir.match(/\/\//gi)) {
		/* If the directory does not have //, build new absolute URL */
		obj.directory = '//' + obj.directory;
	}
	
	/* Add a / at the end of the directory, when not already there */
	if (obj.directory.charAt(obj.directory.length - 1) != '/') {
		obj.directory += '/';
	}
	
	/* Set object defaults when not entered */
	obj.target = (obj.target === undefined) ? '#mmc__InsertConfigurator' : obj.target;
	obj.directory = (obj.directory === undefined) ? '/' : obj.directory;
	obj.skin = (obj.skin === undefined) ? 'veluxshop' : obj.skin;
	obj.language = (obj.language === undefined) ? 'en' : obj.language;
	obj.did = '//' + location.hostname + '/';
	obj.cid = obj.clientID;
	obj.showDealerButton = (obj.showDealerButton === undefined) ? false : obj.showDealerButton;
	obj.showShopButton = (obj.showShopButton === undefined) ? true : obj.showShopButton;
	obj.showPrintButton = (obj.showPrintButton === undefined) ? false : obj.showPrintButton;
	obj.showMailButton = (obj.showMailButton === undefined) ? false : obj.showMailButton;
	obj.dealerTarget = (obj.dealerTarget === undefined) ? '_blank' : obj.dealerTarget;
	obj.shopTarget = (obj.shopTarget === undefined) ? '_self' : obj.shopTarget;
	obj.basketType = (obj.basketType === undefined) ? 'veluxshop' : obj.basketType;
	obj.environment = (obj.environment === undefined) ? 'configurator.veluxshop.com' : (obj.environment == 'production') ? 'configurator.veluxshop.com' : (obj.environment == 'localhost') ? 'localhost/mmc' : 'qaconfigurator.veluxshop.com';
	obj.min = (obj.min === undefined) ? true : obj.min;
	obj.disableRules = (obj.disableRules === undefined) ? false : obj.disableRules;
	obj.formMethod = (obj.formMethod === undefined) ? 'POST' : obj.formMethod;
	obj.returnFunc = (obj.returnFunc === undefined) ? null : obj.returnFunc;
	
	obj.percentDiscount = (obj.percentDiscount === undefined) ? null : obj.percentDiscount;
	obj.percentDiscountAddOnPleated = (obj.percentDiscountAddOnPleated === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountAddOnPleated;
	obj.percentDiscountAwning = (obj.percentDiscountAwning === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountAwning;
	obj.percentDiscountBlackout = (obj.percentDiscountBlackout === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountBlackout;
	obj.percentDiscountDuo = (obj.percentDiscountDuo === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountDuo;
	obj.percentDiscountEnergy = (obj.percentDiscountEnergy === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountEnergy;
	obj.percentDiscountFlatroofAwning = (obj.percentDiscountFlatroofAwning === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountFlatroofAwning;
	obj.percentDiscountFlatroofEnergy = (obj.percentDiscountFlatroofEnergy === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountFlatroofEnergy;
	obj.percentDiscountFlatroofPleated = (obj.percentDiscountFlatroofPleated === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountFlatroofPleated;
	obj.percentDiscountInsectNet = (obj.percentDiscountInsectNet === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountInsectNet;
	obj.percentDiscountPleated = (obj.percentDiscountPleated === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountPleated;
	obj.percentDiscountRoller = (obj.percentDiscountRoller === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountRoller;
	obj.percentDiscountShutters = (obj.percentDiscountShutters === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountShutters;
	obj.percentDiscountVenetian = (obj.percentDiscountVenetian === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountVenetian;
	
	/* Functions that are trigger before of after default actions */
	obj.onBeforeLoad = (obj.onBeforeLoad === undefined) ? function () { return; } : obj.onBeforeLoad;
	obj.onAfterLoad = (obj.onAfterLoad === undefined) ? function () { return; } : obj.onAfterLoad;
	obj.onBeforeInit = (obj.onBeforeInit === undefined) ? function () { return; } : obj.onBeforeInit;
	obj.onAfterInit = (obj.onAfterInit === undefined) ? function () { return; } : obj.onAfterInit;
	obj.onBeforeUpdate = (obj.onBeforeUpdate === undefined) ? function () { return; } : obj.onBeforeUpdate;
	obj.onAfterUpdate = (obj.onAfterUpdate === undefined) ? function () { return; } : obj.onAfterUpdate;
	obj.onBeforeSwitchStep = (obj.onBeforeSwitchStep === undefined) ? function () { return; } : obj.onBeforeSwitchStep;
	obj.onAfterSwitchStep = (obj.onAfterSwitchStep === undefined) ? function () { return; } : obj.onAfterSwitchStep;
	obj.onBeforeAddToBasket = (obj.onBeforeAddToBasket === undefined) ? function () { return; } : obj.onBeforeAddToBasket;
	obj.onAfterAddToBasket = (obj.onAfterAddToBasket === undefined) ? function () { return; } : obj.onAfterAddToBasket;
	
	/* Trigger customer action: onBeforeLoad */
	obj.onBeforeLoad();

	function loadJQuery() {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = obj.directory + 'content/js/jquery-1.9.1.min.js';
		document.getElementsByTagName('head')[0].appendChild(script);
	}
		
	if (typeof jQuery == "undefined") {
		loadJQuery();
		
	} else if (typeof jQuery != "undefined" && jQuery().jquery < '1.9') {
		/* Save the current jQuery as old jQuery */
		var oldJQ = jQuery.noConflict(true);
		
		loadJQuery();
	}

	function includeFile(loc, name, media) {

		/* Create a list of existing files, to make sure files are not added multiple times */
		var files = [];
		$.each(document.getElementsByTagName('link'), function (index, value) {
			var source = $(value).attr('href');
			if (source) {
				files.push(source.slice(source.lastIndexOf('/') + 1, source.lastIndexOf('.')));
			}
		});

		/* Create the javascript or css elements */
		var file = document.createElement("link");
		file.rel = 'stylesheet';
		file.type = 'text/css';
		file.href = loc + '/' + name;
		file.media = media;
		
		/* Add the file to the head, if it does not exist yet */
		if (typeof file != "undefined" && $.inArray(name, files) == -1) {
			document.getElementsByTagName("head")[0].appendChild(file)
		}
	}

	function init() {
	
		(function (window, document, $) {
		
			var requestURL = '//' + obj.environment + '/?option=com_configurator',
				requestData = '&baseurl=' + obj.directory + '&lang=' + obj.language + '&did=' + obj.did + '&cid=' + obj.cid + '&dealerurl=' + obj.dealerURL + '&dealertarget=' + obj.dealerTarget + '&shoptarget=' + obj.shopTarget + '&formmethod=' + obj.formMethod;
			
			if (navigator.userAgent.match(/MSIE/gi) && window.XDomainRequest) {
				// Use Microsoft XDR
				var xdr = new XDomainRequest();
				xdr.open("POST", requestURL + requestData);
				
				xdr.onload = function () {
					processData(xdr.responseText);
				};
				
				xdr.send();
			} else {
		
				$.ajax({
					dataType: 'html',
					type: "POST",
					url: requestURL + requestData,
					success: function (data) {
						processData(data);
					}
				});
			}
			
			function processData(data) {
					
				var siteLocation = obj.directory + 'content/',
					scripts = [
						'js/knockout-2.2.1.js',
						'js/chosen/chosen.jquery.min.js',
						'js/shadowbox/shadowbox.js'
					],
					scriptCount = 0,
					attemptCount2 = 0,
					temp = $('<div />');
				
				if (obj.min == false) {
					scripts.push('js/velux-configurator-lib.js');
					scripts.push('js/velux-configurator-rules.js');
				}
				
				temp.append(data);
				temp.find('#mmc__AddToBasket').attr('action', obj.returnURL);								
				$(obj.target).append(temp.find('#mmc__Configurator'));
				temp = null;
				
				loadSettings();
				
				includeFile(siteLocation + 'css', 'velux-configurator.css', 'screen');
				includeFile(siteLocation + 'css', 'velux-configurator.print.css', 'print');
				includeFile(siteLocation + 'css', 'skin-' + obj.skin + '.css', 'screen');
				
				/* Load all the scripts, before loading the final one that places the configurator */
				$.each(scripts, function (index, value) {
					$.getScript(siteLocation + value, function () {
						scriptCount++;
					});
				});
				
				function checkScriptCounter() {
					attemptCount2++;
					
					if (scriptCount == scripts.length) {
						loadFinalScript();
					} else {
						if (attemptCount2 < 100) {
							setTimeout(checkScriptCounter, 100);
						} else {
							showLoadingError();
						}
					}
				}
				checkScriptCounter();
				
				function loadFinalScript() {
					if (obj.min == false) {
						$.getScript(siteLocation + 'js/velux-configurator.js');
					} else {
						$.getScript(siteLocation + 'js/velux-configurator.min.js');
					}
				}

				/* Trigger customer action: onAfterLoad */
				obj.onAfterLoad();
			}
		
		})(window, document, jQuery);
		
		/* Set $ and jQuery back to original jQuery object, and remove oldJQ object */
		if (oldJQ) {
			$ = oldJQ;
			jQuery = oldJQ;
			delete oldJQ;
		}
	}
	
	function showLoadingError() {
		var box = confirm("The page has taken too long to load, please try again.");
		if (box == true) {
			location.reload();
		} else {
			return;
		}
	}
	
	function loadSettings() {
		generalSettings = obj;
	}
		
	function waitForJQuery() {
		attemptCount++;
		if (typeof jQuery != 'undefined') { // JQuery has loaded!
			init();
			return;
		}
		if (attemptCount < 100) {
			setTimeout(waitForJQuery, 100); // Check 10x a second
		}
		return;
	}

	waitForJQuery();
}