/* Sends the specified type of request to the server 
 * Types so far: AddQ, SearchQ 
 * AddQ sends: { type, desc, diff, keys, tests }
 *    type is always AddQ
 *    desc is the question prompt student will see when taking test
 *    diff is the difficulty specified by instructor for that question
 *    keys is an array of keywords that can be used to search for this question
 *    tests is an arry of tests that should pass if student gives correct answer
 *        Format in which tests should be given is not yet decided
 * SearchQ: { type, diff, keys } 
 *    type: Always SearchQ for searching questions, used by server
 *    diff: An array of booleans specifying which difficulty questions to return
 *    keys: An array of keywords that should match the returned questions*/
function sendRequest(reqType) {
	var xhttp   = new XMLHttpRequest();
	var jsonObj = {
		"Type"  : reqType,
	}
	// Fill in reqType-specific object fields
	if(reqType === "AddQ"){
		jsonObj["Desc"]  = addDesc.value;
		jsonObj["Topic"] = addTopic.value;
		jsonObj["Diff"]  = addRange.value;
		jsonObj["Tests"] = getNonEmptyInputs("addTests");
	} else if(reqType === "SearchQ") {
		jsonObj["Diffs"] = getCheckedValues("searchDiff");
		jsonObj["Topic"] = searchTopic.value;
		jsonObj["Keys"]  = getNonEmptyInputs("searchKeys");
	} else if(reqType === "AddTest") {
		jsonObj["TestName"] = testDesc.value;
		jsonObj["Release"]  = getCheckedValue("testRelease");
		jsonObj["QIds"]     = getSelectedIds();
	} else if(reqType === "GetTests") {
		jsonObj["Rels"] = [ 0, 1];
	} else {
		console.log("Invalid reqType passed to sendRequest()");
	}

	var jsonStr = JSON.stringify(jsonObj);
	console.log("Sent: " + jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log("Rcvd: " + xhttp.responseText); 
			var replyObj = JSON.parse(xhttp.responseText);
			
			if( replyObj["Error"] != 0 )
			{
				console.log("Error: " + replyObj["Error"]);
			}
			else
			{
				if(replyObj["Type"] === "AddQ") {
					alert("Question added successfully!");
					localQ.push(replyObj["Question"]);
					matchedQ.push(replyObj["Question"]);
					updateDisplays(["matchedList"]);
					console.log(matchedQ);
				}
				else if(replyObj["Type"] === "SearchQ") {
					// Loop through DB Q's, adding each to local Q's
					var DBQ = replyObj["Questions"];
					for(var i=0; i<DBQ.length; i++){
						if(!DBQ[i]["Topic"])
							DBQ[i]["Topic"] = "UNDEFINED";
						if(uniqQuestion(DBQ[i], localQ)){
							localQ.push(DBQ[i]);
						}
					}
					console.log(localQ);
				}
				else if(replyObj["Type"] === "AddTest") {
					alert("Exam added successfully!");
				}
				else if(replyObj["Type"] === "GetTests") {
					console.log("GetTests Reply:");
					console.log(replyObj["Tests"]);
				}
				else {
					console.log("Unknown reply type: " + replyObj["Type"]);
				}

			}
		}
	};
	xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(jsonStr);
}

/* Searches through local questions returning matches
 * Topic   : A topic to search by, "" matches all topics
 * Diffs[] : An array of difficulties to filter by
 * Keys[]  : An array of words to search through descriptions by */
function localSearch(topic, diffs, keys) {
	var matches = [];
	for(var i=0; i<localQ.length; i++){
		var thisQ = localQ[i];
		var thisTopic = thisQ["Topic"].toLowerCase();
		if(topic === "" || thisTopic.match(topic.toLowerCase())){
			// Topic matches, now check Diffs
			var thisDiff = thisQ["Diff"];
			if( containsDiff(thisDiff, diffs) ){
				// Topic and Diff matches, check Keys
				var thisDesc = thisQ["Desc"].toLowerCase();
				if(keys.length !== 0){
					for(var j=0; j<keys.length; j++) {
						var thisKey = keys[j].toLowerCase();
						if( thisDesc.match(thisKey)){
							// Topic, Diff, & Key matches, add to matches
							matches.push(thisQ);
							break;
						}
					}
				} else {
					matches.push(thisQ);
				}
			}
		}
	}
	return matches;
}

/* Called when searchSubmit button is clicked
 * Updates the matchedQ array with Q's matching new search criteria
 * Displays the matchedQ in the matches section */
function displaySearchResults() {
	var topic = searchTopic.value;
	var diffs = getCheckedValues("searchDiff");
	var keys  = getNonEmptyInputs("searchKeys");
	matchedQ  = localSearch(topic, diffs, keys);
	updateDisplays(["matchedList"]);
}

/* Checks that all fields are correct in form being submitted */
function validateForm(type) {
	switch("AddQ") {
		case "AddQ":
			if(nonEmpty("addDesc") && nonEmpty("addTopic")) {
				var testsArray = getNonEmptyInputs("addTests");
				if(validateTests(testsArray)){
					sendRequest("AddQ");
					clearForm("addForm");
				} else {
					alert("Need two test cases: e.g. func(a,b)=ans");
				}
			} else {
				alert("Make sure Description and Topic are filled out!");
			}
			break;
		case "AddTest":
			if(nonEmpty("testDesc")) {
				alert("AddTest fields all non-empty");
			}
			break;
		default:
			console.log("Invalid type to validate");
	}
}

/* Makes sure there are at least two non-empty tests
 * Makes sure all tests are in the form of func([a][,b]...)=answer */
function validateTests(tests) {
	if(tests.length < 2){
		console.log("Too few tests");
		return false;
	}
	var pattern = /[a-zA-Z][a-zA-Z0-9]*\( *[^, (]+ *(, *[^,( ]+)* *\) *= *.*/;
	for(var i=0; i<tests.length; i++){
		if(!tests[i].match(pattern)){
			console.log("test " + i + " {"+ tests[i] +"} didn't match pattern");
			return false;
		}
	}
	return true;
}

/* Toggles whether the clicked on question is in selectedQ 
 * listItemId: The id of the List Item that the question appears in */
function toggleSelected(listItemId) {
	var qId = listItemId.substring(1);
	if ( listItemId[0] == "m") { // Selected Item is a matchList question
		// add Q to selectedQ, remove from matchedQ
		for(var i=0; i<matchedQ.length; i++){
			var thisQ = matchedQ[i];
			if(thisQ["Id"] == qId){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, selectedQ)){
					selectedQ.push(thisQ);
				}
				matchedQ = removeQuestionFromArray(thisQ["Id"], matchedQ);
				break;
			}
		}
	} else if ( listItemId[0] == "p") { // Selected Item is a previewList question
		// add Q to matchedQ, remove from selectedQ
		for(var i=0; i<selectedQ.length; i++){
			var thisQ = selectedQ[i];
			if(thisQ["Id"] == qId){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, matchedQ)){
					matchedQ.push(thisQ);
				}
				selectedQ = removeQuestionFromArray(thisQ["Id"], selectedQ);
				break;
			}
		}
	} else {
		console.log("Shouldn't have gotten here");
	}
	updateDisplays(["previewList", "matchedList"]);
}

/* Resets all of the inputs inside of the specified element.
 * Removes additionally added text boxes like those for test cases*/
function clearForm(formId) {
	var inputs = document.getElementById(formId).getElementsByTagName("INPUT");
	var elems  = document.getElementById(formId).getElementsByClassName("modular");

	// Reset out all inputs
	for(var i=0; i<inputs.length; i++) {
		switch(inputs[i].type) {
			case "text":
				inputs[i].value = "";
				break;
			case "range":
				inputs[i].value = 3;
				updateDiff();
				break;
			default:
				console.log("Found a non text or range input");
		}
	}
	// Reset all modular elements
	for(var i=0; i<elems.length; i++) {
		var classes = elems[i].classList;
		if(classes.contains("tests")) {
			resetModal("Test Cases", elems[i].id, 'addInput("'+elems[i].id+'")');
		} else {
			resetModal("Keywords"  , elems[i].id, 'addInput("'+elems[i].id+'")');
		}
	}
}

/* Resets display and clears related array 
 * Display elements have a title, and an unorder list of Qs */
function clearDisplay(displayId) {
	var display = document.getElementById(displayId);
	var ul      = document.createElement("UL");
	if(displayId === "previewList"){
		ul.setAttribute("id", "pList");
		ul.appendChild(document.createTextNode("Selected"));
	} else if(displayId === "matchedList") {
		ul.setAttribute("id", "mList");
		ul.appendChild(document.createTextNode("Matches"));
	} else {
		ul.setAttribute("id", "?List");
		ul.appendChild(document.createTextNode("??? Questions"));
	}
	display.innerHTML = "";
	display.appendChild(ul);
}

/* Called whenever matchedQ might change */
function updateDisplays(displayIdArr) {
	for(var i=0; i<displayIdArr.length; i++){
		var thisId = displayIdArr[i];
		var relatedQ = getRelatedArray(thisId);
		clearDisplay(thisId);
		for(var j=0; j<relatedQ.length; j++)
			addToDisplay(relatedQ[j], thisId);
	}
}

/* Turns the given question into an HTML element
 * Inserts new element into list of matching questions */
function addToDisplay(newQ, displayId){
	var item      = document.createElement("LI");
	var descText  = document.createTextNode(newQ["Desc"]);
	var diffText  = document.createTextNode("Difficulty: "+convertDiffFormat(newQ["Diff"]));
	var topicText = document.createTextNode("Topic: "+newQ["Topic"]);
	var idStr, classStr;
	if(displayId === "matchedList") {
		idStr = "m" + newQ["Id"];
		classStr = "matched";
	} else if(displayId === "previewList") {
		idStr = "p" + newQ["Id"];
		classStr = "selected";
	} else {
		idStr = "?" + newQ["Id"];
	}
	item.setAttribute("id", idStr);
	item.setAttribute("class", classStr);
	item.addEventListener("click", function() { toggleSelected(idStr) });
	item.appendChild(descText);
	item.appendChild(document.createElement("BR"));
	item.appendChild(diffText);
	item.appendChild(document.createTextNode(" ~ "));
	item.appendChild(topicText);
	document.getElementById(displayId).appendChild(item);
}

/* Add another input text box to the top of the specified element.
 * Works for elements that contain a label, a button, and then a list of inputs 
 * elemId: The id of the element you want to add the input box to */
function addInput(elemId) {
	var elem      = document.getElementById(elemId);
	var textInput = document.createElement("INPUT");
	var breakElem = document.createElement("BR");
	elem.insertBefore(breakElem, elem.childNodes[3]);
	elem.insertBefore(textInput, elem.childNodes[3]);
}

/* Resets an input div to contain a label, a button for adding more inputs,
 * and a single text input.
 * label: The label of the input fields (e.g. Keywords, or Test Cases)
 * elemId: The id of the button that will be added to this  
 * func: The function that will be applied to the button */
function resetModal(label, elemId, func) {
	var modalElem = document.getElementById(elemId);
	var brkElem   = document.createElement("BR");
	var textLabel = document.createTextNode(label);
	var btnElem   = document.createElement("BUTTON");
	var btnText   = document.createTextNode("+");
	btnElem.appendChild(btnText); // Put "+" on button
	btnElem.setAttribute("type", "button"); // Make it a button (soas to not reload page)
	btnElem.setAttribute("onclick", func); // Make button add new inputs
	modalElem.innerHTML = ""; // Clear all inputs
	modalElem.appendChild(textLabel); // Add label 
	modalElem.appendChild(btnElem); // Add button
	modalElem.appendChild(brkElem);
	addInput(elemId);
	if(elemId === "addTests")
		addInput(elemId);
}

/* Returns all non-empty input values in an array 
 * Takes the Id of a div element */
function getNonEmptyInputs(divId) {
	var result = [];
	var elems = document.getElementById(divId).children;
	for(var i = 0; i < elems.length; i++) {
		if(elems[i].tagName == "INPUT")
			if(elems[i].value != "")
				result.push(elems[i].value);
	}
	return result;
}

/* Returns an array of ids for the selected questions */
function getSelectedIds(){
	var ids = [];
	for(var i=0; i<selectedQ.length; i++){
		ids.push(selectedQ[i]["Id"]);
	}
	return ids;
}

/* Returns the value of the first checked input element contained by the given element 
 * This assumes radio input types inside a div of their own */
function getCheckedValue(divId) {
	var elems = document.getElementById(divId).getElementsByTagName("INPUT");
	for(var i=0; i<elems.length; i++){
		if(elems[i].checked){
			return elems[i].value;
		}
	}
	return -1;
}

/* Returns an array of the checked input values inside of given element 
 * This assumes checkbox input types inside a div of their own */
function getCheckedValues(divId) {
	var checked = [];
	var elems = document.getElementById(divId).getElementsByTagName("INPUT");
	for(var i=0; i<elems.length; i++) {
		if(elems[i].checked) {
			checked.push(elems[i].value);
		}
	}
	if(checked.length === 0)
		checked = [1,2,3,4,5];
	return checked;
}

/* Removes question with qId from the array qArr */
function removeQuestionFromArray(qId, qArr) {
	var thisQ = document.getElementById(qId);
	for(var i=0; i<qArr.length; i++){
		if(qArr[i]["Id"] === qId) {
			qArr.splice(i, 1);
			break;
		}
	}
	return qArr;
}

/* Determines which array (selectedQ or matchedQ) is associated with a display */
function getRelatedArray(displayId) {
	var relatedQ;
	if(displayId === "matchedList" || displayId[0] === "m"){
		relatedQ = matchedQ;
	} else if(displayId === "previewList" || displayId[0] === "s") {
		relatedQ = selectedQ;
	} else {
		relatedQ = localQ;
	}
	return relatedQ;
}

/* Checks the given question's Id against all Ids in localQ
 * Returns true if given question's Id is not found */
function uniqQuestion(question, qArr){
	var uniq = true;
	var thisId = question["Id"];
	for(var i=0; i<qArr.length; i++){
		if( qArr[i]["Id"] === thisId ) {
			uniq = false;
			break;
		}
	}
	return uniq;
}

/* Checks if the given diff is in the array of diffs
 * Loose comparison so e.g. 1 will match "1" */
function containsDiff(diff, diffs){
	for(var i=0; i<diffs.length; i++)
		if(diffs[i] == diff) 
			return true;
	return false;
}

/* Given a number 1-5, it will return string version of that difficulty
 * Given a string Very Easy, Easy, Medium, Hard, Very Hard return corresponding 1-5
 * Given anything else, returns -1 */
function convertDiffFormat(diff) {
	var swapper = {"1":"Very Easy", "2":"Easy", "3":"Medium", "4":"Hard", "5":"Very Hard",
				   1:"Very Easy"  , 2:"Easy"  , 3:"Medium"  , 4:"Hard"  , 5:"Very Hard"  ,
				   "Very Easy":"1", "Easy":"2", "Medium":"3", "Hard":"4", "Very Hard":"5", };
	return swapper[diff];
}

/* Checks value of addRange and updates display */
function updateDiff() {
	addSpan.innerHTML = convertDiffFormat(addRange.value);
}

/* Checks that the given element has a non-empty value */
function nonEmpty(elemId) {
	return ( document.getElementById(elemId).value !== "" );
}

/* Empties an array by setting its length to 0 */
function clearArray(arr) {
	arr.length = 0;
}
