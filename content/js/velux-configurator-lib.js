function loadConfiguratorFunctions(mmc, window, document, $) {

    var self = this;

    this.initShadowbox = function() {
        Shadowbox.init({
            skipSetup: true,
            animateFade: false,
            displayNav: true,
            handleOversize: "none",
            enableKeys: false,
            onOpen: function() {
                $('div#sb-container div#sb-loading-inner span').text($('div.mmc__siteSettings span.mmc__loadingText').text());
            },
            onFinish: function() {
                if ($('div.mmc__infoPopup').length > 0) {
                    $('#sb-wrapper-inner').height($('div.mmc__infoPopup').height() + 80);

                    if ($('div.mmc__infoPopup')[0].offsetHeight > $(window).height()) {
                        $('#sb-wrapper-inner').css({ top: $(window).scrollTop() });
                        $('body').addClass('sb-scrollable');
                    }
                }
                $('.mmc__infoPopup').on({
                    click: function() {
                        Shadowbox.close();
                    }
                }, '.mmc__shadowBoxClose');
            },
            onClose: function() {
                $('body').removeClass('sb-scrollable');
                $('#sb-wrapper-inner').removeAttr('style');
            }
        });
    }

    /* Check whether the browser matches the query */
    this.checkBrowser = function(browser) {
        if (navigator.userAgent.match(browser, 'gi')) {
            return true;
        } else {
            return false;
        }
    }

    /* Check which steps are filled when loading the configurator */
    this.checkFilledSteps = function(self) {
        var filledStep = [];

        mmc.dom.step.removeClass('mmc__filled mmc__next');

        /* Set the correct steps to filled */
        if (self.windowtype() && self.windowsize()) {
            filledStep.push('windows');
        }
        if (self.category()) {
            filledStep.push('category');
        }
        if (self.operation()) {
            filledStep.push('operation');
        }
        if (self.outersurface()) {
            filledStep.push('outersurface');
        }
        if (self.colour()) {
            filledStep.push('colour');
        }
        if (self.finishtype()) {
            filledStep.push('finishtype');
        }
        if (self.variantcode() && mmc.dom.variant.hasClass('mmc__required') && mmc.dom.variant.find('.mmc__codeCheck').hasClass('mmc__check')) {
            filledStep.push('variant');
        }
        if (self.insectWidth() && self.insectHeight()) {
            filledStep.push('insect')
        }

        $.each(filledStep, function(index, value) {
            mmc.dom[value].addClass('mmc__filled');
        });

        mmc.dom.options.find('.mmc__configStep.mmc__filled:last').nextAll('.mmc__required:first').addClass('mmc__next');
    }

    /* Set the index on each step during the configuration */
    this.setStepIndex = function() {
        $.each(mmc.dom.options.find('.mmc__configStep.mmc__required'), function(index, value) {
            $(value).find('.mmc__stepIndex td').text(index + 1);
        });
    }

    /* Check whether observable value already contains the checked value */
    this.checkObservableValue = function(obs, checkVal) {
        var valid = true;
        for (var i = 0, j = obs().length; i < j; i++) {
            if (obs()[i]['val'] == checkVal) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    /* Function to control the zooming of illustrations */
    this.zoomIllustration = function(image) {
        var imgSrc, imgAlt, newImg, oldLeft, newLeft, oldTop, newTop, oldWidth, newWidth, newHeight, recalc;

        imgSrc = image.attr('src');
        imgSrc = imgSrc.split('illustrations/');
        imgAlt = image.attr('alt');
        newImg = '<img src="' + imgSrc[0] + 'illustrations/large/' + imgSrc[1] + '" alt="' + imgAlt + '" />';

        function setOldValues() {
            oldTop = image.offset().top;
            oldTop -= $(window).scrollTop();
            oldLeft = image.offset().left;
            oldWidth = image.width();
        }

        function closeZoomIllustration() {
            setOldValues();

            $('.mmc__illustrationZoom img').animate({ 'left': oldLeft, 'top': oldTop, 'width': oldWidth, 'opacity': 0 }, 500);
            $('.mmc__illustrationZoom div.mmc__close').remove();
            $('.mmc__illustrationZoom div.mmc__background').animate({ 'opacity': 0 }, 500, function() {
                $('.mmc__illustrationZoom').remove();
            });
        }

        $(newImg).load(function() {
            setOldValues();

            $('body').prepend('<div class="mmc__illustrationZoom"><div class="mmc__close"><div class="mmc__border mmc__left">&nbsp;</div><div class="mmc__border mmc__right">&nbsp;</div>X</div><div class="mmc__background">&nbsp;</div>' + newImg + '</div>');

            newWidth = $('.mmc__illustrationZoom img').width();
            newHeight = $('.mmc__illustrationZoom img').height();

            if (newHeight > $(window).height()) {
                recalc = (($(window).height() / newHeight) - 0.05);

                newWidth = newWidth * recalc;
                newHeight = newHeight * recalc;
            }

            newLeft = ($(window).width() / 2) - (newWidth / 2);
            newTop = ($(window).height() / 2) - (newHeight / 2);

            $('.mmc__illustrationZoom div.mmc__background').css({ 'opacity': 0 });
            $('.mmc__illustrationZoom div.mmc__background').animate({ 'opacity': 0.7 }, 500);

            $('.mmc__illustrationZoom img').css({ 'left': oldLeft, 'top': oldTop, 'width': oldWidth, 'opacity': 0 });
            $('.mmc__illustrationZoom img').animate({ 'left': newLeft, 'top': newTop, 'width': newWidth, 'opacity': 1 }, 500, function() {
                $('.mmc__illustrationZoom div.mmc__close').css({ 'left': newLeft + newWidth + $('.mmc__illustrationZoom div.mmc__border').outerWidth(), 'top': newTop });
            });

            $('.mmc__illustrationZoom div.mmc__close').bind('click', function() { closeZoomIllustration(); });

        }).error(function() {
            // Do nothing
        });
    }

    /* Function for showing the correct illustration on each update */
    this.updateIllustration = function() {

        if (mmc.settings.turning == true) {
            return;
        }

        var config = mmc.vm.config,
            illustration = {},
            newIllustration,
            combiIndex;

        /* Swap the default product name when clicked on turnIllustration */
        if (mmc.trigger.type == 'turn') {
            mmc.settings.defaultImg = (mmc.settings.defaultImg == 'product1') ? 'product2' : 'product1';
        }

        $.each(config, function(index, product) {
            /* When a combination is showing, create a combiIndex for splitting the category in two */
            if (mmc.vm.controls.showCombination() == true) {
                combiIndex = index.replace('product', '') - 1;
                if (mmc.trigger.type != 'turn') {
                    mmc.settings.defaultImg = 'product' + mmc.trigger.target.closest('.mmc__options').attr('data-product');
                }
            }

            /* Add the selection into an array */
            illustration[index] = {
                category: (mmc.vm.controls.showCombination() == true) ? product.category().match(/[A-Z]*[^A-Z]+/g)[combiIndex] : product.category(),
                operation: product.operation(),
                colour: (product.category() == 'Shutters') ? product.outersurface() : product.colour()
            };
        });

        newIllustration = self.getIllustrationURL(illustration[mmc.settings.defaultImg]);

        mmc.dom.selection.find('.mmc__window .mmc__newImg').append(newIllustration);

        /* Set a mini timeout to make sure the observables are updated */
        self.swapIllustrations();

    }

    /* Function for formatting the image url */
    this.getIllustrationURL = function(image) {
        var img = $('<img />'),
            imgSrc = [];

        if (!image.category) {
            imgSrc.push('window');
        } else {
            if (image.category) {
                imgSrc.push(image.category);
            }
            if (image.operation) {
                imgSrc.push(image.operation);
            }
            if (image.colour) {
                imgSrc.push(image.colour);
            }
        }

        function loadImage() {
            img.attr('src', mmc.settings.ill.loc() + imgSrc.join('-') + '.png').attr('alt', imgSrc.join(' ')).load().error(function() {
                /* If a colour is selected but image cannot be loaded, clear the colour */
                if (image.colour) {
                    imgSrc.splice(1, 1);
                    delete image.colour;
                    /* If no colour is selected, a operation is selected and the image cannot be loaded, clear the operation */
                } else if (image.operation) {
                    imgSrc.splice(1, 1);
                    delete image.operation;
                } else if (imgSrc.indexOf('window') === -1) {
                    imgSrc = ['window'];
                } else {
                    return false;
                }

                /* Try and load the image again after clearing the operation
				 * When nothing can be found, default back to window.png
				 * Stop when nothing can be found
				  */
                loadImage(img);
            });
        };

        loadImage();

        return img;
    }

    /* Function for swapping the illustrations */
    this.swapIllustrations = function() {
        var windows = mmc.dom.selection.find('.mmc__window'),
            oldImg = windows.find('.mmc__oldImg'),
            newImg = windows.find('.mmc__newImg');

        mmc.settings.turning = true;

        oldImg.find('img').fadeOut(500, function() {
            oldImg.empty();
        });
        newImg.find('img').fadeIn(500, function() {
            $(this).appendTo(oldImg);
            mmc.settings.turning = false;
        });
    }

    /* Function for switching steps */
    this.switchStep = function(newStep) {

        /* Don't allow switching of steps when animating */
        if (mmc.sliding == true) {
            return false;
        }

        /* Trigger customer action: onBeforeNext */
        mmc.settings.onBeforeSwitchStep();

        /* Set the current active step and new step and animate between them */
        var activeStep = mmc.dom.activeStep(),
            nextStep = (newStep) ? newStep : $(activeStep.nextAll('.mmc__required')[0]);

        /* Allow moving to next step when the active step if filled, or when the next step if filled but is not window */
        if (activeStep.hasClass('mmc__filled') || (nextStep.hasClass('mmc__filled') && !activeStep.hasClass('mmc__window'))) {
            mmc.sliding = true;
            activeStep.find('.mmc__content').slideUp(500, 'linear', function() {
                $(this).closest('.mmc__configStep').removeClass('mmc__active');
                mmc.sliding = false;
            });
            nextStep.find('.mmc__content').slideDown(500, 'linear', function() {
                $(this).closest('.mmc__configStep').addClass('mmc__active'); /* Trigger customer action: onAfterSwitchStep */
                mmc.settings.onAfterSwitchStep();
            });

            /* Animate the Selection block vertically */
            mmc.dom.selection.animate({ marginTop: mmc.measure.stepHeight * nextStep.index('.mmc__required') }, 500, 'linear');

            if (activeStep.find('.mmc__userMessage').length > 0 && activeStep.data('type') != 'complete') {
                self.hideMessage();
            }

            if (nextStep.hasClass('mmc__complete')) {
                mmc.dom.selection.find('.mmc__product:not(.mmc__product.mmc__hidden)').slideUp(500, 'linear', function() { mmc.vm.controls.showSelectionProducts(false); });
            } else {
                mmc.vm.controls.showSelectionProducts(true);
                if (mmc.dom.activeStep().hasClass('mmc__complete')) {
                    mmc.dom.selection.find('.mmc__product:not(.mmc__product.mmc__hidden)').hide();
                }
                mmc.dom.selection.find('.mmc__product:not(.mmc__product.mmc__hidden)').slideDown(500, 'linear');
            }

        } else {
            self.showMessage();
        }
    }

    /* Function for resetting configuration steps, after the current active step */
    this.resetSteps = function() {
        var steps = mmc.trigger.target.closest('.mmc__configStep').nextAll().not('.mmc__complete'),
            data = mmc.vm.data,
            config = mmc.vm.config,
            type;

        $.each(steps, function(index, value) {
            type = $(value).data('type');

            /* Reset the data settings for both products */
            $.each(data, function(index, product) {
                if (product[type]) {
                    product[type].removeAll();
                }
                if (type == 'insectnet') {
                    product.insectWidth.removeAll();
                    product.insectHeight.removeAll();
                }
            });

            /* Reset the config settings for both products */
            $.each(config, function(index, product) {
                if (product[type]) {
                    product[type]('');
                }
                if (type == 'insectnet') {
                    product.insectWidth('');
                    product.insectHeight('');
                }
            });
        });

        mmc.vm.controls.showQuestion(false);
    }

    /* Function for selecting the correct window input */
    this.selectWindowInput = function() {
        var config = mmc.vm.config.product1;

        /* If no option is selected, select window type first */
        if (!config.windowtype() && !config.windowsize()) {
            mmc.dom.windows.find('select#windowtype').trigger("chosen:updated");
            // mmc.dom.windows.find('.mmc__select.type a').mousedown();

            /* If window type is already selected, select window size */
        } else if (config.windowtype() && !config.windowsize()) {
            self.hideInfoTooltip();
            mmc.dom.windows.find('select#windowtype').trigger("chosen:updated");
            mmc.dom.windows.find('select#windowsize').removeAttr('mmc__disabled').trigger("chosen:updated");
            mmc.dom.windows.find('.mmc__select.mmc__size a').mousedown();

            /* If both window type and window size are selected, focus on the next button */
        } else if (config.windowtype() && config.windowsize()) {
            mmc.dom.windows.find('select#windowtype, select#windowsize').removeAttr('disabled').trigger("chosen:updated");
            mmc.dom.windows.find('.mmc__buttonBar .mmc__button a').focus();
        }
    }

    this.showMessage = function(message, messageType, messageIcon) {
        var config = mmc.vm.config,
            type = mmc.dom.activeStep().data('type');

        if (mmc.dom.activeStep().find('.mmc__userMessage').length > 0) {
            self.hideMessage(0);
        }

        mmc.dom.activeStep().find('.mmc__content').append(mmc.dom.blocks.usermessage.clone());

        mmc.dom.message.base().addClass(messageType);

        mmc.dom.message.text().text('');
        mmc.dom.message.text().append('<ul></ul>');

        function appendList(message) {
            mmc.dom.message.text().find('ul').append('<li>' + message + '</li>')
        }

        if (message != undefined) {
            appendList(message)
        } else {
            if (type == 'window') {
                if (!config.product1.windowtype()) {
                    appendList(mmc.dom.windows.find('div.mmc__select.mmc__type label').text());
                }
                if (!config.product1.windowsize()) {
                    appendList(mmc.dom.windows.find('div.mmc__select.mmc__size label').text());
                }

            } else {
                message = mmc.dom.selection.find('.mmc__product:first .mmc__productRow.mmc__selection.mmc__' + type + ' span.mmc__type').text().trim();
                if (message.charAt(message.length - 1) == ':') {
                    message = message.slice(0, -1);
                }

                appendList(message);
            }
        }

        if (mmc.dom.activeStep().find('.mmc__content').offset().top < $(window).scrollTop()) {
            offset = $(window).scrollTop();
            offset -= mmc.dom.activeStep().find('.mmc__content').offset().top;

            mmc.dom.message.base().css('marginTop', offset);

        } else {
            mmc.dom.message.base().css('marginTop', 'auto');
        }

        mmc.dom.message.base().fadeIn(200);

    }

    /* Hide the user message */
    this.hideMessage = function(fadeSpeed) {
        // mmc.dom.message.base().fadeOut((fadeSpeed === undefined) ? 200 : fadeSpeed, function () { mmc.dom.message.base().remove(); });
        mmc.dom.base.find('.mmc__userMessage:not(.mmc__configStep.mmc__complete .mmc__userMessage)').fadeOut((fadeSpeed === undefined) ? 200 : fadeSpeed, function() { $(this).remove(); });
    }

    /* Show the option tooltips */
    this.showOptionTooltip = function() {

        if (mmc.settings.tooltip.timeout) {
            clearTimeout(mmc.settings.tooltip.timeout);
            mmc.settings.tooltip.timeout = null;
        }

        /* If triggered when the tooltip is already opened, break the function */
        if (mmc.settings.tooltip.open && mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltip').length > 0) {
            clearTimeout(mmc.settings.tooltip.open);
            mmc.settings.tooltip.open = null;

            return;
        }

        mmc.settings.tooltip.timeout = setTimeout(function() {

            var typeMatch = {
                    category: 'images/configurator/blindtype/',
                    colour: 'images/colours/large/',
                    pk10: 'images/colours/pk10/',
                    operation: 'images/configurator/operation/',
                    outersurface: 'images/configurator/surface/',
                    finishtype: 'images/configurator/addon/'
                },
                /* imgName is the category that's active in order to get the correct Operation Image */
                imgName = (mmc.dom.activeStep().hasClass('mmc__operation')) ? mmc.vm.config[mmc.trigger.target.closest('.mmc__options').attr('class').replace('mmc__options', '').replace(' ', '').replace('mmc__', '')].category() : '';

            /* Split the imgName into 2 and select the one that's hovered */
            if (mmc.vm.controls.showCombination() == true && imgName) {
                imgName = imgName.match(/[A-Z]*[^A-Z]+/g)[mmc.trigger.target.closest('.mmc__options').attr('data-product') - 1];
            }


            if (mmc.trigger.type == 'colour') {

                mmc.trigger.target.closest('.mmc__option').append(mmc.dom.blocks.tooltipColors.clone());
                mmc.dom.tooltip = mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltipk15');
                console.log(imgName);
                console.log(mmc.trigger.target.val());
                mmc.dom.tooltip.find('.mmc__tooltipImage img').attr('src', mmc.settings.directory + 'content/' + typeMatch[mmc.trigger.type] + imgName + mmc.trigger.target.val().replace('/', '-') + '.png');
                mmc.dom.tooltip.find('.mmc__tooltipImageTransparent img').attr('src', mmc.settings.directory + 'content/' + typeMatch['pk10'] + imgName + mmc.trigger.target.val().replace('/', '-') + '.png');
                mmc.dom.tooltip.find('.mmc__tooltipTitle').html(mmc.trigger.target.closest('.mmc__option').find('.mmc__optionTitle').text());

                var trans_id = mmc.trigger.target.closest('.mmc__option').find('.mmc__optionTransparency').text();
                var trans_desc = mmc.trigger.target.closest('.mmc__option').find('.mmc__optionTransDesc').text();

                mmc.dom.tooltip.find('.mmc__tooltipInfo').html('<div class="mmc__icon mmc__transparencyLevel mmc__level' + trans_id + '">' + trans_id + '</div>&nbsp;: ' + trans_desc);
                if (mmc.trigger.target.closest('.mmc__option').hasClass('BlackoutDisney') || mmc.trigger.target.closest('.mmc__option').hasClass('RomanDesign')) {
                    mmc.dom.tooltip.addClass('mmc__verticalimages_tooltip');
                }

            } else {
                mmc.trigger.target.closest('.mmc__option').append(mmc.dom.blocks.tooltip.clone());
                mmc.dom.tooltip = mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltip');
                mmc.dom.tooltip.find('.mmc__tooltipImage img').attr('src', mmc.settings.directory + 'content/' + typeMatch[mmc.trigger.type] + imgName + mmc.trigger.target.val() + '.png');
                mmc.dom.tooltip.find('.mmc__tooltipDescription .mmc__tooltipTitle').html(mmc.trigger.target.closest('.mmc__option').find('.mmc__optionTitle').text());
                mmc.dom.tooltip.find('.mmc__tooltipDescription .mmc__tooltipInfo').html(mmc.trigger.target.closest('.mmc__option').find('.mmc__optionDesc').text());

            }
            var tooltipClass = mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltipk15').size() == 1 ? '.mmc__tooltipk15' : '.mmc__tooltip';


            mmc.dom.tooltip.fadeIn((navigator.userAgent.match(/MSIE 7/gi) || navigator.userAgent.match(/MSIE 8/gi)) ? 0 : 300);

            mmc.settings.tooltip.optionOffset = mmc.dom.tooltip.find('.mmc__tooltipImage').offset();
            mmc.settings.tooltip.tooltipWidth = mmc.dom.tooltip.find('.mmc__tooltipDescription').width();

            if (mmc.trigger.type == 'colour') {
                mmc.settings.tooltip.tooltipWidth += mmc.dom.tooltip.find('.mmc__tooltipImage').outerWidth();
            }

            mmc.settings.tooltip.optionRightOffset = mmc.settings.tooltip.optionOffset.left;
            mmc.settings.tooltip.optionRightOffset += mmc.settings.tooltip.tooltipWidth;
            mmc.settings.tooltip.optionRightOffset += 5; // Small margin account for a 5 pixel distance from the browser edge

            mmc.settings.tooltip.optionTopOffset = mmc.settings.tooltip.optionOffset.top;
            mmc.settings.tooltip.optionTopOffset -= $(window).scrollTop();

            if (mmc.settings.tooltip.optionOffset.left < 0) {
                if (mmc.trigger.type == 'colour') {
                    mmc.dom.tooltip.offset({ left: mmc.dom.tooltip.find('.mmc__tooltipImage').width() / 2 }).addClass('mmc__alignLeft');
                } else {
                    mmc.dom.tooltip.offset({ left: 5 });
                }
            }
            if (mmc.settings.tooltip.optionRightOffset > $(window).width()) {
                if (mmc.trigger.type == 'colour') {
                    mmc.settings.tooltip.tooltipWidth -= (mmc.dom.tooltip.find('.mmc__tooltipImage').width() / 2) - 10;
                } else {
                    mmc.dom.tooltip.addClass('mmc__alignRight');
                }

                mmc.dom.tooltip.offset({ left: ($(window).width() - mmc.settings.tooltip.tooltipWidth - 5) });
            }

            if (mmc.dom.tooltip.hasClass('mmc__alignRight')) {
                mmc.settings.tooltip.optionTopOffset -= (mmc.dom.tooltip.find('.mmc__tooltipImage').height() / 2) + 20;
            }

            if (mmc.settings.tooltip.optionTopOffset < 0) {
                if (mmc.trigger.type == 'colour') {
                    if (mmc.dom.tooltip.hasClass('mmc__alignLeft')) {
                        mmc.settings.tooltip.optionTopOffset = mmc.dom.tooltip.offset().top + mmc.dom.tooltip.outerHeight() + 164;
                    } else {
                        mmc.settings.tooltip.optionTopOffset = mmc.dom.tooltip.offset().top + mmc.dom.tooltip.outerHeight() + 100;
                    }

                    mmc.dom.tooltip.offset({ top: mmc.settings.tooltip.optionTopOffset });

                } else {
                    mmc.dom.tooltip.addClass('mmc__alignBottom');
                }
            }

            mmc.settings.tooltip.timeout = null;
            mmc.settings.tooltip.open = true;

        }, 400);

    }

    /* Hide the option tooltips */
    this.hideOptionTooltip = function() {

        if (mmc.settings.tooltip.timeout) {
            clearTimeout(mmc.settings.tooltip.timeout);
            mmc.settings.tooltip.timeout = null;
        }

        /* Add a small timeout so that the tooltip does not disappear when hovering over elements within the option */
        var currentTooltip = mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltip');
        var currentTooltipk15 = mmc.trigger.target.closest('.mmc__option').find('.mmc__tooltipk15');
        mmc.settings.tooltip.open = setTimeout(function() { currentTooltip.remove(); }, 1);
        mmc.settings.tooltip.open = setTimeout(function() { currentTooltipk15.remove(); }, 1);

    }

    this.showInfoTooltip = function() {

        var marginLeft = (mmc.trigger.target.css('marginLeft') == 'auto') ? '0' : parseFloat(mmc.trigger.target.css('marginLeft'));

        mmc.dom.base.append(mmc.dom.blocks.infotip.clone());
        mmc.dom.infotip = mmc.dom.base.find('.mmc__infotip');

        mmc.settings.infotip.message = (mmc.trigger.target.find('.mmc__message').text() != '') ? mmc.trigger.target.find('.mmc__message').text() : mmc.settings.infotipMessage;
        mmc.dom.infotip.find('.mmc__infotipMessage').text(mmc.settings.infotip.message);

        mmc.dom.infotip.show().css({
            top: mmc.trigger.target.offset().top - (mmc.dom.infotip.height() + 10) - mmc.dom.base.offset().top + 10,
            left: mmc.trigger.target.offset().left + ((mmc.trigger.target.width() - marginLeft - mmc.dom.infotip.find('.mmc__border').width() - mmc.dom.infotip.width()) / 2) - mmc.dom.base.offset().left + 10
        });

        if (mmc.settings.infotip.offsetRight > $(window).width()) {
            mmc.dom.infotip.addClass('mmc__right');
            mmc.dom.infotip.removeAttr('mmc__style');
        } else if (mmc.settings.infotip.offsetLeft < 0) {
            mmc.dom.infotip.addClass('mmc__left');
            mmc.dom.infotip.removeAttr('mmc__style');
        }

    }

    this.hideInfoTooltip = function() {
        if (mmc.dom.infotip != null) {
            mmc.dom.infotip.remove();
        }
        mmc.dom.infotip = null;
    }

    this.clearCompleteStep = function() {
        /* Always hide the addon product when refreshing the available products */
        mmc.vm.controls.showAddon(false);

        /* Reset the required options for rules */
        mmc.settings.rules.list = {};
        $.each(mmc.settings.rules.variant, function(index, value) {
            mmc.settings.rules.variant[index] = null;
        });
        $.each(mmc.settings.rules.production, function(index, value) {
            mmc.settings.rules.variant[index] = null;
        });

        /* Reset the classes on configured products */
        // mmc.dom.complete.removeClass('stopPurchase');
        mmc.dom.complete.find('.mmc__product').removeClass('mmc__disabled');

        /* Remove all user message from previous configuration */
        mmc.dom.complete.find('.mmc__userMessage').remove();
    }

    this.sendProductsByMail = function(e) {

        e.preventDefault();

        /* Create the mail object to store the configuration data */
        var bodyObj = {
                subject: mmc.dom.complete.find('.mmc__contentSubTitle').text(),
                title: mmc.dom.complete.find('.mmc__contentTitle').text(),
                subtitle: mmc.dom.complete.find('.mmc__contentSubTitle').text(),
                recipient: $('.mmc__mailerPopup input').val(),
                image: mmc.dom.selection.find('.mmc__window div.mmc__oldImg img').attr('src')
            },
            usermessageArray = [],
            productsArray = [],
            productsRow = [],
            products = [],
            addonArray = [],
            rowClass,
            status = $('.mmc__mailerPopup .mmc__sendingStatus'),
            re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!re.test(bodyObj.recipient)) {
            return false;
        }

        /* Set the trigger type to sendmail for the buildRequest function */
        mmc.trigger.type = 'sendmail';

        /* Add the user messages to the mail obj */
        if (mmc.dom.complete.find('.mmc__userMessage:visible').length > 0) {
            $.each(mmc.dom.complete.find('.mmc__userMessage'), function(index, value) {
                usermessageArray.push('"' + $(value).data('rule') + '":"' + mmc.settings.rules.list[$(value).data('rule')].PostText + '"');
            });
            bodyObj.usermessages = '{' + usermessageArray.join(',') + '}';
        }

        /* Add the product information */
        $.each(mmc.dom.complete.find('.mmc__product:not(.mmc__product.mmc__addon)'), function(index, value) {
            products = [];

            $.each($(value).find('.mmc__productRow:visible'), function(row, info) {
                rowClass = $(info).attr('class').replace('mmc__productRow', '').replace('mmc__ticked', '').replace('mmc__selection', '').trim();
                productsRow = [];

                if (rowClass == 'placement') {
                    productsRow.push('"val":"' + $(info).find('span:visible').text() + '"');

                } else if (rowClass == 'title') {
                    productsRow.push('"val":"' + ($(info).find('span.mmc__type').text() + ' ' + $(info).find('span.mmc__value').text()).trim() + '"');

                } else if (rowClass == 'campaigntext') {

                } else if (rowClass == 'price') {
                    productsRow.push('"from":"' + $(info).find('div.mmc__label').text() + '"');
                    productsRow.push('"price":"' + $(info).find('div.mmc__amount').text().replace($(info).find('div.mmc__amount span.mmc__from').text(), '').trim() + '"');

                } else if ($(info).hasClass('mmc__selection')) {
                    productsRow.push('"title":"' + $(info).find('span.mmc__type').text() + '"');
                    productsRow.push('"val":"' + $(info).find('span.mmc__value').text() + '"');
                }

                products.push('"' + rowClass + '":{' + productsRow.join(',') + '}');
            });

            productsArray.push('"' + index + '":{' + products.join(',') + '}');
        });
        bodyObj.products = '{' + productsArray.join(',') + '}';

        /* Add the addon information */
        if (mmc.dom.complete.find('.mmc__product.mmc__addon:visible').length > 0) {
            var addon = mmc.dom.complete.find('.mmc__product.mmc__addon');

            addonArray.push('"product":"' + (addon.find('.mmc__productRow.mmc__title span.mmc__type').text() + ' ' + addon.find('.mmc__productRow.mmc__title span.mmc__value').text()).trim() + '"');
            addonArray.push('"title":"' + addon.find('.mmc__productName').text() + '"');
            addonArray.push('"desc":"' + addon.find('.mmc__productDesc').text() + '"');
            addonArray.push('"priceLabel":"' + addon.find('.mmc__productRow.mmc__price div.mmc__label').text() + '"');
            addonArray.push('"price":"' + addon.find('.mmc__productRow.mmc__price div.mmc__amount').text().replace(addon.find('.mmc__productRow.mmc__price span.mmc__from').text(), '').trim() + '"');

            bodyObj.addon = '{' + addonArray.join(',') + '}';
        }

        status.addClass('mmc__sending');

        /* AJAX request to SOAP Services */
        $.ajax({
            dataType: 'jsonp',
            jsonpCallback: 'jsonCallback',
            type: "GET",
            url: mmc.buildRequest(),
            data: bodyObj,
            success: function(data) {
                status.addClass('mmc__success').removeClass('mmc__sending');
            },
            error: function(err) {
                status.addClass('mmc__fail').removeClass('mmc__sending');
                // alert('fail');
            }
        });

    }

}

/* Returns true to the insert-velux-configurator.js file to indicate when file has loaded */
function configuratorLoaded(obj) {
    return true;
}