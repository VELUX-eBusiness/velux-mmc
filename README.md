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

&lt;div id=&quot;mmc__InsertConfigurator&quot; /&gt;

&lt;script type=&quot;text/javascript&quot; src=&quot;content/js/insert-velux-configurator.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
	window.onload = function () {
		loadConfigurator({
			returnURL: &#39;//qa.veluxshop.nl/?option=com_configurator&amp;utm_source=velux&amp;utm_medium=link&amp;utm_campaign=product_configurator&amp;utm_content=product_configurator_edsp&amp;task=addItemToBasket&#39;,
			directory: &#39;//localhost/mmc-demo&#39;,
			clientID: &#39;dtest&#39;,
			showPrintButton: true,
			showMailButton: true,
			showDealerButton: true,
			language: &#39;nl&#39;,
			dealerTarget: &#39;_blank&#39;,
			shopTarget: &#39;_blank&#39;,
			skin: &#39;veluxshop&#39;
		});
	};
&lt;/script&gt;

In the basket page:
$products = json_decode($_POST['productsinfo']);
foreach ($products as $product){

if($product->productid){
echo $product->productid  . ': ' . $product->productprice;
//var_dump($product);

}

}


