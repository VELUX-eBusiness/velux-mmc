jQuery.noConflict();
(function(window, document, $) {

    $(document).ready(function() {

        if (navigator.userAgent.match(/MSIE 7/gi) || navigator.userAgent.match(/MSIE 8/gi) || navigator.userAgent.match(/MSIE 9/gi)) {
            // var ieConsole = $('<div style="font-family: monospace; position: fixed; top: 0; right: 0; width: 40%; height: 100%; background-color: #333; color: #fff; overflow-y: scroll; overflow-x: hidden; font-size: 11px; font-weight: normal;"><div style="padding: 10px;"></div></div>');
            // $('body').append(ieConsole);
            // $('#mmc__Configurator').css({width: '60%', height: '100%', overflowY: 'scroll', position: 'fixed', top: 0, left: 0});
            window.console = {
                log: function(data) {
                    // ieConsole.children().append(data + '<br /><br />');
                }
            };
        }

        /* Set up timers for measuring JS speeds */
        var t1 = new Date();

        /* Set up a MassMarketConfigurator object */
        var mmc = {
            /* Object with MMC Dom elements */
            dom: {
                base: $('#mmc__Configurator'),
                options: $('#mmc__Options'),
                title: $('#mmc__Options .mmc__titleBar'),
                selection: $('#mmc__Selection'),
                step: $('#mmc__Options .mmc__configStep'),
                activeStep: function() { return mmc.dom.options.find('.mmc__configStep.mmc__active'); },
                windows: $('#mmc__Options .mmc__configStep.mmc__window'),
                category: $('#mmc__Options .mmc__configStep.mmc__category'),
                insect: $('#mmc__Options .mmc__configStep.mmc__insectnet'),
                operation: $('#mmc__Options .mmc__configStep.mmc__operation'),
                outersurface: $('#mmc__Options .mmc__configStep.mmc__outersurface'),
                colour: $('#mmc__Options .mmc__configStep.mmc__colour'),
                finishtype: $('#mmc__Options .mmc__configStep.mmc__finishtype'),
                variant: $('#mmc__Options .mmc__configStep.mmc__variant'),
                complete: $('#mmc__Options .mmc__configStep.mmc__complete'),
                edit: $('.mmc__productRow span.mmc__edit a'),
                option: function(name, type, active) {
                    /* Return the option that is called using a name and type */
                    var element = (name) ? (type) ? '.mmc__option.' + type + '.' + name + '.' + active : '.mmc__option.' + name + '.' + active : '',
                        option = mmc.dom.options.find(element);

                    return option;
                },
                inactive: $('.mmc__option.mmc__inactive'),
                /* Variable for when the steps are animating */
                sliding: false,
                updating: false,
                insectSelect: $('#mmc__Options .mmc__insectNetTypes label, #mmc__Options .mmc__insectNetTypes button'),
                blocks: {
                    updating: $('#mmc__Configurator #mmc__Blocks .mmc__updatingOverlay'),
                    usermessage: $('#mmc__Configurator #mmc__Blocks .mmc__userMessage'),
                    tooltip: $('#mmc__Configurator #mmc__Blocks .mmc__tooltip'),
                    infotip: $('#mmc__Configurator #mmc__Blocks .mmc__infotip'),
                    windowtypesize: $('#mmc__Configurator #mmc__Blocks .mmc__windowTypeSize'),
                    mailerPopup: $('#mmc__Configurator #mmc__Blocks .mmc__mailerPopup')
                },
                tooltip: '',
                infotip: null,
                message: {
                    base: function() { return mmc.dom.activeStep().find('.mmc__userMessage'); },
                    title: function() { return mmc.dom.message.base().find('.mmc__userMessageTitle'); },
                    text: function() { return mmc.dom.message.base().find('.mmc__userMessageText'); },
                    icon: function() { return mmc.dom.message.base().find('.mmc__userMessageIcon'); },
                    close: function() { return mmc.dom.message.base().find('.mmc__userMessageClose'); }
                }
            },
            /* Update which option triggers the update function */
            trigger: {
                target: '',
                type: ''
            },
            /* Object to store data used for AJAX calls */
            request: {
                href: generalSettings.environment + '?option=com_configurator',
                did: function() { return mmc.settings.did; },
                cid: function() { return mmc.settings.cid; },
                lang: function() { return mmc.settings.language; },
                format: 'json',
                combi: function() {
                    return (mmc.vm.controls.showCombination() == true) ? true : false;
                },
                task: function() {
                    var config = mmc.vm.config.product1,
                        task;

                    if (mmc.trigger.type == 'codeCheck') {
                        task = 'mmc.validateProductFit'
                    } else if (mmc.trigger.type == 'sendmail') {
                        task = 'mmc.sendConfiguratorEmail'
                    } else {
                        task = 'mmc.Configure';
                    }
                    return task;
                },
                data: {
                    /* TODO: Concatenate 1 and 2 into a single function to set options */
                    1: {
                        windowtype: function() { return mmc.vm.config.product1.windowtype(); },
                        /* If triggered by windowtype, don't return windowsize */
                        windowsize: function() { return (mmc.trigger.type == 'windowtype') ? '' : mmc.vm.config.product1.windowsize(); },
                        category: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.categoryText()) : (!mmc.vm.config.product1.windowtype() || !mmc.vm.config.product1.windowsize()) ? '' : (mmc.vm.controls.showCombination()) ? mmc.vm.config.product1.category() + mmc.vm.config.product1.category().match(/[A-Z][a-z]+/g)[0] : mmc.vm.config.product1.category(); },
                        operation: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.operationText()) : mmc.vm.config.product1.operation(); },
                        finishtype: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.finishtypeText()) : mmc.vm.config.product1.finishtype(); },
                        colour: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.colourText()) : mmc.vm.config.product1.colour(); },
                        outersurface: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.outersurfaceText()) : mmc.vm.config.product1.outersurface(); },
                        openingwidth: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.insectWidthText()) : mmc.vm.config.product1.insectWidth(); },
                        openingheight: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.insectHeightText()) : mmc.vm.config.product1.insectHeight(); },
                        productid: function() { if (mmc.isBasket()) return mmc.vm.config.product1.serviceProductID(); },
                        categorynodeid: function() { if (mmc.isBasket() && mmc.vm.controls.showCombination()) return mmc.vm.config.product1.category(); },
                        // serviceproductid: function () { if (mmc.isBasket()) return mmc.vm.config.product1.serviceProductID(); },
                        productprice: function() { if (mmc.isBasket()) return mmc.vm.config.product1.productPrice(); },
                        configuratorType: function() { if (!mmc.isBasket()) return mmc.vm.config.product1.configureType(); }
                    },
                    2: {
                        windowtype: function() { return mmc.vm.config.product2.windowtype(); },
                        /* If triggered by windowtype, don't return windowsize */
                        windowsize: function() { return (mmc.trigger.type == 'windowtype') ? '' : mmc.vm.config.product2.windowsize(); },
                        category: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.categoryText()) : (!mmc.vm.config.product2.windowtype() || !mmc.vm.config.product2.windowsize()) ? '' : (mmc.vm.controls.showCombination()) ? mmc.vm.config.product2.category() + mmc.vm.config.product2.category().match(/[A-Z][a-z]+/g)[1] : mmc.vm.config.product2.category(); },
                        operation: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.operationText()) : mmc.vm.config.product2.operation(); },
                        finishtype: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.finishtypeText()) : mmc.vm.config.product2.finishtype(); },
                        colour: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.colourText()) : mmc.vm.config.product2.colour(); },
                        outersurface: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.outersurfaceText()) : mmc.vm.config.product2.outersurface(); },
                        openingwidth: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product1.insectWidthText()) : mmc.vm.config.product2.insectWidth(); },
                        openingheight: function() { return (mmc.isBasket()) ? encodeURI(mmc.vm.config.product2.insectHeightText()) : mmc.vm.config.product2.insectHeight(); },
                        productid: function() { if (mmc.isBasket()) return mmc.vm.config.product2.serviceProductID(); },
                        categorynodeid: function() { if (mmc.isBasket() && mmc.vm.controls.showCombination()) return mmc.vm.config.product2.category(); },
                        // serviceproductid: function () { if (mmc.isBasket()) return mmc.vm.config.product2.serviceProductID(); },
                        productprice: function() { if (mmc.isBasket()) return mmc.vm.config.product2.productPrice(); },
                        configuratorType: function() { if (!mmc.isBasket()) return mmc.vm.config.product2.configureType(); }
                    },
                    3: {
                        windowtype: function() { return mmc.vm.config.product1.windowtype(); },
                        /* If triggered by windowtype, don't return windowsize */
                        windowsize: function() { return (mmc.trigger.type == 'windowtype') ? '' : mmc.vm.config.product1.windowsize(); },
                        productid: function() { if (mmc.isBasket()) return mmc.vm.addon.serviceProductID(); },
                        // serviceproductid: function () { if (mmc.isBasket()) return mmc.vm.config.product2.serviceProductID(); },
                        productprice: function() { if (mmc.isBasket()) return mmc.vm.addon.productPrice(); },
                        description: function() { if (mmc.isBasket()) return mmc.vm.addon.Name(); },
                    }
                }
            },
            /* Short function to return whether button pressed goes to basket */
            isBasket: function() {
                if (mmc.trigger.type == 'gotobasket') {
                    return true;
                } else {
                    return false;
                }
            },
            /* Function to format the price */
            formatPrice: function(price) {
                var priceLeft, priceRight, priceSplit;

                priceLeft = price.split('.')[0],
                    priceRight = price.split('.')[1],
                    priceSplit = [];

                /* Split the price before decimals in groups of 3, to include thousands separator */
                for (var i = priceLeft.length, j = 0; i > j; i -= 3) {
                    priceSplit.unshift(priceLeft.substring(i, i - 3));
                }

                /* Format the decimals to show as set in the site settings */
                if (priceRight) {
                    if (priceRight.length > 2) {
                        priceRight = priceRight.slice(0, 2);
                    } else if (priceRight.length == 1) {
                        priceRight = priceRight + '0';
                    }
                    priceRight = (mmc.settings.decimalNum == 0) ? '' : mmc.settings.sepD + priceRight.slice(0, priceRight.length - (2 - mmc.settings.decimalNum));
                }

                return priceSplit.join(mmc.settings.sepT) + '<span class="mmc__decimals">' + priceRight + '</span>';
            },
            setActiveStep: function() {
                /* Set the correct step as the active step. */
                var activeStep = $(mmc.dom.options.find('.mmc__configStep.mmc__required:not(.mmc__filled)')[0]);
                activeStep.find('.mmc__content').show();
                activeStep.addClass('mmc__active');

                if (activeStep.hasClass('mmc__complete')) {
                    mmc.dom.selection.find('.mmc__product').hide();
                }

                /* Position the Selection block next to the active step */
                mmc.dom.selection.css('marginTop', mmc.measure.stepHeight * mmc.dom.activeStep().index('.mmc__required'));
            },
            /* Function to build the URL for AJAX request */
            buildRequest: function() {
                var request = mmc.request,
                    requestUrl = [],
                    requestProducts = [];

                $.each(request, function(index, value) {
                    if (index == 'href') {
                        return;
                    }
                    if (typeof value != 'object') {
                        if (value && typeof value != 'function') {
                            requestUrl.push(index + '=' + value);
                        } else if (value && typeof value == 'function') {
                            requestUrl.push(index + '=' + value());
                        }
                    } else {
                        if (mmc.trigger.type == 'codeCheck') {
                            requestProducts.push('"windowtype":"' + mmc.vm.config.product1.windowtype() + '"');
                            requestProducts.push('"windowsize":"' + mmc.vm.config.product1.windowsize() + '"');
                            if (mmc.trigger.target.hasClass('mmc__variant')) {
                                requestProducts.push('"productid":"' + mmc.settings.rules.variant.ID + '"');
                                requestProducts.push('"variantcode":"' + mmc.vm.config.product1.variantcode() + '"');
                            } else {
                                requestProducts.push('"productid":"' + mmc.settings.rules.production.ID + '"');
                                requestProducts.push('"productioncode":"' + mmc.vm.config.product1.productioncode() + '"');
                            }

                        } else {
                            $.each(value, function(name, product) {
                                /* Check whether a product is unchecked for purchasing */
                                if (mmc.vm.controls.showProduct2()) {
                                    if ((name == 1 && !mmc.vm.controls.buyProduct1())
                                        || (name == 2 && !mmc.vm.controls.buyProduct2())
                                        || (name == 3 && !mmc.vm.controls.buyProductAddon())) {
                                        return;
                                    }
                                }

                                /* If triggering go to basket, check whether request should include product 2 and/or 3 */
                                if (mmc.isBasket()) {
                                    if ((name == 2 && !mmc.vm.controls.showProduct2() && !mmc.vm.controls.showCombination())
                                        || (name == 3 && !mmc.vm.addon.Checked())) {
                                        return;
                                    }
                                } else {
                                    /* If product 2 is not shown, don't add to request */
                                    if ((name == 2 && !mmc.vm.controls.showProduct2() && !mmc.vm.controls.showCombination())
                                        || (name == 2 && mmc.vm.config.product1.windowtype() == 'GDL')
                                        || (name == 3 && !mmc.vm.controls.showAddon())) {
                                        return;
                                    }
                                }

                                var requestData = [],
                                    requestName = (mmc.settings.basketType == 'veluxshop') ? 'product' + name : name;

                                $.each(product, function(data, option) {
                                    if (option() && option() != 'undefined') {
                                        requestData.push('"' + data + '":"' + option() + '"');
                                    }
                                });

                                requestProducts.push('"' + requestName + '":{' + requestData.join(',') + '}');
                            });
                        }
                    }
                });

                return (mmc.isBasket()) ? '{' + requestProducts.join(',') + '}' : request.href + '&' + requestUrl.join('&') + '&data={' + requestProducts.join(',') + '}';
            },
            /* Array with all the options that have localised texts */
            options: ['windowtype', 'windowsize', 'category', 'operation', 'finishtype', 'colour', 'outersurface', 'insectWidth', 'insectHeight'],
            /* Object with MMC Measurements */
            measure: {
                stepHeight: $('#mmc__Options .mmc__titleBar').height() + parseInt($('#mmc__Options .mmc__configStep').css('marginBottom'))
            },
            /* Object with site settings */
            settings: {
                doNotHide: false, /* Set whether the mmc.update should hide the updating block when the AJAX call is finished */
                defaultImg: 'product1',
                sepT: '.',
                sepD: ',',
                decimalNum: 2,
                closeText: $('#mmc__Settings .mmc__setCloseText').text(),
                noResultsText: $('#mmc__Settings .mmc__setNoResultsText').text(),
                insect: {
                    widthPreText: $('#mmc__Settings .mmc__setInsectNetWidthPretext').text() + ' ',
                    heightPreText: $('#mmc__Settings .mmc__setInsectNetHeightPretext').text() + ' ',
                    postText: ' ' + $('#mmc__Settings .mmc__setInsectNetMeasurementText').text(),
                    widths: {
                        'BZ': $('#mmc__Settings .mmc__setInsectNetWidthBZ').text(),
                        'CZ': $('#mmc__Settings .mmc__setInsectNetWidthCZ').text(),
                        'FZ': $('#mmc__Settings .mmc__setInsectNetWidthFZ').text(),
                        'MZ': $('#mmc__Settings .mmc__setInsectNetWidthMZ').text(),
                        'PZ': $('#mmc__Settings .mmc__setInsectNetWidthPZ').text(),
                        'SZ': $('#mmc__Settings .mmc__setInsectNetWidthSZ').text(),
                        'UZ': $('#mmc__Settings .mmc__setInsectNetWidthUZ').text()
                    },
                    height: '',
                    measurement: ($('#mmc__Settings .mmc__setInsectNetMeasurement').text()) ? parseInt($('#mmc__Settings .mmc__setInsectNetMeasurement').text()) : 1,
                    sizes: {},
                    type: 'double',
                    shape: function() {
                        return mmc.dom.insect.find('.mmc__option.mmc__active').attr('id').replace('mmc__', '');
                    }
                },
                selectTypeText: $('#mmc__Settings .mmc__setSelectTypeText').text(),
                selectSizeText: $('#mmc__Settings .mmc__setSelectSizeText').text(),
                flatroofSizes: ['CVP', 'CFP'],
                country: 'IT',
                tooltip: {},
                infotip: {},
                infotipMessage: $('#mmc__Settings .mmc__setDefaultTooltipMessage').text(),
                showInactive: false,
                rules: {
                    list: {},
                    timeout: null,
                    product: {},
                    variant: {
                        MatchFoundFalse: null,
                        MatchFoundTrue: null,
                        ID: null
                    },
                    production: {
                        MatchFoundFalse: null,
                        MatchFoundTrue: null,
                        ID: null
                    },
                    variantUnknown: '',
                    productionUnknown: ''
                },
                ill: {
                    loc: function() {
                        if (mmc.settings.illustrationsDirectory) {
                            return mmc.settings.illustrationsDirectory;
                        } else {
                            return mmc.settings.directory + 'content/images/configurator/illustrations/';
                        }
                    }
                },
                categoriesOrder: $('#mmc__Settings .mmc__categoriesOrder').text().split(',').slice(0, -1)
            },
            /* The MMC Knockout ViewModel */
            vm: {},
            init: function() {
                /* Trigger customer action: onBeforeInit */
                mmc.settings.onBeforeInit();

                var self = mmc.vm.config.product1,
                    pageData = window.location.search;

                /* Show the configurator once all the previous files have loaded */
                $(mmc.settings.target).find('#mmc__Configurator').removeAttr('style');

                /* Set the class on Selection, dependant on available space */
                function setSelectionClass() {
                    var mmcWidth = mmc.dom.base.width(),
                        selectionWidth = mmcWidth - mmc.dom.options.width() - parseInt(mmc.dom.selection.css('paddingLeft')) - parseInt(mmc.dom.selection.css('paddingRight'));

                    if (mmcWidth < 914) {
                        mmc.dom.selection.addClass('mmc__hidden').removeClass('mmc__thin');
                    } else if (mmcWidth >= 914 && mmcWidth < 984) {
                        mmc.dom.selection.removeClass('mmc__hidden').addClass('mmc__thin').width(selectionWidth);
                        mmc.dom.selection.find('.mmc__content').width(selectionWidth);
                    } else if (mmcWidth >= 984) {
                        mmc.dom.selection.removeAttr('class').width('');
                        mmc.dom.selection.find('.mmc__content').removeAttr('style');
                    }
                }

                setSelectionClass();
                $(window).resize(setSelectionClass);

                /* Enable Chosen for WindowType, WindowSize and InsectNet */
                mmc.dom.options.find('select').chosen({ width: '100%', no_results_text: mmc.settings.noResultsText });

                /* Set the initial step indexes */
                lib.setStepIndex();

                mmc.dom.windows.find('.mmc__select.mmc__type input:first, .mmc__select.mmc__size input:first').attr('autocomplete', 'off');
                mmc.dom.windows.find('.mmc__select.mmc__type input:first').attr('tabindex', '1');
                mmc.dom.windows.find('.mmc__select.mmc__size input:first').attr('tabindex', '2');
                mmc.dom.windows.find('.mmc__buttonBar .mmc__button a').attr('tabindex', '3');
                mmc.dom.windows.find('.mmc__select.type input:first').val('');
                mmc.dom.windows.find('.mmc__select.size input:first').val('');

                /* Check the location data for preselected options */
                pageData = pageData.slice(1, pageData.length).split('&');
                $.each(pageData, function(index, value) {
                    var option = value.split('=')[0],
                        data = value.split('=')[1];

                    /* Rename blindtype to category for backwards compatibility for deeplinking */
                    option = (option == 'blindtype') ? 'category' : option;

                    /* Add window type and window size options to select */
                    if (option == 'windowtype' || option == 'windowsize') {
                        mmc.vm.data.product1[option].push({ val: data, name: data });
                    }

                    /* Set the observable with the correct data */
                    try {
                        self[option](data);
                    } catch (err) {
                    }
                });

                /* Trigger customer action: onAfterInit */
                mmc.settings.onAfterInit();

                /* Update the configurator */
                mmc.update();

                /* Set the active step after loading and processing the configurator */
                mmc.setActiveStep();
            },
            update: function() {
                var self = mmc.vm.config.product1,
                    stepCount,
                    stepFilled,
                    t3 = new Date();

                /* Reset the rules product object */
                mmc.settings.rules.product = {};

                mmc.dom.activeStep().append(mmc.dom.blocks.updating.clone());
                mmc.dom.activeStep().addClass('mmc__updating');

                /* When triggered by the add to basket button, only display the user message, stop the rest */
                if (mmc.isBasket()) {
                    return false;
                }

                /* Duplicate the product 1 values to product 2, except when configuring a Combination product */
                if (mmc.vm.controls.showCombination()) {
                    /* Set the same category for the second product */
                    mmc.vm.config.product2.category(self.category());
                } else {
                    $.each(mmc.options, function(index, value) {
                        /* When configuring an Insect Net, skip duplicating the insectHeight value in order to allow configuration of 2 insect nets */
                        if (value == 'insectHeight') {
                            return;
                        }
                        mmc.vm.config.product2[value](mmc.vm.config.product1[value]());
                    });
                }

                /* Trigger customer action: onBeforeUpdate */
                mmc.settings.onBeforeUpdate();

                /* AJAX request to SOAP Services */
                $.ajax({
                    dataType: 'jsonp',
                    jsonpCallback: 'jsonCallback',
                    type: "GET",
                    url: mmc.buildRequest(),
                    success: function(data) {
                        t4 = new Date();

                        var obj = data;
                        /* Loop through each of the objects returned by the service */
                        $.each(obj, function(index, product) {
                            /* Loop through each of the products returned by the service */
                            $.each(product, function(type, value) {
                                /* Loop through objects that have data */
                                $.each(value, function(cat, options) {
                                    /* Process the objects through separate functions */
                                    mmc.process[type]('product' + (index + 1), options);
                                });
                            });
                        });

                        /* Remove loading */
                        mmc.dom.base.removeClass('mmc__loading');

                        /* Remove extra loading when added through configuration file */
                        if (mmc.settings.loadingTitle) {
                            $(mmc.settings.target).find('#mmc__LoadingConfigurator').remove();
                        }

                        if (mmc.settings.doNotHide == false) {
                            mmc.dom.activeStep().removeClass('mmc__updating');
                            mmc.dom.activeStep().find('.mmc__updatingOverlay').remove();
                        }

                        /* Trigger customer action: onAfterUpdate */
                        mmc.settings.onAfterUpdate();

                        /* Reset the doNotHide setting */
                        mmc.settings.doNotHide = false;

                        /* Update the illustration */
                        lib.updateIllustration(self);

                    },
                    error: function(err) {
                    }
                });

                /* When configuring a double insect net, return the height input back to original */
                if (mmc.settings.insect.height) {
                    mmc.dom.insect.find('select[name="insectHeight"]').val(mmc.settings.insect.height);

                    mmc.settings.insect.height = null;

                    /* Chosen needs to be updated to allow user to select height < 2400 when having configured height > 2400 */
                    mmc.dom.insect.find('select').trigger("chosen:updated");
                }

                /* Check which steps are filled and sets a filled class */
                lib.checkFilledSteps(self);

                /* Change the step index every time the configurator updates */
                lib.setStepIndex();

                /* Show the price when filled steps == required steps */
                stepCount = mmc.dom.options.find('.mmc__configStep').length - 1;
                stepFilled = mmc.dom.options.find('.mmc__configStep.mmc__filled').length;

                if (stepCount == stepFilled) {
                    self.showPrice(true);
                } else {
                    self.showPrice(false);
                }

                /* Position the Selection block next to the active step */
                mmc.dom.selection.css('marginTop', mmc.measure.stepHeight * mmc.dom.activeStep().index('.mmc__required'));

            },
            /* TODO: Optimise processing for IE */
            process: {
                /* TODO: See if repeated actions can be called through a shared function */
                WindowTypes: function(productIndex, options) {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Skip this step when window type is set and update is triggered by a change */
                    if ((mmc.vm.config.product1.windowtype() != '' && data.product1.windowtype().length > 2) && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0;

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            if (mmc.vm.controls.showOnlyFlatroof() === true && $.inArray(id.WindowID, ['CVP', 'CFP']) != -1 || mmc.vm.controls.showOnlyFlatroof() === false) {
                                product.windowtype()[++obsIndex] = { 'val': id.WindowID, 'name': id.WindowID };
                            }
                        });

                        /* Update the observable when array has been built */
                        product.windowtype.valueHasMutated();
                    });

                    /* If a window type is already selected, set as active */
                    if (config.product1.windowtype() != '') {
                        mmc.dom.windows.find('select#windowtype option[value="' + config.product1.windowtype() + '"]').attr('selected', 'selected');
                    }

                    lib.selectWindowInput();
                },
                WindowSizes: function(productIndex, options) {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Skip this step when window size is set and update is triggered by a change */
                    if ((mmc.vm.config.product1.windowsize() != '' && data.product1.windowsize().length > 2) && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0;

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            product.windowsize()[++obsIndex] = { 'val': id.SizeID, 'name': id.SizeID };
                        });

                        /* Update the observable when array has been built */
                        product.windowsize.valueHasMutated();
                    });

                    /* If a window size is already selected, set as active */
                    if (config.product1.windowsize() != '') {
                        mmc.dom.windows.find('select#windowsize option[value="' + config.product1.windowsize() + '"]').attr('selected', 'selected');
                    }

                    lib.selectWindowInput();
                },
                ValidatedCategory: function(productIndex, options) {
                    var data = mmc.vm.data,
                        config = mmc.vm.config,
                        activeCategory = mmc.dom.option(config[productIndex].category(), 'mmc__category', 'mmc__active').data('parent');

                    /* Match the active category against the returned categories to see if it's valid */
                    $.each(options, function(cat, option) {
                        $.each(option.ChildCategories, function(value, category) {
                            $.each(category, function(index, child) {
                                try {
                                    if (child.CategoryName == config[productIndex].category()) {
                                        /* If the matched child has no match, clear the configurator options, but not for InsectNet (which is always false) */
                                        if (child.MatchFound == false && child.CategoryName != 'InsectNet') {
                                            lib.resetSteps();
                                            lib.checkFilledSteps(config[productIndex]);
                                        }
                                    }
                                } catch (err) {
                                }
                            });
                        });
                    });

                    /* Skip this step when category is set and update is triggered by a change */
                    if ((mmc.vm.config[productIndex].category() != '' && mmc.vm.data[productIndex].category().length > 0) && mmc.trigger.type) {
                        return;
                    }

                    $.each(options, function(cat, option) {

                        if ($.inArray(option.CategoryName, ['BLINDS', 'FLATROOFBLINDS', 'COMBINATION']) != -1) {

                            /* Loop through each of the category types */
                            $.each(option.ChildCategories, function(value, category) {

                                /* Loop through both of the products and set the options */
                                $.each(data, function(index, product) {
                                    var obsIndex = 0;

                                    category = (category.length) ? category : [category];

                                    /* Loop through each of the child categories */
                                    $.each(category, function(index, child) {
                                        /* If either window type IS flatroof and category IS flatroof or window type IS NOT flatroof and category IS NOT flatroof, add the category to the list */
                                        if (($.inArray(mmc.vm.config.product1.windowtype(), mmc.settings.flatroofSizes) == -1 && !child.CategoryName.match(/flatroof/gi)) ||
                                        ($.inArray(mmc.vm.config.product1.windowtype(), mmc.settings.flatroofSizes) != -1 && child.CategoryName.match(/flatroof/gi))) {

                                            /* Only add the product type to the list when it's set to selling, or when categories order does not exist */
                                            // if ($.inArray(child.CategoryName, mmc.settings.categoriesOrder) != -1 || mmc.settings.categoriesOrder != '') {
                                            var wt = mmc.vm.config.product1.windowtype().trim();
                                            if (child.MatchFound || (!child.MatchFound && mmc.settings.showInactive) || child.CategoryName == 'InsectNet') {

                                                if (wt != 'GDL' || option.CategoryName != 'COMBINATION') {
                                                    product.category.push({
                                                        val: child.CategoryName,
                                                        name: child.Name,
                                                        desc: child.Description,
                                                        parent: option.CategoryName,
                                                        inactive: (child.MatchFound || child.CategoryName == 'InsectNet') ? '' : 'inactive',
                                                        order: mmc.settings.categoriesOrder.indexOf(child.CategoryName)
                                                    });
                                                }

                                            }
                                            // }

                                        }
                                    });

                                    /* Order the categories by the sortorder of the product types */
                                    if (mmc.settings.categoriesOrder) {
                                        product.category.sort(function(l, r) {
                                            return l.order - r.order;
                                        });
                                    }

                                    /* Update the observable when array has been built */
                                    product.category.valueHasMutated();

                                });
                            });
                        }

                    });

                    /* Trigger selectWindowInput to focus on next button */
                    lib.selectWindowInput();
                },
                HeightWidth: function(productIndex, options) {
                    var data = mmc.vm.data,
                        obsIndex = 0;

                    /* Skip this step when operation is set and update is triggered by a change */
                    if ((mmc.vm.config.product1.operation() != '' || mmc.trigger.type != 'category') && mmc.trigger.type) {
                        // return;
                    }

                    $.each(options, function(index, value) {
                        if (!mmc.settings.insect.sizes[value.Width]) {
                            mmc.settings.insect.sizes[value.Width] = {};
                            mmc.settings.insect.sizes[value.Width][value.Height] = value.Height;
                        } else {
                            mmc.settings.insect.sizes[value.Width][value.Height] = value.Height;
                        }
                    });


                    var widthKeys = [];
                    for (var n in mmc.settings.insect.sizes) {
                        if (mmc.settings.insect.sizes.hasOwnProperty(n)) {
                            widthKeys.push(n);
                        }
                    }
                    widthKeys.sort(function(a, b) {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    });

                    $.each(widthKeys, function(index, width) {
                        var k = widthKeys[index];
                        data.product1.insectWidth()[obsIndex++] = { val: k, name: mmc.settings.insect.widthPreText + (mmc.settings.insect.widths[k] / mmc.settings.insect.measurement) + mmc.settings.insect.postText };
                    });


                    /* Update the observable when array has been built */
                    data.product1.insectWidth.valueHasMutated();

                    data.product1.insectWidth.unshift({ val: '', name: '' });

                    mmc.dom.insect.find('.mmc__height select, .mmc__height2 select').attr('disabled', 'disabled');

                    /* Update the selects for Chosen */
                    mmc.dom.insect.find('select').trigger("chosen:updated");
                },
                Operations: function(productIndex, options) {
                    var data = mmc.vm.data,
                        validCount = 0,
                        validOption;

                    /* Skip this step when operation is set and update is triggered by a change */
                    if ((mmc.vm.config[productIndex].operation() != '' || mmc.vm.data[productIndex].operation().length > 0) && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0;

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            if (id.IsValid || (!id.IsValid && mmc.settings.showInactive)) {
                                if (mmc.vm.controls.showCombination()) {
                                    data[productIndex].operation()[obsIndex++] = { val: id.OperationID, name: id.Name, desc: id.Description, inactive: (id.IsValid) ? '' : 'inactive' };
                                } else {
                                    product.operation()[obsIndex++] = { val: id.OperationID, name: id.Name, desc: id.Description, inactive: (id.IsValid) ? '' : 'inactive' };
                                }
                            }
                        });

                        /* Update the observable when array has been built */
                        product.operation.valueHasMutated();
                    });

                    /* Loop through each of the options to see how many are valid. If only 1 valid, automatically set that one */
                    $.each(options, function(name, id) {
                        if (id.IsValid) {
                            validCount++;
                            validOption = id.OperationID;
                        }
                    });
                    if (validCount == 1) {
                        mmc.vm.config[productIndex].operation(validOption);
                        lib.checkFilledSteps(mmc.vm.config[productIndex]);
                    }
                },
                Finishes: function(productIndex, options) {
                    /* Dummy function to make sure configurator does not break, list finish is not a required setting anymore */
                },
                FinishTypes: function(productIndex, options) {
                    var data = mmc.vm.data,
                        validCount = 0,
                        validOption;

                    /* Skip this step when list finish is set and update is triggered by a change */
                    if (mmc.vm.config[productIndex].category() != 'AddOnPleated' && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0;

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            if (id.IsValid || (!id.IsValid && mmc.settings.showInactive)) {
                                product.finishtype()[obsIndex++] = { val: id.FinishTypeID, name: id.FinishTypeName, desc: id.FinishTypeDescription, inactive: (id.IsValid) ? '' : 'inactive' };
                            }
                        });

                        /* Update the observable when array has been built */
                        product.finishtype.valueHasMutated();
                    });

                    /* Loop through each of the options to see how many are valid. If only 1 valid, automatically set that one */
                    $.each(options, function(name, id) {
                        if (id.IsValid) {
                            validCount++;
                            validOption = id.FinishTypeID;
                        }
                    });
                    if (validCount == 1) {
                        mmc.vm.config[productIndex].finishtype(validOption);
                        lib.checkFilledSteps(mmc.vm.config[productIndex]);
                    }

                },
                OuterSurfaces: function(productIndex, options) {
                    var data = mmc.vm.data,
                        validCount = 0,
                        validOption;

                    /* Skip this step when list finish is set and update is triggered by a change */
                    if ((mmc.vm.config[productIndex].outersurface() != '' || mmc.vm.data[productIndex].outersurface().length > 0) && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0;

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            if (id.IsValid || (!id.IsValid && mmc.settings.showInactive)) {
                                product.outersurface()[obsIndex++] = { val: id.OuterSurfaceID, name: id.Name, desc: id.Description, inactive: (id.IsValid) ? '' : 'inactive' };
                            }
                        });

                        /* Update the observable when array has been built */
                        product.outersurface.valueHasMutated();
                    });

                    /* Loop through each of the options to see how many are valid. If only 1 valid, automatically set that one */
                    $.each(options, function(name, id) {
                        if (id.IsValid) {
                            validCount++;
                            validOption = id.OuterSurfaceID;
                        }
                    });
                    if (validCount == 1) {
                        mmc.vm.config[productIndex].outersurface(validOption);
                        lib.checkFilledSteps(mmc.vm.config[productIndex]);
                    }

                    /* Add an extra check to see if the required steps are filled. If so, then trigger the updateConfigurator again */
                    if (mmc.dom.base.find('.mmc__configStep.mmc__required.mmc__filled:not(.mmc__complete)').length == mmc.dom.base.find('.mmc__configStep.mmc__required:not(.mmc__complete)').length) {
                        // mmc.settings.doNotHide = true;
                        mmc.update();
                    }

                },
                Rules: function(productIndex, options) {
                    var data = mmc.vm.data;

                    /* Clear the timeout when not yet ready gathering rules */
                    if (mmc.settings.rules.timeout != null) {
                        clearTimeout(mmc.settings.rules.timeout);
                    }

                    if (options.RuleNo == '103' && options.Family == null) {
                        options.RuleNo = '507';
                    }

                    /* Check to see if the value is already in the list of rules */
                    if (!mmc.settings.rules.list[options.RuleNo]) {
                        $.each(mmc.settings.rules.product, function(index, value) {
                            /* Add the product object that triggers the rule to the rules object, exclude InsectNet from this check */
                            if (mmc.vm.config.product1.category() != 'InsectNet') {
                                if (value.RuleNo.match(options.RuleNo) || ((value.AskForProductCode || value.AskForTypeSignVariant) && !value.RuleNo) || options.RuleNo == '507') {
                                    options.Product = value;
                                }
                            }

                        });
                        mmc.settings.rules.list[options.RuleNo] = options;
                    }

                    /* Gather all the rules and process them together */
                    mmc.settings.rules.timeout = setTimeout(function() {
                        rules.process(mmc.settings.rules.list);
                        mmc.settings.rules.timeout = null
                    }, 1);
                },
                Colors: function(productIndex, options) {
                    var data = mmc.vm.data,
                        validCount = 0,
                        validOption;

                    /* Skip this step when colour is set and update is triggered by a change */
                    if ((mmc.vm.config[productIndex].colour() != '' || mmc.vm.data[productIndex].colour().length > 0) && mmc.trigger.type) {
                        return;
                    }

                    if (!options.length) {
                        options = [options];
                    }
                    /* Loop through both of the products and set the options */
                    $.each(data, function(index, product) {
                        var obsIndex = 0,
                            tempCategory = '';

                        /* Loop through all the values and update the Observable */
                        $.each(options, function(name, id) {
                            if (id.IsValid || (!id.IsValid && mmc.settings.showInactive)) {
                                if (mmc.vm.controls.showCombination()) {
                                    /* Create a check for BlackoutDisney colours, in case they show up in the Blackout category */
                                    tempCategory = (id.ColorID > 4609 && id.ColorID < 4622) ? 'BlackoutDisney' : mmc.vm.config[productIndex].category().match(/[A-Z][a-z]+/g)[productIndex.charAt(productIndex.length - 1) - 1];

                                    data[productIndex].colour()[obsIndex++] = { cat: tempCategory, val: id.ColorID, name: id.ColorID + ' ' + id.ColorDescription, desc: '', inactive: (id.IsValid) ? '' : 'inactive' };
                                } else {
                                    /* Create a check for BlackoutDisney colours, in case they show up in the Blackout category */
                                    tempCategory = (id.ColorID > 4609 && id.ColorID < 4622) ? 'BlackoutDisney' : mmc.vm.config.product1.category();

                                    product.colour()[obsIndex++] = { cat: tempCategory, val: id.ColorID, name: id.ColorID + ' ' + id.Name, desc: '', inactive: (id.IsValid) ? '' : 'inactive' };
                                }
                            }
                        });

                        /* Update the observable when array has been built */
                        product.colour.valueHasMutated();
                    });

                    /* Loop through each of the options to see how many are valid. If only 1 valid, automatically set that one */
                    $.each(options, function(name, id) {
                        if (id.IsValid) {
                            validCount++;
                            validOption = id.ColorID;
                        }
                    });
                    if (validCount == 1) {
                        mmc.vm.config[productIndex].colour(validOption);
                        lib.checkFilledSteps(mmc.vm.config[productIndex]);
                    }

                    /* Add an extra check to see if the required steps are filled. If so, then trigger the updateConfigurator again */
                    if (mmc.dom.base.find('.mmc__configStep.mmc__required.mmc__filled:not(.mmc__complete)').length == mmc.dom.base.find('.mmc__configStep.mmc__required:not(.mmc__complete)').length && !mmc.dom.base.hasClass('mmc__loading')) {
                        // mmc.settings.doNotHide = true;
                        mmc.update();
                    }
                },
                AvailableProducts: function(productIndex, options) {
                    var data = mmc.vm.config;

                    /* Clear the complete step whenever new products are configured */
                    lib.clearCompleteStep();

                    if (options.length) {
                        mmc.vm.controls.showProduct2(true);
                    }

                    /* Set options as array when only 1 product is returned */
                    if (!options.length) {
                        options = [options];
                    }

                    $.each(options, function(index, value) {
                        var product = (productIndex == 'product2') ? productIndex : 'product' + (index + 1);

                        var productPrice =
                            mmc.settings.includeVatInPrice ?
                                (!value.Price) ? value.PriceWithVAT : (value.Price.HasDiscount) ? value.Price.ProductPriceDiscounted.PriceWithVAT : value.Price.ProductPrice.PriceWithVAT
                                :
                                (!value.Price) ? value.PriceExVAT : (value.Price.HasDiscount) ? value.Price.ProductPriceDiscounted.PriceExVAT : value.Price.ProductPrice.PriceExVAT;

                        var productDiscount = mmc.settings['percentDiscount' + data[product].category()];
                        if (productDiscount === undefined) {
                            productDiscount = mmc.settings.percentDiscount;
                        }

                        /* Check to see if a discount is set by the customer and apply it */
                        if (productDiscount != null) {
                            productPrice = (parseFloat(productPrice) * ((100 - productDiscount) / 100)).toFixed(2);
                        }

                        data[product].productPrice(productPrice);
                        data[product].productID(value.VCE);
                        data[product].serviceProductID(value.ProductID);
                        data[product].includeVatInPrice = mmc.settings.includeVatInPrice;

                        mmc.settings.rules.product[product] = (data[productIndex].category() == 'Shutters') ? value.RollerShutter : (data[productIndex].category() == 'InsectNet') ? value.InsectNet : value.Blind;

                        if (mmc.vm.controls.showProduct2() == true) {
                            if (mmc.settings.rules.product[product].AskForTypeSignVariant == true) {
                                mmc.settings.rules.variant.ID = value.ProductID;
                            } else if (mmc.settings.rules.product[product].AskForProductCode == true) {
                                mmc.settings.rules.production.ID = value.ProductID;
                            }
                        } else {
                            mmc.settings.rules.variant.ID = value.ProductID;
                            mmc.settings.rules.production.ID = value.ProductID;
                        }
                    });

                }
            },
            /* Functions that control what happens when options change */
            change: {
                windowtype: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Reset the showing of the second product */
                    mmc.vm.controls.showProduct2(false);
                    mmc.vm.controls.showCombination(false);

                    /* Reset the data settings for both products */
                    $.each(data, function(index, product) {
                        /* Reset all the required settings */
                        product.windowsize.splice(1, data.product1.windowsize().length - 1);
                    });

                    /* Reset the data settings for both products */
                    $.each(config, function(index, product) {
                        product.windowsize('');
                    });

                    /* Trigger custom function */
                    mmc.settings.onSelectWindowType(config.product1.windowtype());

                    /* Return true updates the configurator */
                    if (config.product1.windowtype() == null) {
                        return false;
                    }
                },
                windowsize: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Reset the showing of the second product */
                    mmc.vm.controls.showProduct2(false);
                    mmc.vm.controls.showCombination(false);

                    /* Reset required steps before updating the configurator */
                    // lib.resetSteps();

                    /* Reset the data settings for both products */
                    $.each(data, function(index, product) {
                        product.category.removeAll();
                    });

                    /* Trigger custom function, add an exception to check if it's empty, because selecting a window type resets the window size */
                    if (config.product1.windowsize()) {
                        mmc.settings.onSelectWindowSize(config.product1.windowsize());
                    }

                    /* Return true updates the configurator */
                    if (config.product1.windowsize() == null) {
                        return false;
                    }
                },
                category: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config,
                        parentCategory = mmc.trigger.target.closest('.mmc__option').data('parent');

                    /* Reset the showing of the second product */
                    mmc.vm.controls.showProduct2(false);

                    if (parentCategory == 'COMBINATION') {
                        mmc.vm.controls.showCombination(true);
                    } else {
                        mmc.vm.controls.showCombination(false);
                    }

                    /* Trigger custom function */
                    mmc.settings.onSelectCategory(config.product1.category());

                    /* Reset required steps before updating the configurator */
                    lib.resetSteps();
                },
                operation: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Trigger custom function */
                    mmc.settings.onSelectOperation(config.product1.operation());

                    /* Reset required steps before updating the configurator */
                    lib.resetSteps();
                },
                outersurface: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Trigger custom function */
                    mmc.settings.onSelectOuterSurface(config.product1.outersurface());

                    /* Reset required steps before updating the configurator */
                    lib.resetSteps();
                },
                colour: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Trigger custom function */
                    mmc.settings.onSelectColour(config.product1.colour());

                    /* Reset required steps before updating the configurator */
                    lib.resetSteps();
                },
                finishtype: function() {

                },
                insectWidth: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config,
                        tempHeights = mmc.settings.insect.sizes[config.product1.insectWidth()],
                        heights = [];

                    /* Create an array with available heights */
                    $.each(tempHeights, function(index, value) {
                        heights.push(value);
                    });

                    /* Duplicate heights when configuring a double insect net in a straight window shape */
                    if (mmc.settings.insect.type == 'double' && mmc.settings.insect.shape() == 'straight') {
                        heights = heights.join(',');

                        if (heights.match(/1600/gi) && heights.match(/2000/gi) && heights.match(/2400/gi)) {
                            heights = [1600, 2000, 2400, 3200, 3600, 4000, 4400, 4800];

                        } else if (heights.match(/1600/gi) && heights.match(/2000/gi)) {
                            heights = [1600, 2000, 3200, 3600, 4000];

                        } else if (heights.match(/1600/gi) && heights.match(/2400/gi)) {
                            heights = [1600, 2400, 3200, 4000, 4800];

                        } else if (heights.match(/2000/gi) && heights.match(/2400/gi)) {
                            heights = [2000, 2400, 4000, 4400, 4800];

                        } else if (heights.match(/1600/gi)) {
                            heights = [1600, 3200];

                        } else if (heights.match(/2000/gi)) {
                            heights = [2000, 4000];

                        } else if (heights.match(/2400/gi)) {
                            heights = [2400, 4800];

                        }
                    }

                    /* Hide the second product when selecting a new height */
                    if (mmc.settings.insect.shape() == 'straight' && mmc.vm.controls.showProduct2() == true) {
                        mmc.vm.controls.showProduct2(false);
                    }

                    /* Set the height observables for both products */
                    for (var i = 1, j = 2; i <= j; i++) {
                        /* Reset the Insect Net heights, keep the first label */
                        data['product' + i].insectHeight.splice(1, data['product' + i].insectHeight().length - 1);

                        /* Add the available heights to the selects */
                        $.each(heights, function(index, value) {
                            data['product' + i].insectHeight.push({ val: value, name: mmc.settings.insect.heightPreText + (value / mmc.settings.insect.measurement) + mmc.settings.insect.postText });
                        });
                        data['product' + i].insectHeight.unshift({ val: '', name: '' })
                    }

                    /* Reset the configured heights */
                    config.product1.insectHeight('');
                    config.product2.insectHeight('');

                    /* Update the selects for Chosen */
                    mmc.dom.insect.find('select').removeAttr('disabled').trigger("chosen:updated");

                    /* Return true updates the configurator */
                    return false;
                },
                insectHeight: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    /* Save the original height value to set it back after configurator update */
                    mmc.settings.insect.height = config.product1.insectHeight();

                    /* Set the correct heights for product 1 and 2 when height is > 2400 */
                    if (mmc.settings.insect.height > 2400) {
                        mmc.vm.controls.showProduct2(true);

                        if (mmc.settings.insect.height == 3200) {
                            config.product1.insectHeight(1600);
                            config.product2.insectHeight(1600);

                        } else if (mmc.settings.insect.height == 3600) {
                            config.product1.insectHeight(1600);
                            config.product2.insectHeight(2000);

                        } else if (mmc.settings.insect.height == 4000) {
                            config.product1.insectHeight(2000);
                            config.product2.insectHeight(2000);

                        } else if (mmc.settings.insect.height == 4400) {
                            config.product1.insectHeight(2000);
                            config.product2.insectHeight(2400);

                        } else if (mmc.settings.insect.height == 4800) {
                            config.product1.insectHeight(2400);
                            config.product2.insectHeight(2400);

                        }

                        /* Trigger custom function */
                        mmc.settings.onSelectInsectNet(config.product1.insectWidth() + ' ' + config.product1.insectHeight() + ' ' + config.product2.insectHeight());
                    } else {
                        if (mmc.settings.insect.shape() == 'bent') {
                            if (config.product2.insectHeight() == '') {
                                return false;
                            }

                            /* Trigger custom function */
                            mmc.settings.onSelectInsectNet(config.product1.insectWidth() + ' ' + config.product1.insectHeight());
                        } else {
                            config.product2.insectHeight('');

                            mmc.vm.controls.showAddon(false);
                            mmc.vm.controls.showProduct2(false);

                            /* Trigger custom function */
                            mmc.settings.onSelectInsectNet(config.product1.insectWidth() + ' ' + config.product1.insectHeight());
                        }
                    }
                },
                insectHeight2: function() {
                    var data = mmc.vm.data,
                        config = mmc.vm.config;

                    if (mmc.settings.insect.shape() == 'bent') {
                        if (config.product1.insectHeight() == '') {
                            return false;
                        }

                        /* Trigger custom function */
                        mmc.settings.onSelectInsectNet(config.product1.insectWidth() + ' ' + config.product1.insectHeight() + ' ' + config.product2.insectHeight());
                    }
                }
            }
        };
        /* End MassMarketConfigurator object */

        /* Set all the general settings before creating the view models, to allow customising the configurator when loading */
        try {
            $.each(generalSettings, function(index, value) {
                if (typeof value != 'object') {
                    mmc.settings[index] = value;
                }
            });
        } catch (error) {
        }

        /* Load functions from Configurator library */
        var lib = new loadConfiguratorFunctions(mmc, window, document, $);

        /* Load functions from Configurator library */
        var rules = new loadRulesFunctions(mmc, lib, window, document, $);

        var productViewModel = function() {
            var self = this;
        };

        var controlsViewModel = function() {
            var self = this;

            /* Observables for enabling/disabling products to add to basket */
            self.buyProduct1 = ko.observable(true);
            self.buyProduct2 = ko.observable(true);
            self.buyProductAddon = ko.observable(true);

            /* Observable to show or hide second product */
            self.showProduct2 = ko.observable(false);

            /* Observable to show or hide the selection products */
            self.showSelectionProducts = ko.observable(false);

            /* Observable to show or hide second product */
            self.showCombination = ko.observable(false);

            /* Observable to show or hide addon product */
            self.showAddon = ko.observable(false);

            /* Observable to show or hide variant code fourth question */
            self.showQuestion = ko.observable(false);

            /* Configurable observables, set by client when loading the configurator */
            self.showShopButton = ko.observable(mmc.settings.showShopButton);
            self.showDealerButton = ko.observable(mmc.settings.showDealerButton);
            self.showPrintButton = ko.observable(mmc.settings.showPrintButton);
            self.showMailButton = ko.observable(mmc.settings.showMailButton);

            /* Observables to show/hide certain steps, controllable by the settings */
            self.showWindowStep = ko.observable(mmc.settings.showWindowStep);
            self.showCategoryStep = ko.observable(mmc.settings.showCategoryStep);
            self.showOperationStep = ko.observable(mmc.settings.showOperationStep);
            self.showColourStep = ko.observable(mmc.settings.showColourStep);
            self.showOuterSurfaceStep = ko.observable(mmc.settings.showOuterSurfaceStep);
            self.showInsectNetStep = ko.observable(mmc.settings.showInsectNetStep);
            self.showExtraQuestion = ko.observable(mmc.settings.showExtraQuestion);
            self.showOnlyFlatroof = ko.observable(mmc.settings.showOnlyFlatroof);

            /* Catch updateConfigurator */
            self.updateConfigurator = function(data, event) {


                /* Always clear the price when updating the configurator */
                mmc.vm.config.product1.productPrice('');
                mmc.vm.config.product2.productPrice('');

                /* Always set the buyProduct observable to true, and tick the select boxes */
                mmc.vm.controls.buyProduct1(true);
                mmc.vm.controls.buyProduct2(true);
                mmc.dom.complete.find('.mmc__product .mmc__addToCart input:not(input:checked)').click();

                if (!mmc.dom.base.hasClass('mmc__loading')) {
                    mmc.trigger.target = $(event.target);
                    mmc.trigger.type = mmc.trigger.target.attr('name');
                }

                lib.hideMessage(0);

                /* Trigger functions depending on which element is calling updateConfigurator. If it returns true, update the configurator */
                if (mmc.change[mmc.trigger.type]() != false) {
                    /* Set mini timeout to allow other observables to update */
                    setTimeout(function() { mmc.update(); }, 1);
                }
            };

            /* Catch switchStep */
            self.switchStep = function() {

                /* Trigger the on next button function when current step is filled */
                if (mmc.dom.activeStep().hasClass('mmc__filled')) {
                    var activeStep = mmc.dom.activeStep().attr('data-type'),
                        stepName = activeStep.charAt(0).toUpperCase() + activeStep.slice(1, activeStep.length);

                    /* Trigger customer action */
                    try {
                        mmc.settings['onNext' + stepName](stepName);
                    } catch (err) {
                    }
                }

                lib.switchStep();
            };

            /* Show a user message when user has not filled in the required data */
            self.showMessage = function() {
                lib.showMessage();
            };

            /* Update the index of the steps during configuration */
            self.stepIndex = function(type) {
                var target = mmc.dom.options.find('.mmc__configStep.' + type);
                targetIndex = target.index('.mmc__required') + 1;

                return targetIndex;
            };
        }

        var configurationViewModel = function(product) {
            var self = this;

            /* Set observables for the configuration options ! Note that these should be the same as the deep-linking options ! */
            self.windowtype = ko.observable('');
            self.windowsize = ko.observable('');
            self.windowTypeSize = ko.computed(function() {
                var windowtype = (self.windowtype() == null) ? '' : self.windowtype(),
                    windowsize = (self.windowsize() == null) ? '' : self.windowsize();

                return windowtype + ' ' + windowsize;
            });
            self.category = ko.observable('');
            self.operation = ko.observable('');
            self.finishtype = ko.observable('');
            self.colour = ko.observable('');
            self.outersurface = ko.observable('');
            self.insectWidth = ko.observable('');
            self.insectHeight = ko.observable('');
            self.configureType = ko.computed(function() {
                if (self.category() == 'Shutters') {
                    return 'Shutter';
                } else if (self.category() == 'InsectNet') {
                    return 'InsectNet';
                } else {
                    return 'Blind';
                }
            });
            self.variantcode = ko.observable('');
            self.productioncode = ko.observable('');

            /* Set observables for the configuration texts */
            $.each(mmc.options, function(index, value) {
                self[value + 'Text'] = ko.computed(function() {
                    if (self[value]()) {
                        var optionText = '';

                        /* Loop through the data to grab the active option text */
                        $.each(mmc.vm.data['product' + product][value](), function(cat, options) {
                            var compareVal = (mmc.vm.controls.showCombination() && value == 'category') ? self[value]().match(/[A-Z][a-z]+/g)[product - 1] : self[value]();
                            if (options.val == compareVal) {
                                optionText = options.name;
                            }
                        });

                        return optionText;
                    }
                });
            });

            /* Set up the insect net width and height text */
            self.insectWidthHeight = ko.computed(function() {
                var insectWidth = (self.insectWidthText() == null) ? '' : self.insectWidthText(),
                    insectHeight = (self.insectHeightText() == null) ? '' : self.insectHeightText(),
                    insectSeparator = (self.insectWidthText() && self.insectHeightText()) ? ' / ' : '';

                return insectWidth + insectSeparator + insectHeight;
            });

            /* Set up obserables for ProductID and ProductPrice, formatting the price properly */
            self.productID = ko.observable('');
            self.serviceProductID = ko.observable('');
            self.productPrice = ko.observable('');
            self.formattedProductPrice = ko.computed(function() {
                var price = self.productPrice();

                /* If configuring a combination product, then add both product prices together */
                try {
                    if (mmc.vm.controls.showCombination() == true) {
                        if (product == 2 && mmc.vm.config.product1.productPrice()) {
                            // price = (parseFloat(mmc.vm.config.product1.productPrice()) + parseFloat(mmc.vm.config.product2.productPrice())).toFixed(2).toString();
                        } else {
                            return;
                        }
                    }

                } catch (err) {
                }

                /* Only return a price when there is a price set */
                return (price) ? mmc.formatPrice(price) : '';
                // return (price) ? priceSplit.join(mmc.settings.sepT) + '<span class="decimals">' + priceRight + '</span>' : '';
            });

            /* Set up observables to decide which elements to show */
            self.showProductRow = ko.observable('Blind');
            // self.showTurn = ko.observable(false);
            self.showFinishType = ko.observable(false);
            self.showCampaignText = ko.observable(false);
            self.showPrice = ko.observable(false);

            /* Function for checking which options are active upon building of templates */
            self.checkActive = function(category, elem) {
                return (self[category]() == elem) ? 'mmc__active' : '';
            }

        };

        var addonViewModel = function() {
            var self = this;

            self.VCE = ko.observable('');
            self.Name = ko.observable('');
            self.Desc = ko.observable('');
            self.ImageSrc = ko.observable('');
            self.Price = ko.observable('');
            self.Checked = ko.observable(false);

            /* Properties to be sent to the basket */
            self.productPrice = ko.observable('');
            self.serviceProductID = ko.observable('');
        }

        var dataViewModel = function() {
            var self = this;

            self.windowtype = ko.observableArray([
                { val: null, name: mmc.settings.selectTypeText }
            ]);
            self.windowsize = ko.observableArray([
                { val: null, name: mmc.settings.selectSizeText }
            ]);
            self.category = ko.observableArray([]);
            self.operation = ko.observableArray([]);
            self.finishtype = ko.observableArray([]);
            self.colour = ko.observableArray([]);
            self.outersurface = ko.observableArray([]);
            self.insectWidth = ko.observableArray([
                { val: null, name: null }
            ]);
            self.insectHeight = ko.observableArray([
                { val: null, name: null }
            ]);

        }

        /* Set-up Knockout ViewModels */
        mmc.vm = {
            controls: new controlsViewModel(),
            config: {
                product1: new configurationViewModel(1),
                product2: new configurationViewModel(2)
            },
            addon: new addonViewModel(),
            data: {
                product1: new dataViewModel(),
                product2: new dataViewModel()
            },
            settings: generalSettings
        }
        ko.applyBindings(mmc.vm);

        /* Before initialising the configurator, check if there are pre configuration settings. Use these to override the view models. Delete the generalSettings var afterwards */
        try {
            $.each(generalSettings, function(index, value) {
                if (typeof value === 'object') {
                    if (index === 'preConfig') {
                        $.each(value, function(configIndex, configValue) {
                            mmc.vm.config.product1[configIndex.toLowerCase()](configValue);
                        });
                    }
                }
            });
            delete generalSettings;
        } catch (error) {
        }

        /* Initiate the Configurator on page load */
        mmc.init();

        /* Clicking on the title bars switches the steps */
        mmc.dom.title.bind('click', function() {
            var step = $(this).closest('.mmc__configStep');
            if ((step.hasClass('mmc__filled') || step.hasClass('mmc__next')) && !step.hasClass('mmc__active') && (mmc.dom.activeStep().hasClass('mmc__filled') || (step.hasClass('mmc__filled') && step.index() < mmc.dom.activeStep().index()))) {
                lib.switchStep(step);
            }
        });
        mmc.dom.title.find('a').bind('click', function(e) {
            e.preventDefault();
        });

        /* Clicking on the edit buttons switches the steps */
        mmc.dom.edit.bind('click', function(e) {
            e.preventDefault();

            var step = mmc.dom.options.find('.mmc__configStep.mmc__' + $(this).attr('href').replace('#', ''));
            lib.switchStep(step);
        });

        /* Zoom the illustration when clicking on the image */
        mmc.dom.selection.on('click', 'img, .mmc__icon.mmc__zoom', function() {
            lib.zoomIllustration($(this).closest('.mmc__content').find('.mmc__window img'));
        });
        /* Turn the illustration when clicking on the turn icon */
        mmc.dom.selection.on('click', '.mmc__icon.mmc__turn', function() {
            mmc.trigger.type = 'turn';
            lib.updateIllustration();
        });

        /* Handlers for inactive options */
        mmc.dom.step.on({
            click: function() {
                return false;
            },
            mouseenter: function() {
                mmc.trigger.target = $(event.target).closest('.mmc__option');
                mmc.trigger.type = mmc.trigger.target.attr('name');

                lib.showInfoTooltip();
            },
            mouseleave: function() {
                lib.hideInfoTooltip();
            }
        }, '.mmc__option.mmc__inactive');

        /* Handlers for available options */
        mmc.dom.step.on({
            click: function(event) {
                // if ((navigator.userAgent.match(/MSIE 7/gi) || navigator.userAgent.match(/MSIE 8/gi)) && ($(event.target)[0].nodeName == 'LABEL' || $(event.target)[0].nodeName == 'TD')) {

                if ($(event.target).closest('.mmc__option').hasClass('mmc__active')) {
                    return false;
                }

                var inputVal = $(event.target).closest('.mmc__option').find('input').val(),
                    inputCategory = $(event.target).closest('.mmc__configStep').data('type'),
                    productIndex = 'product' + $(event.target).closest('.mmc__options').data('product');

                mmc.vm.config[productIndex][inputCategory](inputVal);

                /* When not clicking on the label, make sure to trigger the input click */
                if ($(event.target)[0].nodeName == 'TD') {
                    $(event.target).closest('.mmc__option').find('input').click();
                }

                $(event.target).closest('.mmc__option').find('input').change();

                return false;

                // }
            },
            mouseover: function(event) {
                /* Break this function when: Hovering over the active tooltip, option is finishtype */
                if ($(event.target).closest('.mmc__tooltip').length > 0 || $(event.target).closest('.mmc__option').hasClass('mmc__finishtype') || $(event.target).closest('.mmc__option').hasClass('mmc__disableTooltip')) {
                    return;
                }

                mmc.trigger.target = $(event.target).closest('.mmc__option').find('input');
                mmc.trigger.type = mmc.trigger.target.attr('name');

                lib.showOptionTooltip();
            },
            mouseout: function() {
                lib.hideOptionTooltip();
            }
        }, '.mmc__option:not(.mmc__option.mmc__inactive, .mmc__insectnet .mmc__option)');

        /* Handlers for icons */
        mmc.dom.base.on({
            mouseover: function(event) {
                if ($(event.target).find('span.mmc__message').length == 0 && $(event.target)[0].nodeName != 'LABEL' || mmc.trigger.infotip) {
                    return;
                }

                mmc.trigger.target = $(event.target);
                mmc.trigger.type = mmc.trigger.target.attr('name');

                lib.showInfoTooltip();
            },
            mouseout: function(event) {
                if ($(event.target).find('span.mmc__message').length == 0 && $(event.target)[0].nodeName != 'LABEL') {
                    return;
                }

                lib.hideInfoTooltip();
            }
        }, '.mmc__icon, .mmc__select.mmc__disabled');

        /* Pass select elements on to LABEL element for showing tooltip */
        mmc.dom.windows.on({
            mouseover: function(event) {
                $(event.target).closest('.mmc__select').find('label').mouseover();
            },
            mouseleave: function(event) {
                $(event.target).closest('.mmc__select').find('label').mouseleave();
            }
        }, '.mmc__select.mmc__disabled a, .mmc__select.mmc__disabled b, .mmc__select.mmc__disabled select');

        /* Select either straight or bent insect net type */
        mmc.dom.insectSelect.on({
            click: function(e) {
                e.preventDefault();

                $(this).closest('.mmc__insectNetTypes').find('.mmc__option').removeClass('mmc__active');
                $(this).closest('.mmc__option').addClass('mmc__active');
                $(this).closest('.mmc__configStep').removeClass('mmc__filled');

                mmc.dom.insect.find('.mmc__sizeRow.mmc__height2').hide();
                if ($(this).closest('.mmc__option').hasClass('mmc__bent')) {
                    mmc.dom.insect.find('.mmc__sizeRow.mmc__height2').show();
                    mmc.vm.controls.showProduct2(true);
                } else {
                    mmc.vm.controls.showProduct2(false);
                }

                /* Show the width and height select boxes */
                mmc.dom.insect.find('.mmc__insectNetSizes').slideDown(500, 'linear');

                /* Trigger the insect width change to update the select boxes, only when a width is already selected */
                if (mmc.vm.config.product1.insectWidth() != '') {
                    mmc.dom.insect.find('select[name="insectWidth"]').change();
                }

                /* Trigger custom function */
                mmc.settings.onSelectInsectNetType(mmc.settings.insect.shape());
            }
        });

        /* Trigger for Variant and Production code check */
        $('body').on({
            submit: function(event) {
                event.preventDefault();

                mmc.trigger.target = $(event.target).closest('.mmc__codeCheck');
                mmc.trigger.type = mmc.trigger.target.data('name');

                rules.checkCode();

                return false;
            }
        }, '.mmc__codeCheck form');
        $('body').on({
            click: function(event) {
                $(event.target).closest('.mmc__codeCheck').find('form').submit();
            }
        }, '.mmc__codeCheck button');

        /* Trigger for clicking on user message close button */
        mmc.dom.base.on({
            click: function() {
                lib.hideMessage();
            }
        }, '.mmc__userMessage .mmc__userMessageClose span');

        /* Trigger for adding products to a basket */
        mmc.dom.complete.on({
            click: function(event) {
                /* Trigger customer action: onBeforeAddToBasket */
                mmc.settings.onBeforeAddToBasket();

                /* Trigger custom function */
                mmc.settings.onButtonAddToBasket();

                mmc.trigger.target = $(event.target).closest('.mmc__button');
                mmc.trigger.type = 'gotobasket';

                var basket = mmc.buildRequest();
                mmc.dom.complete.find('#mmc__AddToBasket input').attr('name', 'productsinfo').val(basket);

                /* Trigger customer action: onAfterAddToBasket */
                mmc.settings.onAfterAddToBasket();

                if (mmc.settings.shopTarget == '_blank') {
                    setTimeout(function() { location.reload(); }, 200);
                } else if (mmc.settings.returnFunc != null) {
                    mmc.settings.returnFunc(basket);
                    return false;
                } else {
                    mmc.update();
                }
            }
        }, '.mmc__button button');

        /* Handlers for select boxes to enable/disable the purchase of a product */
        mmc.dom.complete.on({
            change: function(event) {
                mmc.trigger.target = $(event.target).closest('.mmc__product');
                mmc.trigger.type = 'productpurchase';

                var ischecked = $(event.target).is(':checked'),
                    targetIndex = mmc.trigger.target.index() + 1;

                if (targetIndex > 2) {
                    targetIndex = 'Addon';
                }
                mmc.vm.controls['buyProduct' + targetIndex](ischecked);
            }
        }, '.mmc__addToCart.mmc__checkbox input')

        /* Intiate Shadowbox popup windows */
        lib.initShadowbox();

        /* Trigger for clicking on the 'How do I find my type and size' button */
        mmc.dom.windows.on({
            click: function(event) {
                var content = mmc.dom.blocks.windowtypesize[0].outerHTML;

                /* Trigger custom function */
                mmc.settings.onButtonWindowUnknown();

                Shadowbox.open({
                    content: '<div class="mmc__infoPopup">' + content + '<div class="mmc__closePopup"><span class="mmc__text mmc__shadowBoxClose">' + mmc.settings.closeText + ' x</span></div></div>',
                    player: 'html',
                    width: 884,
                    options: {
                        displayNav: false
                    }
                });

                event.preventDefault();
            }
        }, '.mmc__options .mmc__button.mmc__small a')

        /* Trigger for clicking on user messages that require a code check */
        mmc.dom.complete.on({
            click: function(event) {
                var type = $(event.target).closest('.mmc__userMessage').hasClass('mmc__variant') ? 'variant' : 'production',
                    rule = $(event.target).closest('.mmc__userMessage').data('rule'),
                    content = mmc.dom.variant.find('.mmc__codeCheck.mmc__' + type)[0].outerHTML;

                Shadowbox.open({
                    content: '<div class="mmc__infoPopup">' + content + '<div class="mmc__closePopup"><span class="mmc__text mmc__shadowBoxClose">' + mmc.settings.closeText + ' x</span></div></div>',
                    player: 'html',
                    width: 884,
                    options: {
                        displayNav: false
                    }
                });
            }
        }, '.mmc__userMessage.mmc__codeCheck');

        /* Triggers for opening send email popup */
        mmc.dom.complete.on({
            click: function(e) {
                var popup = mmc.dom.blocks.mailerPopup;

                mmc.trigger.target = $(this);

                if ($('.mmc__mailerPopup:visible').length > 0) {
                    $('.mmc__mailerPopup').fadeOut(150);
                    return false;
                }

                $('.mmc__mailerPopup input').val('');
                $('.mmc__mailerPopup .mmc__sendingStatus').removeClass('mmc__sending mmc__success mmc__fail');

                popup.css({
                    top: mmc.trigger.target.offset().top + mmc.trigger.target.height() - mmc.dom.base.offset().top + 5,
                    left: mmc.trigger.target.offset().left - (popup.outerWidth() / 2) - mmc.dom.base.offset().left + 5
                }).fadeIn(150);

                e.preventDefault();
            },
            mouseenter: function() {
                mmc.trigger.enter = function() {
                    if (mmc.trigger.timeout != null) {
                        clearTimeout(mmc.trigger.timeout);
                        delete mmc.trigger.timeout;
                    }
                };
                mmc.trigger.enter();
            },
            mouseleave: function() {
                mmc.trigger.leave = function() {
                    if ($('.mmc__mailerPopup:visible').length == 0) {
                        return;
                    }
                    mmc.trigger.timeout = setTimeout(function() {
                        mmc.trigger.target.click();
                        delete mmc.trigger.timeout;
                        delete mmc.trigger.enter;
                        delete mmc.trigger.leave;
                    }, 1000);
                };
                mmc.trigger.leave();
            }
        }, '.mmc__shareButtons .mmc__button.mmc__mail');

        /* Triggers for the mail popup */
        mmc.dom.base.on({
            mouseenter: function() {
                mmc.trigger.enter();
            },
            mouseleave: function() {
                mmc.trigger.leave();
            }
        }, '.mmc__mailerPopup');

        /* Triggers for sending email with configuration */
        mmc.dom.base.on({
            submit: function(e) {
                /* Trigger custom function */
                mmc.settings.onButtonEmail();

                lib.submitSendProductsByMail(e);
            }
        }, '.mmc__mailerPopup form');

        /* Trigger for clicking on print button */
        mmc.dom.complete.on({
            click: function(e) {
                /* Trigger custom function */
                mmc.settings.onButtonPrint();

                window.print();
            }
        }, '.mmc__button.mmc__print a');

        /* Trigger for clicking on dealer button */
        mmc.dom.complete.on({
            click: function(e) {
                /* Trigger custom function */
                mmc.settings.onButtonDealer();
            }
        }, '.mmc__button.mmc__dealer a');
    });

})(window, document, jQuery);