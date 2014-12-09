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