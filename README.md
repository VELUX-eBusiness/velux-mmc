velux-mmc
=========

VELUX Mass Market Configurator


How to install the VELUX Mass Market Configurator


1. Upload the full contents of the VELUX Mass Market Configurator zip file to your server.

2. Add the following lines to your page, where you want the configurator to show up.

	Make sure to change these value:
	1. Change the location of the insert-velux-configurator.min.js script
	2. returnURL: Insert the URL where the products should be returned to
	3. directory: Insert the URL where you have uploaded the folder
	4. skin: Select the skin you wish to use
	5. language: Choose the language you want the configurator to show up in
	6. clientID: Client ID that is used to authenticate the client when connecting to the VELUX services (will be provided in a e-mail)

	
<!-- Add these lines to your page -->

<div id="mmc__InsertConfigurator" />

<script type="text/javascript" src="content/js/insert-velux-configurator.js"></script>
<script>
	window.onload = function () {
		loadConfigurator({
			returnURL: '//qa.veluxshop.nl/?option=com_configurator&utm_source=velux&utm_medium=link&utm_campaign=product_configurator&utm_content=product_configurator_edsp&task=addItemToBasket',
			directory: '//localhost/mmc-demo',
			clientID: 'dtest',
			showPrintButton: true,
			showMailButton: true,
			showDealerButton: true,
			language: 'nl',
			dealerTarget: '_blank',
			shopTarget: '_blank',
			skin: 'veluxshop'
		});
	};
</script>
