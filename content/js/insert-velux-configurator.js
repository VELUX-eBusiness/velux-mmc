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
    obj.illustrationsDirectory = (obj.illustrationsDirectory === undefined) ? null : obj.illustrationsDirectory;
    obj.coloursDirectory = (obj.coloursDirectory === undefined) ? null : obj.coloursDirectory;
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

    /* Settings to show or hide certain steps */
    obj.showWindowStep = (obj.showWindowStep === undefined) ? true : obj.showWindowStep;
    obj.showCategoryStep = (obj.showCategoryStep === undefined) ? true : obj.showCategoryStep;
    obj.showOperationStep = (obj.showOperationStep === undefined) ? true : obj.showOperationStep;
    obj.showColourStep = (obj.showColourStep === undefined) ? true : obj.showColourStep;
    obj.showOuterSurfaceStep = (obj.showOuterSurfaceStep === undefined) ? true : obj.showOuterSurfaceStep;
    obj.showInsectNetStep = (obj.showInsectNetStep === undefined) ? true : obj.showInsectNetStep;
    obj.showExtraQuestion = (obj.showExtraQuestion === undefined) ? true : obj.showExtraQuestion;
    obj.showOnlyFlatroof = (obj.showOnlyFlatroof === undefined) ? false : obj.showOnlyFlatroof;

    /* Set the environment properly depending on the value */
    obj.environment = (obj.environment === undefined) ? '//configurator.veluxshop.com/' : obj.environment;
    if (obj.environment == 'production') {
        obj.environment = '//configurator.veluxshop.com/';
    } else if (obj.environment == 'test') {
        obj.environment = '//qaconfigurator.veluxshop.com/';
    } else if (obj.environment == 'localhost') {
        obj.environment = '//localhost/mmc/';
    } else if (obj.environment == 'veluxshop') {
        obj.environment = location.origin + location.pathname + '/';
    }

    /* Choose which HTML code the configurator should be rendered with, default to the shop renderer */
    obj.renderer = (obj.renderer === undefined) ? 'blinds' : obj.renderer;

    obj.min = (obj.min === undefined) ? true : obj.min;
    obj.disableRules = (obj.disableRules === undefined) ? false : obj.disableRules;
    obj.formMethod = (obj.formMethod === undefined) ? 'GET' : obj.formMethod;
    obj.returnFunc = (obj.returnFunc === undefined) ? null : obj.returnFunc;

    obj.loadingTitle = (obj.loadingTitle === undefined) ? '' : obj.loadingTitle;
    obj.loadingSubtitle = (obj.loadingSubtitle === undefined) ? '' : obj.loadingSubtitle;

    /* Allow pre-configuration of each step */
    obj.windowType = (obj.windowType === undefined) ? null : obj.windowType;
    obj.windowSize = (obj.windowSize === undefined) ? null : obj.windowSize;
    obj.category = (obj.category === undefined) ? null : obj.category;
    obj.operation = (obj.operation === undefined) ? null : obj.operation;
    obj.colour = (obj.colour === undefined) ? null : obj.colour;
    obj.outerSurface = (obj.outerSurface === undefined) ? null : obj.outerSurface;

    /* Allow the settings of discounts through the configuration, which will be calculated into the price */
    obj.percentDiscount = (obj.percentDiscount === undefined) ? null : obj.percentDiscount;
    obj.percentDiscountAddOnPleated = (obj.percentDiscountAddOnPleated === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountAddOnPleated;
    obj.percentDiscountAwning = (obj.percentDiscountAwning === undefined) ? (obj.percentDiscount) ? obj.percentDiscount : null : obj.percentDiscountAswning;
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

    obj.includeVatInPrice = (obj.includeVatInPrice === undefined) ? true : obj.includeVatInPrice;
    obj.includeVatInPriceText = (obj.includeVatInPrice === true) ? null : obj.includeVatInPriceText;

    /* Functions that are triggered before of after default actions */
    obj.onBeforeLoad = (obj.onBeforeLoad === undefined) ? function() { return; } : obj.onBeforeLoad;
    obj.onAfterLoad = (obj.onAfterLoad === undefined) ? function() { return; } : obj.onAfterLoad;
    obj.onBeforeInit = (obj.onBeforeInit === undefined) ? function() { return; } : obj.onBeforeInit;
    obj.onAfterInit = (obj.onAfterInit === undefined) ? function() { return; } : obj.onAfterInit;
    obj.onBeforeUpdate = (obj.onBeforeUpdate === undefined) ? function() { return; } : obj.onBeforeUpdate;
    obj.onAfterUpdate = (obj.onAfterUpdate === undefined) ? function() { return; } : obj.onAfterUpdate;
    obj.onBeforeSwitchStep = (obj.onBeforeSwitchStep === undefined) ? function() { return; } : obj.onBeforeSwitchStep;
    obj.onAfterSwitchStep = (obj.onAfterSwitchStep === undefined) ? function() { return; } : obj.onAfterSwitchStep;
    obj.onBeforeAddToBasket = (obj.onBeforeAddToBasket === undefined) ? function() { return; } : obj.onBeforeAddToBasket;
    obj.onAfterAddToBasket = (obj.onAfterAddToBasket === undefined) ? function() { return; } : obj.onAfterAddToBasket;

    /* Functions that are triggered on user events */
    obj.onSelectWindowType = (obj.onSelectWindowType === undefined) ? function() { return; } : obj.onSelectWindowType;
    obj.onSelectWindowSize = (obj.onSelectWindowSize === undefined) ? function() { return; } : obj.onSelectWindowSize;
    obj.onSelectCategory = (obj.onSelectCategory === undefined) ? function() { return; } : obj.onSelectCategory;
    obj.onSelectOperation = (obj.onSelectOperation === undefined) ? function() { return; } : obj.onSelectOperation;
    obj.onSelectColour = (obj.onSelectColour === undefined) ? function() { return; } : obj.onSelectColour;
    obj.onSelectInsectNetType = (obj.onSelectInsectNetType === undefined) ? function() { return; } : obj.onSelectInsectNetType;
    obj.onSelectInsectNet = (obj.onSelectInsectNet === undefined) ? function() { return; } : obj.onSelectInsectNet;
    obj.onSelectOuterSurface = (obj.onSelectOuterSurface === undefined) ? function() { return; } : obj.onSelectOuterSurface;
    obj.onNextWindow = (obj.onNextWindow === undefined) ? function() { return; } : obj.onNextWindow;
    obj.onNextCategory = (obj.onNextCategory === undefined) ? function() { return; } : obj.onNextCategory;
    obj.onNextOperation = (obj.onNextOperation === undefined) ? function() { return; } : obj.onNextOperation;
    obj.onNextColour = (obj.onNextColour === undefined) ? function() { return; } : obj.onNextColour;
    obj.onNextInsectnet = (obj.onNextInsectnet === undefined) ? function() { return; } : obj.onNextInsectnet;
    obj.onNextOuterSurface = (obj.onNextOuterSurface === undefined) ? function() { return; } : obj.onNextOuterSurface;
    obj.onButtonWindowUnknown = (obj.onButtonWindowUnknown === undefined) ? function() { return; } : obj.onButtonWindowUnknown;
    obj.onButtonDealer = (obj.onButtonDealer === undefined) ? function() { return; } : obj.onButtonDealer
    obj.onButtonAddToBasket = (obj.onButtonAddToBasket === undefined) ? function() { return; } : obj.onButtonAddToBasket;
    obj.onButtonPrint = (obj.onButtonPrint === undefined) ? function() { return; } : obj.onButtonPrint;
    obj.onButtonEmail = (obj.onButtonEmail === undefined) ? function() { return; } : obj.onButtonEmail;

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
        $.each(document.getElementsByTagName('link'), function(index, value) {
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
        (function(window, document, $) {
            var requestURL = obj.environment + '?option=com_configurator&view=' + obj.renderer,
                requestData = '&baseurl=' + obj.directory + '&imagesDirectory=' + obj.imagesDirectory + '&lang=' + obj.language + '&did=' + obj.did + '&cid=' + obj.cid + '&dealerurl=' + obj.dealerURL + '&dealertarget=' + obj.dealerTarget + '&shoptarget=' + obj.shopTarget + '&formmethod=' + obj.formMethod,
                preConfig = '&windowtype=' + obj.windowType + '&windowsize=' + obj.windowSize + '&category=' + obj.category + '&operation=' + obj.operation + '&colour=' + obj.colour + '&outersurface=' + obj.outerSurface;
            siteLocation = obj.directory + 'content/';

            /* Load the CSS files before displaying the loading configurator text */
            includeFile(siteLocation + 'css', 'velux-configurator.css', 'screen');
            includeFile(siteLocation + 'css', 'velux-configurator.print.css', 'print');
            includeFile(siteLocation + 'css', 'skin-' + obj.skin + '.css', 'screen');

            /* Create and display the loading configurator text */
            if (obj.loadingTitle) {
                obj.loading = $('<div id="mmc__LoadingConfigurator"></div>')
                    .append('<div class="mmc__loadingTitle">' + obj.loadingTitle + '</div>')
                    .append('<div class="mmc__loadingSubTitle">' + obj.loadingSubtitle + '</div>')
                    .append('<div class="mmc__loadingIcon">&nbsp;</div>')
                    .show();

                $(obj.target).prepend(obj.loading);
            }

            var url = requestURL + requestData + preConfig;
            if (XMLHttpRequest) {
                var request = new XMLHttpRequest();
                if ("withCredentials" in request) {
                    // Firefox 3.5 and Safari 4
                    request.open('GET', url, true);
                    request.onloadend = function() {
                        processData(request.response);
                    };
                    request.send();
                } else if (XDomainRequest) {
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    //CORS FIX from Daniel
                    (function(factory) {
                        if (typeof define === 'function' && define.amd) {
                            // AMD. Register as anonymous module.
                            define(['jquery'], factory);
                        } else if (typeof exports === 'object') {
                            // CommonJS
                            module.exports = factory(require('jquery'));
                        } else {
                            // Browser globals.
                            factory(jQuery);
                        }
                    }(function($) {

                        // Only continue if we're on IE8/IE9 with jQuery 1.5+ (contains the ajaxTransport function)
                        if ($.support.cors || !$.ajaxTransport || !window.XDomainRequest) {
                            return;
                        }

                        var httpRegEx = /^https?:\/\//i;
                        var getOrPostRegEx = /^get|post$/i;
                        var sameSchemeRegEx = new RegExp('^' + location.protocol, 'i');

                        // ajaxTransport exists in jQuery 1.5+
                        $.ajaxTransport('* text html xml json', function(options, userOptions, jqXHR) {

                            // Only continue if the request is: asynchronous, uses GET or POST method, has HTTP or HTTPS protocol, and has the same scheme as the calling page
                            if (!options.crossDomain || !options.async || !getOrPostRegEx.test(options.type) || !httpRegEx.test(options.url) || !sameSchemeRegEx.test(options.url)) {
                                return;
                            }

                            var xdr = null;

                            return {
                                send: function(headers, complete) {
                                    var postData = '';
                                    var userType = (userOptions.dataType || '').toLowerCase();

                                    xdr = new XDomainRequest();
                                    if (/^\d+$/.test(userOptions.timeout)) {
                                        xdr.timeout = userOptions.timeout;
                                    }

                                    xdr.ontimeout = function() {
                                        complete(500, 'timeout');
                                    };

                                    xdr.onload = function() {
                                        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                                        var status = {
                                            code: 200,
                                            message: 'success'
                                        };
                                        var responses = {
                                            text: xdr.responseText
                                        };
                                        try {
                                            if (userType === 'html' || /text\/html/i.test(xdr.contentType)) {
                                                responses.html = xdr.responseText;
                                            } else if (userType === 'json' || (userType !== 'text' && /\/json/i.test(xdr.contentType))) {
                                                try {
                                                    responses.json = $.parseJSON(xdr.responseText);
                                                } catch (e) {
                                                    status.code = 500;
                                                    status.message = 'parseerror';
                                                    //throw 'Invalid JSON: ' + xdr.responseText;
                                                }
                                            } else if (userType === 'xml' || (userType !== 'text' && /\/xml/i.test(xdr.contentType))) {
                                                var doc = new ActiveXObject('Microsoft.XMLDOM');
                                                doc.async = false;
                                                try {
                                                    doc.loadXML(xdr.responseText);
                                                } catch (e) {
                                                    doc = undefined;
                                                }
                                                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                                    status.code = 500;
                                                    status.message = 'parseerror';
                                                    throw 'Invalid XML: ' + xdr.responseText;
                                                }
                                                responses.xml = doc;
                                            }
                                        } catch (parseMessage) {
                                            throw parseMessage;
                                        } finally {
                                            complete(status.code, status.message, responses, allResponseHeaders);
                                        }
                                    };

                                    // set an empty handler for 'onprogress' so requests don't get aborted
                                    xdr.onprogress = function() {};
                                    xdr.onerror = function() {
                                        complete(500, 'error', {
                                            text: xdr.responseText
                                        });
                                    };

                                    if (userOptions.data) {
                                        postData = ($.type(userOptions.data) === 'string') ? userOptions.data : $.param(userOptions.data);
                                    }
                                    xdr.open(options.type, options.url);
                                    xdr.send(postData);
                                },
                                abort: function() {
                                    if (xdr) {
                                        xdr.abort();
                                    }
                                }
                            };
                        });

                    }));
                    // CORS FIX End


                    // IE8
                    $.ajax({
                        type: 'GET',
                        url: url,
                        processData: true,
                        dataType: "html",
                        success: function(data) {
                            processData(data);
                        },
                        error: function(a, b, c) {
                        }
                    });
                }

                // This version of XHR does not support CORS  
                // Handle accordingly
            }

            function processData(data) {

                var scripts = [
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

                if (obj.loadingTitle) {
                    $(obj.target).find('#mmc__Configurator #mmc__LoadingConfigurator').remove();
                }

                loadSettings();

                /* Load all the scripts, before loading the final one that places the configurator */
                $.each(scripts, function(index, value) {
                    $.getScript(siteLocation + value, function() {
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
                        $.getScript(siteLocation + 'js/velux-configurator-bundle.min.js');
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