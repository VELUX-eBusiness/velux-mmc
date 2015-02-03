///#source 1 1 /media/com_configurator/mmc/content/js/velux-configurator-rules.js
function loadRulesFunctions(mmc, lib, window, document, $) {

	/*
	*	This document is intended to control all the behavior around the rules
	*	The purpose of this JavaScript is to provide an easy overview over the different behaviours of the rules,
	*	not to optimise the JS to have the fewest possible functions
	*/
	var self = this;
	
	/* Process the rules object that includes all the rules that apply to the configuration */
	this.process = function (ruleList) {
	
		/* If rules are set to disabled, do not initialise the rules functions */
		if (mmc.settings.disableRules == true) {
			return;
		}
	
		$.each(ruleList, function (ruleNo, rule) {
			mmc.settings.rules.variantUnknown = rule.VariantUnknown;
			mmc.settings.rules.productionUnknown = rule.ProductionUnknown;
			
			try {
				self['Rule' + ruleNo](rule);
			} catch (err) {
				self.RuleDefault(rule);
			}
		});
		
		/* If, after checking the rules, a fourth question is required and the complete step is currently active, trigger setActiveStep function */
		if (mmc.vm.controls.showQuestion() && mmc.dom.complete.hasClass('mmc__active')) {
			mmc.dom.complete.removeClass('mmc__active');
			mmc.dom.complete.find('.mmc__content').hide();
			mmc.dom.selection.find('.mmc__product:not(.mmc__hidden)').show();
			
			mmc.setActiveStep();
		}
	}
	
	/* Set up some default behaviors and bind a set of rules to them */
	var behavior = {
		normal: {
			run: function (rule) {
				var messageType = ['note'];
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['8','10','11','100','101','102','103','501']
		},
		/* Behavior to show an adapter, not requiring a Variant or Production code check */
		adapter: {
			run: function (rule) {
				var messageType = ['note'];
				
				self.showAddonProduct(rule);
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['503']
		},
		/* Behavior for configuring an Insect Net, showing the adapter only when two products are configured */
		insect: {
			run: function (rule) {
				var messageType = ['note'];
				
				if (mmc.vm.controls.showProduct2()) {
					self.showAddonProduct(rule);
				
					/* Show the user message as last, after all checks have completed */
					self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
				}
			},
			range: ['504']
		},
		/* Specific to rule 505: Solar Awning and Shutter do not fit a window size starting with B, C or F */
		rule505: {
			run: function (rule) {
				var messageType = ['error'],
					config = mmc.vm.config.product1;
				
				/* Show the user message only when window size start with a B, C or F */
				if (config.windowsize().charAt(0) == 'B' || config.windowsize().charAt(0) == 'C' || config.windowsize().charAt(0) == 'F') {
					self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
				}
				
			},
			range: ['505']
		},
		/* Specific rule to 506: Blackout, Venetian, Pleated for VL 045/Y45 */
		rule506: {
			run: function (rule) {
				var messageType = ['note'],
					config = mmc.vm.config.product1;
				
				/* Show the user message when the window size does not start with a Y */
				if (config.windowsize().charAt(0) != 'Y') {
					self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
				}
			},
			range: ['506']
		},
		/* Production check relies on the AskForProductCode to decide whether the variant check is required or optional */
		production: {
			run: function (rule) {
				var messageType = ['note'];
				
				/* Check to see if the rule has a product set */
				if (rule.Product) {
					if (rule.Product.AskForProductCode) {
					
						messageType.push('production');
						
						mmc.settings.rules.production.MatchFoundTrue = function (ruleNo) {
							mmc.trigger.target.addClass('mmc__check');
							self.showRuleMessage(rule, rule.ProductionTrue, 'check', 'tick');
							
							if (rule.RuleNo == '9') {
								var product = mmc.dom.base.find('.mmc__product[data-productid*="MAD"]');
								product.removeClass('mmc__disabled');
								
								// mmc.dom.complete.removeClass('stopPurchase');
							}
						}
						mmc.settings.rules.production.MatchFoundFalse = function () {
							mmc.trigger.target.addClass('mmc__error');
							self.showRuleMessage(rule, rule.ProductionFalse, 'error', 'exclamation');
							
							if (rule.RuleNo == '9') {
								var product = mmc.dom.base.find('.mmc__product[data-productid*="MAD"]');
								product.addClass('mmc__disabled');
								
								if (mmc.dom.complete.find('.mmc__products .mmc__product.mmc__disabled').length == mmc.dom.complete.find('.mmc__products .mmc__product').length) {
									// mmc.dom.complete.addClass('stopPurchase');
								}
							}
						}
					}
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['1','2','3','4','6','9']
		},
		/* Production check relies on the AskForProductCode to decide whether the variant check is required or optional, and shows or hides the respective addon product */
		productionAddon: {
			run: function (rule) {
				var messageType = ['note'];
				
				/* Check to see if the rule has a product set */
				if (rule.Product) {
					if (rule.Product.AskForProductCode) {
					
						messageType.push('production');
					
						mmc.settings.rules.production.MatchFoundTrue = function (ruleNo) {
							mmc.trigger.target.addClass('mmc__check');
							self.showRuleMessage(rule, rule.ProductionTrue, 'check', 'tick');
							
							if (ruleNo != '' && rule.Addon) {
								self.showAddonProduct(rule);
								// mmc.vm.controls.showAddon(true);
							} else {
								self.hideAddonProduct(rule);
								// mmc.vm.controls.showAddon(false);
							}
						}
						mmc.settings.rules.production.MatchFoundFalse = function () {
							mmc.trigger.target.addClass('mmc__error');
							self.showRuleMessage(rule, rule.ProductionFalse, 'error', 'exclamation');
							
							if (rule.Addon) {
								self.hideAddonProduct(rule);
								// mmc.vm.controls.showAddon(false);
							}
						}
					}
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['5']
		},
		/* Variant check relies on the CheckForTypeSignVariant to decide whether the variant check is required or optional */
		variant: {
			run: function (rule) {
				var messageType = ['note'];
				
				if (rule.Product) {
					if (rule.Product.AskForTypeSignVariant) {
						if (rule.Variant == 1) {
							mmc.vm.controls.showQuestion(true);
							lib.setStepIndex();
							
						} else if (rule.Variant == 2) {
							messageType.push('variant');
						}
						
						/* Set up MatchFound functions for Rule 7 */
						if (!mmc.settings.rules.variant.MatchFoundTrue) {
							mmc.settings.rules.variant.MatchFoundTrue = function (ruleNo) {
								mmc.trigger.target.addClass('mmc__check');
								self.showRuleMessage(rule, rule.VariantTrue, 'check', 'tick');
								
								if (rule.RuleNo == '7') {
									var product = mmc.dom.base.find('.mmc__product[data-productid*="MAL"]');
									// product.removeClass('disabled');
									mmc.vm.controls.buyProduct2(true);
									
									// mmc.dom.complete.removeClass('stopPurchase');
								}
							}
						}
						if (!mmc.settings.rules.variant.MatchFoundFalse) {
							mmc.settings.rules.variant.MatchFoundFalse = function () {
								mmc.trigger.target.addClass('mmc__check');
								self.showRuleMessage(rule, rule.VariantFalse, 'error', 'exclamation');
								
								if (rule.RuleNo == '7') {
									var product = mmc.dom.base.find('.mmc__product[data-productid*="MAL"]');
									// product.addClass('disabled');
									mmc.vm.controls.buyProduct2(false);
									
									if (mmc.dom.complete.find('.mmc__products .mmc__product.mmc__disabled').length == mmc.dom.complete.find('.mmc__products .mmc__product').length) {
										// mmc.dom.complete.addClass('stopPurchase');
									}
								}
							}
						}
					}
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['7','12','103']
		},
		/* Variant check width addon relies on the CheckForTypeSignVariant to decide whether the variant check is required or optional */
		variantAddon: {
			run: function (rule) {
				var messageType = ['note'];
				
				if (rule.Variant == 1) {
					mmc.vm.controls.showQuestion(true);
					lib.setStepIndex();
					
				} else if (rule.Variant == 2) {
					messageType.push('variant');
				}
				
				mmc.settings.rules.variant.MatchFoundTrue = function (ruleNo) {
					mmc.trigger.target.addClass('mmc__check');
					self.showRuleMessage(rule, rule.VariantTrue, 'check', 'tick');
					
					mmc.dom.complete.find('.mmc__userMessage[data-rule="53"]').hide();
					mmc.dom.complete.find('.mmc__userMessage[data-rule="51"]').hide();
					
					if (ruleNo != '') {
						self.showAddonProduct(mmc.settings.rules.list[ruleNo]);
						// mmc.vm.controls.showAddon(true);
						
						if (ruleNo == '51') {
							mmc.dom.complete.find('.mmc__userMessage[data-rule="51"]').show();
						} else {
							mmc.dom.complete.find('.mmc__userMessage[data-rule="53"]').show();
						}
					} else {
						self.hideAddonProduct(rule);
						// mmc.vm.controls.showAddon(false);
					}
				}
				mmc.settings.rules.variant.MatchFoundFalse = function () {
					mmc.trigger.target.addClass('mmc__error');
					self.showRuleMessage(rule, rule.VariantFalse, 'error', 'exclamation');
					
					self.hideAddonProduct(rule);
					// mmc.vm.controls.showAddon(false);
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['51','53']
		},
		/* Custom variant check relies on the DB to decide whether variant code check is required or optional */
		customVariant: {
			run: function (rule) {
				var messageType = ['note'];
				
				if (rule.Variant == 1) {
					mmc.vm.controls.showQuestion(true);
					lib.setStepIndex();
					
				} else if (rule.Variant == 2) {
					messageType.push('variant');
				}
				
				/* For the custom rules, only add MatchFound functions when there is no previous MatchFound functions */
				if (!mmc.settings.rules.variant.MatchFoundTrue) {
					mmc.settings.rules.variant.MatchFoundTrue = function (ruleNo) {
						mmc.trigger.target.addClass('mmc__check');
						self.showRuleMessage(rule, rule.VariantTrue, 'check', 'tick');
					}
				}
				if (!mmc.settings.rules.variant.MatchFoundFalse) {
					mmc.settings.rules.variant.MatchFoundFalse = function () {
						mmc.trigger.target.addClass('mmc__error');
						self.showRuleMessage(rule, rule.VariantFalse, 'error', 'exclamation');
					}
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['50','601']
		},
		/* Custom variant check relies on the DB to decide whether variant code check is required or optional */
		customVariantAddon: {
			run: function (rule) {
				var messageType = ['note'];
				
				if (rule.Variant == 1) {
					mmc.vm.controls.showQuestion(true);
					lib.setStepIndex();
					
				} else if (rule.Variant == 2) {
					messageType.push('variant');
				}
				
				/* For the custom rules, only add MatchFound functions when there is no previous MatchFound functions */
				if (!mmc.settings.rules.variant.MatchFoundTrue) {
					mmc.settings.rules.variant.MatchFoundTrue = function (ruleNo) {
						mmc.trigger.target.addClass('mmc__check');
						self.showRuleMessage(rule, rule.VariantTrue, 'check', 'tick');
						
						if (ruleNo != '' && ruleNo == rule.RuleNo) {
							self.showAddonProduct(rule);
						} else {
							self.hideAddonProduct(rule);
						}
					}
				}
				if (!mmc.settings.rules.variant.MatchFoundFalse) {
					mmc.settings.rules.variant.MatchFoundFalse = function () {
						mmc.trigger.target.addClass('mmc__error');
						self.showRuleMessage(rule, rule.VariantFalse, 'error', 'exclamation');
						
						self.hideAddonProduct(rule);
					}
				}
				
				/* Show the user message as last, after all checks have completed */
				self.showRuleMessage(rule, rule.PostText, messageType.join(' '));
			},
			range: ['52','500','501','502']
		}
	}
	
	/* Set up each of the rules as functions */
	$.each(behavior, function (name, set) {
		$.each(set.range, function (index, rule) {
			self['Rule' + rule] = behavior[name].run;
		});
	});
	
	/* Create a default rule if not part of the existing list */
	this.RuleDefault = function (rule) {
		behavior.normal.run(rule);
	}

	/* List of functions to process rules */
	this.showRuleMessage = function (rule, message, messageType, messageIcon) {
		var newMessage = mmc.dom.blocks.usermessage.clone(),
			messageClass = [];
			
		$.each(messageType.split(' '), function (index, value) {
			messageClass.push('mmc__' + value);
		});
		
		/* Change the content of the user message */
		newMessage.attr('data-rule', rule.RuleNo);
		// newMessage.find('.mmc__userMessageIcon').text(rule.RuleNo);
		newMessage.find('.mmc__userMessageTitle').remove();
		newMessage.find('.mmc__userMessageClose').remove();
		newMessage.find('.mmc__userMessageText').html(message);
		newMessage.addClass(messageClass.join(' '));
		
		/* When a type is supplied, make user message open a variant or production code */
		if (messageType.match('variant') || messageType.match('production')) {
			newMessage.addClass('mmc__codeCheck');
		}
		
		/* Add the new rule message to the correct view */
		if ($('#sb-container .mmc__infoPopup').length > 0) {
			newMessage.appendTo($('#sb-container .mmc__infoPopup .mmc__codeCheck')).show();
		} else if (mmc.dom.activeStep().hasClass('mmc__variant')) {
			newMessage.prependTo(mmc.dom.activeStep().find('.mmc__content')).show();
		} else {
			newMessage.insertBefore(mmc.dom.complete.find('.mmc__products')).show();
		}
		
		/* Hide the user message when the rule requires a variant code check */
		if (rule.Product) {
			// if (rule.Product.AskForTypeSignVariant && rule.Variant == 1) {
				// return;
			// }
			// if (!rule.Product.AskForTypeSignVariant && rule.Variant == 2) {
				// return;
			// }
			if (rule.Product.AskForTypeSignVariant && rule.Variant == 2) {
				return;
			}
			if (!rule.Product.AskForTypeSignVariant && !rule.Variant) {
				return;
			}
			if (rule.Product.AskForProductCode && rule.Production == 1) {
				return;
			}
			if (rule.RuleNo.charAt(0) == 5 && rule.RuleNo.length == 3)
			{
				return;
			}
			/* Exclude the hiding of the rule for custom rules (500-599) */
			// if (rule.RuleNo.charAt(0) == 5 && rule.RuleNo.length == 3/* || (!rule.Product.AskForTypeSignVariant && (rule.Variant == 1 || rule.Variant == 2))*/) {
				// return;
			// }
		}
		
		if (!rule.Product) {
			if (rule.Variant == 2) {
				return;
			}
			if (!rule.Variant) {
				return;
			}
		}
		
		if (mmc.dom.activeStep().hasClass('mmc__variant')) {
			return;
		}
		
		newMessage.hide();
			
		/* Add the new rule message to the correct view */
		// if ($('#sb-container .mmc__infoPopup').length > 0) {
			// newMessage.appendTo($('#sb-container .mmc__infoPopup .mmc__codeCheck')).show();
		// } else if (mmc.dom.activeStep().hasClass('variant')) {
			// newMessage.prependTo(mmc.dom.activeStep().find('.mmc__content')).show();
		// } else {
			// newMessage.insertBefore(mmc.dom.complete.find('.mmc__products')).show();
		// }
		
		// /* Hide the user message when the rule requires a variant code check */
		// if ((rule.Variant == 1 || (rule.Variant != null && rule.Product)) && messageType != 'check' && messageType != 'error') {
			// /* Exclude the hiding of the rule for custom rules (500-599) */
			// if (rule.RuleNo.charAt(0) == 5 && rule.RuleNo.length == 3/* || (!rule.Product.AskForTypeSignVariant && (rule.Variant == 1 || rule.Variant == 2))*/) {
				// return;
			// }
			// newMessage.hide();
		// }
	}
	
	/* Function for showing the addon product related to the rule */
	this.showAddonProduct = function (obj) {
		var product = mmc.vm.addon,
			addon = obj.Addon,
			productPrice = (!addon.Price) ? addon.PriceWithVAT : (addon.Price.HasDiscount) ? addon.Price.ProductPriceDiscounted.PriceWithVAT : addon.Price.ProductPrice.PriceWithVAT,
			productDiscount = mmc.settings['percentDiscountAddon'];
		
		/* If the addon has no content, hide any currently active addon and return */
		if (addon.ProductContent == null) {
			mmc.vm.controls.showAddon(false);
			return;
		}
		
		/* Set the addon observables */
		product.VCE(addon.VCE);
		product.Name(addon.ProductContent.name);
		product.Desc(addon.ProductContent.desc_short);
		product.ImageSrc(mmc.settings.directory + 'content/images/products/' + addon.VCE.replace(' ', '-').toLowerCase() + '.jpg');
		product.Price(mmc.formatPrice(productPrice));
		if (obj.AddonChecked == 1) {
			product.Checked(true);
		} else {
			product.Checked(false);
		}
		
		/* Set the Addon product price, include possible discounts */
		if (productDiscount === undefined) {
			productDiscount = mmc.settings.percentDiscount;
		}
		/* Check to see if a discount is set by the customer and apply it */
		if (productDiscount != null) {
			productPrice = (parseFloat(productPrice) * ((100 - productDiscount) / 100)).toFixed(2);
		}
		product.productPrice(productPrice);
		product.serviceProductID(addon.ProductID);
		
		/* Display the addon product */
		mmc.vm.controls.showAddon(true);
	}
	
	/* Function for hiding the addon product */
	this.hideAddonProduct = function (obj) {
		mmc.vm.controls.showAddon(false);
	}
	
	/* Function for checking Variant / Production codes */
	this.checkCode = function () {
		var code = mmc.trigger.target.find('input').val().toUpperCase(),
			triggerType = (mmc.trigger.target.closest('.mmc__codeCheck').hasClass('mmc__variant')) ? 'variant' : 'production';
		
		mmc.vm.config.product1[triggerType + 'code'](code);
		
		mmc.trigger.target.removeClass('mmc__error mmc__check');
		mmc.dom.variant.find('.mmc__userMessage').remove();
		$('#sb-container').find('.mmc__userMessage').remove();
		
		/* Don't do anything when a code is not entered */
		if (code == '') {
			return;
		}
		
		mmc.trigger.target.addClass('mmc__loading');
		
		/* AJAX request to Variant / Production code Service */
		$.ajax({
			dataType: 'jsonp',
			jsonpCallback: 'jsonCallback',
			type: "GET",
			url: mmc.buildRequest(),
			success: function(data) {
			
				var obj = data,
					rules = mmc.settings.rules;
				
				/* Always reset the previously matched rule */
				mmc.dom.complete.find('.mmc__userMessage.mmc__matchfound').hide().removeClass('mmc__matchfound');
				
				/* See whether a match has been found for the entered Variant / Production code */
				if (obj.UnknownVariant || obj.UnknownProductionCode) {
					mmc.trigger.target.addClass('mmc__error');
					self.showRuleMessage('', rules[triggerType + 'Unknown'], 'error', 'exclamation');
					
				} else {
					/* Trigger the correct function depending on: Variant or Production code check / MatchFound true or false. Hide the rule message that triggers the check */
					if (obj.MatchFound == true) {
						rules[triggerType].MatchFoundTrue(obj.MatchCompatibility.RuleNo);
						
						/* If a rule number is returned, show the related user message. When a rule number is not returned, hide the related user message, only for fourth question */
						if (mmc.dom.activeStep().hasClass('mmc__variant')) {
							if (obj.MatchCompatibility.RuleNo && obj.MatchCompatibility.RuleNo != '103') {
								mmc.dom.complete.find('.mmc__userMessage[data-rule="' + obj.MatchCompatibility.RuleNo + '"]').show().addClass('mmc__matchfound');
							} else if (obj.MatchCompatibility.RuleNo == '103') {
								mmc.dom.complete.find('.mmc__userMessage[data-rule="' + obj.MatchCompatibility.RuleNo + '"]').hide();
							} else {
								mmc.dom.complete.find('.mmc__userMessage.matchfound:not(.mmc__userMessage.mmc__codeCheck)').hide().removeClass('mmc__matchfound');
							}
						}
						
					} else if (/*obj.MatchFound == true && obj.MatchCompatibility.RuleNo == '' || */obj.MatchFound == false) {
						rules[triggerType].MatchFoundFalse();
						
						/* Hide the related user message when no match found */
						if (mmc.dom.activeStep().hasClass('mmc__variant')) {
						}
					}
				}
			
				/* Remove loading when */
				mmc.trigger.target.removeClass('mmc__loading');
					
				lib.checkFilledSteps(mmc.vm.config.product1);
			}, error: function (err) {
			}
		});
	}
}
///#source 1 1 /media/com_configurator/mmc/content/js/velux-configurator.js
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
                    tooltipColors: $('#mmc__Configurator #mmc__Blocks .mmc__tooltipk15'),
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
                b
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

                var url = (mmc.isBasket()) ? '{' + requestProducts.join(',') + '}' : request.href + '&' + requestUrl.join('&') + '&data={' + requestProducts.join(',') + '}';

                return url;
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
                transparency: {
                    '1': $('#mmc__Settings .mmc__transparencyLabel1').text(),
                    '2': $('#mmc__Settings .mmc__transparencyLabel2').text(),
                    '3': $('#mmc__Settings .mmc__transparencyLabel3').text(),
                    '4': $('#mmc__Settings .mmc__transparencyLabel4').text(),
                    '5': $('#mmc__Settings .mmc__transparencyLabela5').text(),
                    'A': $('#mmc__Settings .mmc__transparencyLabelA').text(),
                },
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
                        activeCategory = mmc.dom.option(config[productIndex].category(), 'mmc__category', 'mmc__active').find('input');
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

                                                if ((wt != 'GDL' || option.CategoryName != 'COMBINATION') && child.CategoryName != 'RomanCloth') {
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

                    //DANIEL: TEMPORARY FIX, Danny have to change this to a better solution
                    $('.BlackoutAwning.mmc__active input, .EnergyAwning.mmc__active input, .RollerAwning.mmc__active input').trigger('change');

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
                            if (mmc.vm.config[productIndex].category() == 'BlackoutAwning') {
                            }
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


                    //DANIEL: TEMPORARY TERRIBLE FIX, Danny have to change this to a better solution
                    $('.mmc__option.mmc__operation.mmc__active input').trigger('change');

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
                                product.finishtype()[obsIndex++] = { val: id.FinishTypeID, name: id.FinishTypeName, desc: id.FinishTypeDescription, trans: 1, inactive: (id.IsValid) ? '' : 'inactive' };
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
                                    tempCategory = (id.ColorID > 4609 && id.ColorID < 4622) ? 'BlackoutDisney'
                                        : (id.ColorID >= 6520 && id.ColorID <= 6525) ? 'RomanDesign'
                                        : mmc.vm.config[productIndex].category().match(/[A-Z][a-z]+/g)[productIndex.charAt(productIndex.length - 1) - 1];

                                    data[productIndex].colour()[obsIndex++] = {
                                        cat: tempCategory,
                                        val: id.ColorID,
                                        name: id.ColorID + ' ' + id.ColorDescription,
                                        trans: id.ColorFeatures.Transparency,
                                        transDesc: mmc.settings.transparency[id.ColorFeatures.Transparency],
                                        desc: '',
                                        inactive: (id.IsValid) ? '' : 'inactive'
                                    };
                                } else {
                                    /* Create a check for BlackoutDisney colours, in case they show up in the Blackout category */
                                    tempCategory = (id.ColorID > 4609 && id.ColorID < 4622) ? 'BlackoutDisney'
                                        : (id.ColorID >= 6520 && id.ColorID <= 6525) ? 'RomanDesign'
                                        : mmc.vm.config.product1.category();
                                    product.colour()[obsIndex++] = {
                                        cat: tempCategory,
                                        val: id.ColorID,
                                        name: id.ColorID + ' ' + id.Name,
                                        desc: '',
                                        trans: id.ColorFeatures.Transparency,
                                        transDesc: mmc.settings.transparency[id.ColorFeatures.Transparency],
                                        inactive: (id.IsValid) ? '' : 'inactive'
                                    };
                                    tempCategory = (id.ColorID > 4609 && id.ColorID < 4622) ? 'BlackoutDisney'
                                        : (id.ColorID >= 6520 && id.ColorID <= 6525) ? 'RomanDesign'
                                        : mmc.vm.config.product1.category();
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
                var st = (self[category]() == elem) ? 'mmc__active' : '';
                return st;
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


                //DANIEL: TEMPORARY TERRIBLE FIX, Danny have to change this to a better solution
                mmc.dom.complete.find('.mmc__addon .mmc__addToCart input').click().click();
                mmc.vm.addon.Checked(true);
                //  alert(mmc.dom.complete.find('.mmc__addon .mmc__addToCart input').is(":checked"));
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
///#source 1 1 /media/com_configurator/mmc/content/js/velux-configurator-lib.js
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
