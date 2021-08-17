// Set Vars
fs = require('fs');
os = require('os');

var onlineSync = true,
	listsArray = ["personal", "work", "fun", "today", "later"],
	saveFile = os.homedir() + '/Google Drive/Toedoe/dataSet.json';

// GET DATA --------------------------------------------------------
// Get local settings data

// Check dataSet version
// Get json dataSet from mysql
// Get json dataSet from local
if (typeof dataSet == "undefined") {

	onlineSync = false;

	if (fs.existsSync(saveFile)) {

		var dataSet = JSON.parse(fs.readFileSync(saveFile));
	}
}

// Create local dataSet if no exist, set online sync to false.
if (typeof dataSet == "undefined") {

	var dataSet = new Object();

	// Test Data
	dataSet.personal = {"items": [{"text": "First item"}]};
	dataSet.work = {"items": []};
	dataSet.fun = {"items": []};
	dataSet.today = {"items": []};
	dataSet.later = {"items": []};
	dataSet.deleted = {"items": []};

	// Save dataSet to local
	saveData();
}

// APPLY DATA --------------------------------------------------------

// Render all Lists from dataSet
(function() {
	renderLists(listsArray);
})();

// Add events to input and add buttons
(function() {

	// Single Element events
	document.getElementById("itemMenu").addEventListener("click", clickMenu);
	document.getElementById("editItem").addEventListener("keypress", editItem);


	for (var i = 0; i < listsArray.length; i++) {

		// Input field
		document.getElementById(listsArray[i]).getElementsByTagName('input')[0].addEventListener("keypress", addItem);

		// Item
		document.getElementById(listsArray[i]).getElementsByTagName('ul')[0].addEventListener("click", clickItem);

		// Right mouse
	}
})();

// Drag item, delete en create list according to dataSet

// Save to database button ?

// sync with database ?


// FUNCTIONS --------------------------------------------------------

// Add item to List function
function renderItem(list,itemText,number) {

	var li = document.createElement("li");

	var moveDiv = document.createElement("move");
	moveDiv.className = "moveTarget";
	li.appendChild(moveDiv);

	var span = document.createElement("span");
	span.appendChild(document.createTextNode(itemText));
	li.appendChild(span);

	li.id = String(number);
	li.className = "list-group-item";
	document.getElementById(list).getElementsByTagName('ul')[0].appendChild(li);
}

// Render List(s) from dataSet
function renderLists(renderArray) {

	// Loop times number of lists
	for (var i = 0; i < renderArray.length; i++) {

		// Create and loop trough items in list dataSet
		for (var j = 0; j < dataSet[renderArray[i]]['items']['length']; j++) {

			renderItem(renderArray[i], dataSet[renderArray[i]].items[j].text, j);
		}

		// render blank item
		var blankLi = document.createElement("li");

		var moveDiv = document.createElement("move");
		moveDiv.className = "moveTarget";
		blankLi.appendChild(moveDiv);

		blankLi.id = String(j);
		blankLi.className = "list-group-item blankItem";
		document.getElementById(renderArray[i]).getElementsByTagName('ul')[0].appendChild(blankLi);
	}
}

// Add item from input to list, add to dataSet, clear input field.
function addItem(e) {

	if (e.keyCode === 13) {

		// Get Values
		var inputText = this.value; if (inputText == "") {return;}

		// Check for duplicates (all lists), return error

		var list = this.parentNode.id;
		var itemNumber = dataSet[list]['items'].length;

		// Add to dataSet
		dataSet[list]['items'].push({"text": inputText});

		// Rerender list
		reRenderLists([list]);

		// Clear input field
		this.value = "";

		saveData();
	}
}

// Deselect Item
function deSelectItem(item) {
	
	// remove select class
	item.classList.remove("selected");

	// put Item Menu away + display none
	var itemMenu = document.getElementById("itemMenu");
	itemMenu.style.display = "none";
	document.body.appendChild(itemMenu);

	// remove active class from ul
	var ulLists = document.getElementsByTagName('ul');

	for (var i = 0; i < ulLists.length; i++) {

		ulLists[i].classList.remove("activeTarget");
	}
}

function selectItem(item) {

	// Reset edit input field
	resetEditInput();

	// add selected class
	item.className += " selected";

	// Move Item Menu
	var itemMenu = document.getElementById("itemMenu");
	itemMenu.style.display = "block";
	item.appendChild(itemMenu);

	// add activate class to ul
	var ulLists = document.getElementsByTagName('ul');

	for (var i = 0; i < ulLists.length; i++) {

		ulLists[i].className += " activeTarget";
	}
}

// Select or swap selected item
function clickItem(e) {

	// Catch other selected
	var selectedItem = document.getElementsByClassName("selected");

	// Select
	if (e.target && e.target.nodeName === "LI") {

		// No blank items
		if (e.target.classList.contains("blankItem")) {
			return;
		}

		// if target is selected
		if (e.target.classList.contains("selected")) {

			deSelectItem(e.target);

		// if other is selected
		} else if (selectedItem.length > 0) {

			deSelectItem(selectedItem[0]);
			selectItem(e.target);

		// if none is selected
		} else {

			selectItem(e.target);
		}
	}

	// Move
	if (e.target && e.target.nodeName === "MOVE") {

		// get selected item data
		selectedList = selectedItem[0].parentNode.parentNode.id;
		selectedNumber = selectedItem[0].id;

		moveItem = dataSet[selectedList]['items'].splice(selectedNumber, 1);

		// get clicked move location data
		targetList = e.currentTarget.parentNode.id;
		targetId = e.target.parentNode.id;

		// change dataSet (x2)
		dataSet[targetList]['items'].splice(targetId, 0, moveItem[0]);

		deSelectItem(selectedItem[0]);

		saveData();

		// rerender lists (x2 if not same)
		if (selectedList == targetList) {

			reRenderLists([targetList]);
		} else {

			reRenderLists([selectedList, targetList]);
		}
	}
}

function removeList(list) {

	var ulElem = document.getElementById(list).getElementsByTagName('ul')[0];

	while (ulElem.hasChildNodes()) {

		ulElem.removeChild(ulElem.lastChild);
	}
}

function reRenderLists(listArray) {

	for (var l = 0; l < listArray.length; l++) {

		removeList(listArray[l]);
	}

	renderLists(listArray);
}

function removeItem(item) {

	// deselect (for itemMenu)
	deSelectItem(item);

	var itemNumber = item.id;
	var list = item.parentNode.parentNode.id;

	// Move item to deleted dataSet list
	var deletedItem = dataSet[list]['items'].splice(itemNumber, 1);
	deletedItem[0].list = list;
	dataSet['deleted']['items'].push(deletedItem[0]);

	// rerender list
	reRenderLists([list]);

	saveData();
}

function clickMenu(e) {

	if (e.target && e.target.nodeName === "BUTTON") {

		// Delete button
		if (e.target.id === "deleteMenu") {

			removeItem(e.currentTarget.parentNode);

		// Edit button
		} else if (e.target.id === "editMenu") {

			var liItemDiv = e.currentTarget.parentNode;

			// deselect
			deSelectItem(e.currentTarget.parentNode);

			// get input from somewhere
			var inputDiv = document.getElementById("editItem");

			// Reset edit input field
			resetEditInput();

			// replace innerhtml with input
			var itemTextOld = liItemDiv.lastChild;
			liItemDiv.removeChild(itemTextOld);
			liItemDiv.appendChild(inputDiv);
			inputDiv.style.display = "block";
			inputDiv.value = itemTextOld.textContent;
			inputDiv.focus();
		}
	}
}

function editItem(e) {

	if (e.keyCode === 13) {

		// Get Values
		var inputText = this.value; 
		if (inputText == "") {

			resetEditInput();
			return;
		}

		// Check for duplicates (all lists), return error

		var list = this.parentNode.parentNode.parentNode.id;
		var itemNumber = this.parentNode.id;

		// Edit to dataSet
		dataSet[list]['items'][itemNumber]['text'] = inputText;

		// Clear input field
		this.value = "";

		// Put input back to body
		this.style.display = "none";
		document.body.appendChild(this);

		// Rerender list
		reRenderLists([list]);

		saveData();
	}
}

function resetEditInput() {

	var editItemDiv = document.getElementById("editItem");

	if (editItemDiv.style.display === "block") {

		var itemLi = editItemDiv.parentNode;
		var list = itemLi.parentNode.parentNode.id;

		var oldItemText = dataSet[list]['items'][itemLi.id]['text'];
		span = document.createElement("span");
		span.appendChild(document.createTextNode(oldItemText));
		itemLi.appendChild(span);

		editItemDiv.style.display = "none";
		editItemDiv.value = "";
		document.body.appendChild(editItemDiv);
	} else {

		return;
	}
}

function saveData() {

	if (onlineSync) {

		// save Online

	} else {

		// Save data local
		fs.writeFileSync(saveFile, JSON.stringify(dataSet,null,4));
	}
}

// Show Error in Top bar function
