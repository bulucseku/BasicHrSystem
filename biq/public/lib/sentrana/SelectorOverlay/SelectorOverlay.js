(function() {
	// Provide a simple counter for each instance of this class
	var instanceCounter=0;

	// Provide a way to retrieve a unique ID to find the elements in this template.
	function generateUniqueID() {
		// Construct a unique ID...
		var uniqueID = "_selectorOverlay" + instanceCounter;

		// Increment our counter first...
		instanceCounter = instanceCounter + 1;

		return uniqueID;
	}

	// TODO This controller should really be supplied with a custom Model instance which supplies much of the data required.
	//      In addition, this Model instance can be used for notification on selection changes.
	$.Controller.extend("Sentrana.Controllers.SelectorOverlay", {
		// Provide some controller default values...
		defaults: {
			basePath: "js/SelectorOverlay",			/* This is the relative path from the document root to the resources for this control. */
			templatesPath: "templates",				/* This is the relative path from the basePath to the templates folder. */
			tmplBase: "selectorBase.tmpl",			/* This is the template file that initializes a table before converting to a DataTables. */
			tmplOverlay: "selectorOverlay.tmpl",	/* This is the template file that defines how a grand total row is added to the table's footer section. */
			selectedName: "",						/* This is the initially selected name. */
			choices: [], 							/* An array of objects with name, value properties */
			choicesLabelProp: "name",				/* The name of the property in a choice object that returns the label to show */
			eventName: "overlaySelectionChanged", 	/* Default event name... */
			cssPrefix: "selovl", 					/* Default css prefix */
			baseLayerTextSel: ".name",				/* A selector to find the element that contains the text in the base layer. */
			changeOverlayBox1: false				/* Whether a selection of the element changes the overlay's first box */
		}
	}, {
		// Instance Setup
		setup: function(el, options) {
			// Add a unique ID to the instance...
			options.uniqueID = generateUniqueID();

			// Call the rest of the base setup method...
			this._super(el, options);

			return [el, options];
		},

		// Instance Constructor
		init: function() {
			// Update the view...
			this.updateView();
		},

		// Instance method: What to do when the control is initialized a subsequent time...
		update: function SO_update(options) {
			// Call the base class implementation...
			this._super(options);

			// Now update our visual representation...
			this.updateView();
		},

		// Instance method: Regenerate the HTMl when any of the input parameters changes...
		updateView: function SO_updateView() {
			// Fill in the "base" HTML...
			this.element.html(this.getTemplatePath(this.options.tmplBase), {text: this.options.selectedName});

			// Based on the supplied choices, determine whether the overlay is "activated"
			this.selOvlActive = this.options.choices.length >= 1;

			// Set the cursor based on whether we are activated...
			this.element.css("cursor", (this.selOvlActive) ? "pointer" : "auto");

			// If we are not activated, get out now...
			if (!this.selOvlActive) {
				return;
			}

			// Store the base layer text element...
			this.$baseLayerText = $(this.options.baseLayerTextSel, this.element);

			// Generate the necessary HTML into the page...
			this.generateOverlay();

			// For some reason, elements outside of the controller are not being wired up for iPad...
			this.delegate(document.documentElement, ".box3", "touchend", function(ev) {
				$(this).trigger("click");
			});
		},

		// Instance method: Get the path to a template file...
		// TODO Move into a common base class for reuse!
		getTemplatePath: function SO_getTemplatePath(templateFile) {
			var parts=[];

			// Do we have a basePath?
			if (this.options.basePath) {
				parts.push(this.options.basePath);

				// Did our path NOT end in a slash?
				if (!/\/$/.test(this.options.basePath)) {
					parts.push("/");
				}
			}

			// Do we have a templatesPath?
			if (this.options.templatesPath) {
				parts.push(this.options.templatesPath);

				// Did our path NOT end in a slash?
				if (!/\/$/.test(this.options.templatesPath)) {
					parts.push("/");
				}
			}

			// Add the template file...
			parts.push(templateFile);

			return parts.join("");
		},

		// Instance method: Generate the overlay HTML into the page...
		generateOverlay: function() {
			// Remove the prior overlay (if one exists)...
			$("." + this.options.uniqueID).remove();

			// Define some CSS class names formed by using the CSS prefix...
			var box1className = this.options.cssPrefix + "-" + "box1",
				box2className = this.options.cssPrefix + "-" + "box2";

			// Record the currently selected choice...
			this.selOvlCurrentChoiceName = this.$baseLayerText.text();

			// Invoke our template...
			$("body").append(this.getTemplatePath(this.options.tmplOverlay), {
				box1className: box1className,
				box2className: box2className,
				uniqueID: this.options.uniqueID,
				currentChoiceName: this.selOvlCurrentChoiceName,
				choices: this.options.choices,
				choicesLabelProp: this.options.choicesLabelProp
			});

			// Capture some DOM elements...
			this.$selOvlBox1 = $("." + this.options.uniqueID + "." + box1className);
			this.$selOvlBox2 = $("." + this.options.uniqueID + "." + box2className);

			// Retrieve some settings on the base layer...
			var $baseElem = $(".selbase", this.element),
				fontSize = $baseElem.css("font-size"),
				fontFamily = $baseElem.css("font-family"),
				fontWeight = $baseElem.css("font-weight"),
				paddingTop = this.$baseLayerText.css("padding-top"),
				paddingRight = this.$baseLayerText.css("padding-right"),
				paddingBottom = this.$baseLayerText.css("padding-bottom"),
				paddingLeft = this.$baseLayerText.css("padding-left");

			// Record the border width for later calculations...
			this.borderWidth  = this.$baseLayerText.css("border-left-width");
			this.borderRadius = this.$baseLayerText.css("border-top-left-radius");

			// Set those properties on the overlay elements...
			this.$selOvlBox1.css("font-size", fontSize);
			this.$selOvlBox1.css("font-family", fontFamily);
			this.$selOvlBox1.css("font-weight", fontWeight);
			this.$selOvlBox1.css("border-top-left-radius", this.borderRadius);
			this.$selOvlBox1.css("border-top-right-radius", this.borderRadius);
			this.$selOvlBox1.css("padding-top", paddingTop);
			this.$selOvlBox1.css("padding-right", paddingRight);
			this.$selOvlBox1.css("padding-bottom", paddingBottom);
			this.$selOvlBox1.css("padding-left", paddingLeft);
			this.$selOvlBox1.css("border-width", this.borderWidth);

			this.$selOvlBox2.css("border-top-left-radius", this.borderRadius);
			this.$selOvlBox2.css("font-size", fontSize);
			this.$selOvlBox2.css("font-family", fontFamily);
			this.$selOvlBox2.css("border-bottom-left-radius", this.borderRadius);
			this.$selOvlBox2.css("border-bottom-right-radius", this.borderRadius);
			this.$selOvlBox2.css("border-width", this.borderWidth);

			// Create an array to map choice names to objects describing it...
			this.selOvlMap = {};

			// For each of our choices, ...
			for (var i=0, l=this.options.choices.length; i<l; i++) {
				// Record an entry in our map...
				this.selOvlMap[this.options.choices[i].name] = this.options.choices[i];
			}
		},

		// Handle clicks on the category...
		"click": function(el, event) {
			// If we are not active, get out now...
			if (!this.selOvlActive) { return; }

			// If the overlay is already visible, the close it!
			if (this.$selOvlBox1.is(":visible") || this.$selOvlBox2.is(":visible")) {
				this.$selOvlBox1.hide();
				this.$selOvlBox2.hide();
				return;
			}

			// Function to get a CSS size (which includes "px") and returns the numeric value...
			function pixels(cssLength) {
				var match=/^(\d+)px$/.exec(cssLength);

				// If no match, return 0
				if (!match) {
					return 0;
				}

				// Otherwise, return the digits as a number...
				return parseInt(match[1], 10);
			}

			// Use the position and dimensions of the element to compute dimensions of the first box...
			var $el = $(el),
				elOffset = $el.offset(),
				box1BorderWidth = pixels(this.borderWidth),
				box1Top = elOffset.top,
				box1Left = elOffset.left;

			// Position the first box...
			this.$selOvlBox1.css({top: box1Top + "px", left: box1Left+"px"});

			// Compute the top and left for the second box...
			var box1Width = this.$selOvlBox1.outerWidth(true),
				box1Height = this.$selOvlBox1.outerHeight(true),
				box2Width = Math.max(this.$selOvlBox2.outerWidth(true), box1Width),
				box2Top = box1Top + box1Height - box1BorderWidth /* for overlap of exactly one border width */,
				box2Left = box1Left + box1Width - box2Width,
				box2Padding = pixels(this.$selOvlBox2.css("padding-left")), /* Assumes padding-left === padding-right */
				box2BorderWidth = box1BorderWidth;

			// Adjust top, left and width of the second box...
			this.$selOvlBox2.css({top: box2Top + "px", left: box2Left + "px", width: box2Width - 2*box2Padding - 2*box2BorderWidth + "px"});

			// Determine whether the top left corner is rounded or not...
			this.$selOvlBox2.css("border-top-left-radius", (box2Width > box1Width) ? this.borderRadius : "0px");

			// Show the overlay boxes...
			this.$selOvlBox1.show();
			this.$selOvlBox2.show();
		},

		// Use document instead of window
		// http://www.quirksmode.org/dom/events/click.html
		"{document} .{uniqueID}.{cssPrefix}-box2 mouseleave": function(el, event) {
			// If we are not active, get out now...
			if (!this.selOvlActive) { return; }

			// Hide the overlay boxes...
			this.$selOvlBox1.hide();
			this.$selOvlBox2.hide();
		},

		"{document} .{uniqueID}.{cssPrefix}-box2 .box3 click": function(el, event) {
			// If we are not active, get out now...
			if (!this.selOvlActive) { return; }

			var elText = $(el).text();

			// Hide the overlay regardless of the choice...
			this.$selOvlBox1.hide();
			this.$selOvlBox2.hide();

			// Has the choice changed?
			if (this.selOvlCurrentChoiceName !== elText) {
				// Record the new current choice name...
				this.selOvlCurrentChoiceName = elText;

				// Update the first box's content...
				if (this.options.changeOverlayBox1) {
					this.$selOvlBox1.text(this.selOvlCurrentChoiceName);
					$(".name", this.element).text(this.selOvlCurrentChoiceName);
				}

				// Trigger a synthetic event indicating the selection has changed...
				this.element.trigger(this.options.eventName, this.selOvlMap[this.selOvlCurrentChoiceName]);
			}
		}
	});
})();
