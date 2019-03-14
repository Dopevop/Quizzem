/* Sends the specified type of request to the server 
 * Types so far: 
 * AddQ: Option field not checked
 * SearchQ: Option field is source of call
 * 	If from Student -> only get released Tests, store in student's local array
 * 	If from Teacher -> Get all release status, store in teacher's local array
 * */
function sendRequest(reqType, option) {
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
		jsonObj["Diffs"] = [1,2,3,4,5];
		jsonObj["Topic"] = "";
		jsonObj["Keys"]  = [];
	} else if(reqType === "AddTest") {
		jsonObj["TestName"] = testDesc.value;
		jsonObj["Rel"]      = getCheckedValue("testRelease");
		jsonObj["QIds"]     = getSelectedIds();
	} else if(reqType === "GetTests") {
		if(option == "student")
			jsonObj["Rels"] = [1]; 		// Only get released tests for student page
		else if(option == "instructor")
			jsonObj["Rels"] = [0, 1]; 	// Get all tests for instructor page
	} else {
		console.log("Invalid reqType passed to sendRequest()");
	}
	var jsonStr = JSON.stringify(jsonObj);
	// console.log("Sent:" + jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			// console.log("Rcvd:"+xhttp.responseText);
			var replyObj = JSON.parse(xhttp.responseText);
			if( replyObj["Error"] != 0 ) {
				console.log("Error: " + replyObj["Error"]);
			}
			else {
				var localQ = (option == "student")? studLocalQ : instLocalQ;
				if(replyObj["Type"] === "AddQ") {
					alert("Question added successfully!");
					localQ.push(replyObj["Question"]);
					matchedQ.push(replyObj["Question"]);
					updateDisplays(["matchedList"]);
					// console.log(matchedQ);
				}
				else if(replyObj["Type"] === "SearchQ") {
					// Loop through DB Q's, adding each to local Q's
					var DBQ = replyObj["Questions"];
					for(var i=0; i<DBQ.length; i++){
						// if(!DBQ[i]["Topic"])
						// 	DBQ[i]["Topic"] = "UNDEFINED";
						if(uniqQuestion(DBQ[i], localQ)){
							localQ.push(DBQ[i]);
						}
					}
				}
				else if(replyObj["Type"] === "AddTest") {
					alert("Exam added successfully!");
				}
				else if(replyObj["Type"] === "GetTests") {
					if(option == "student") {
						addObjsToArray(replyObj["Tests"], studLocalT);
						addObjsToArray(replyObj["Tests"], studAvailT);
						updateDisplays( ["studTestNav"] );
					}
					else if(option == "instructor") {
						console.log("instructorLocalT not implemented yet!!");
					}
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

/* Takes a list of tests and displays them to be selected for student */
function displayAvailableTests(tests){
	console.log("Displaying tests for student");
	studTestNav.innerHTML = "";
	var numTests = tests.length
	var sumStr = getSumStr(numTests);
	addSummaryItem("studTestNav", sumStr)
	for(var i=0; i<numTests; i++){
		var test = tests[i];
		addItemToDisplay(test, "studTestNav");
	}
}

/* Creates a textnode with given string, adds it to given element */
function addSummaryItem(parentId, sumStr) {
	var child  = document.createTextNode("sumStr");
	var parent = document.getElementById(parentId);
	parent.appendChild(child);
}

/* Displays summary of test questions in nav
 * Displays test questions in main block of student page*/
function displaySelectedTest(){
}

/* Creates a test summary item and appends it to the given element */
function addTestToDisplay(displayId, test) {
	var tDiv  = document.createElement("DIV");
	var tName = document.createTextNode(test["TestName"]);
	var qSum  = document.createTextNode(""+test["QIds"].length+" Questions");
	tDiv.setAttribute("class", "available");
	tDiv.setAttribute("click", function() { 
		if(confirm("Are you sure you want to take the exam? You will not be able to retake it.")){
			studSelectedT = test["Id"];
			displaySelectedTest();
		}
	});
	tDiv.appendChild(tName);
	tDiv.appendChild(qSum);
	displayId.appendChild(tDiv);
}

/* Returns a text summary of the number of available tests */
function getSumStr(numTests){
	var sumStr;
	if(numTests < 1){
		sumStr = "No Tests Available";
	}
	else if(numTests == 1) {
		sumStr = "1 Test Available";
	}
	else {
		sumStr = "Tests Available";
	}
	return sumStr;
}

/* Takes a test, displays all of its questions on student page */
function displayTestQuestions(test) {
	console.log("entered displayTest");
	console.log(test);
	var testQuestions = [];
	for(var i=0; i<test["QIds"].length; i++){
		var thisId = test["QIds"][i];
		console.log(thisId);
		for(var j=0; j<studentLocalQ.length; j++){
			var thisQ = studentLocalQ[j];
			console.log(thisQ);
			if(thisQ["Id"] == thisId){
				testQuestions.push(thisQ);
				break;
			}
		}
	}
	for(var i=0; i<testQuestions.length; i++){
		console.log(testQuestions[i]);
		addQuestionToDisplay(testQuestions[i], i);
	}
	addSubmitToDisplay();
}

	/* Appends one question to the end of the question display */
function addQuestionToDisplay(Q, num) {
	var qDiv      = document.createElement("DIV");
	var leftMarg  = document.createElement("DIV");
	var numText   = document.createTextNode("" + ( num + 1 ) + ".)");
	var rightMarg = document.createElement("DIV");
	var ptsText	  = document.createTextNode("5 Pts");
	var desc      = document.createElement("P");
	var answer    = document.createElement("TEXTAREA");

	     qDiv.setAttribute("class", "qDiv");
	 leftMarg.setAttribute("class", "qLeftMargin");
	 leftMarg.appendChild(numText);
	rightMarg.setAttribute("class", "qRightMargin");
	rightMarg.appendChild(ptsText);
	     desc.setAttribute("class", "qDesc");
	     desc.innerHTML = Q["Desc"];
	   answer.setAttribute("class", "qAns");

	qDiv.appendChild(leftMarg);
	qDiv.appendChild(desc);
	qDiv.appendChild(answer);
	qDiv.appendChild(rightMarg);

	qDisplay.appendChild(qDiv);
	
}

/* Adds a button to the end of the student's question display */
function addSubmitToDisplay() {
	var theBtn = document.createElement("BUTTON");
	theBtn.setAttribute("type","button");
	theBtn.setAttribute("id", "testSub"); // <-- might have to change this
	theBtn.addEventListener("click", function() { validateForm("SubmitTest") } );
	theBtn.innerHTML = "Submit Exam";
	qDisplay.appendChild(theBtn);
}


/* Searches through local questions returning matches
 * Topic   : A topic to search by, "" matches all topics
 * Diffs[] : An array of difficulties to filter by
 * Keys[]  : An array of words to search through descriptions by */
function localSearch(topic, diffs, keys) {
	var matches = [];
	for(var i=0; i<instLocalQ.length; i++){
		var thisQ = instLocalQ[i];
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
	switch(type) {
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
		case "SubmitTest":
			alert("Submitting Test!");
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
	var pattern = /[a-zA-Z][a-zA-Z0-9]*\( *([^, (]+ *(, *[^,( ]+)*)|\) *\) *= *.*/;
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
	var id = listItemId.substring(1);
	if(listItemId[0] == "t") {
		// add test with id to studSelectedT; remove from studAvailT
		for(var i=0; i<studAvailT.length; i++) {
			var thisT = studAvailT[i];
			if(thisT["TestId"] == id) {
				studSelectedT = thisT;
				studSelectedT = removeItemFromArray(thisT["TestId"], studSelectedT);
				break;
			}
		}
		updateDisplays(["studTestNav"]);
	}
	else if ( listItemId[0] == "m") { // Selected Item is a matchList question
		// add Q to selectedQ, remove from matchedQ
		for(var i=0; i<matchedQ.length; i++){
			var thisQ = matchedQ[i];
			if(thisQ["Id"] == id){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, selectedQ)){
					selectedQ.push(thisQ);
				}
				matchedQ = removeItemFromArray(thisQ["Id"], matchedQ);
				break;
			}
		updateDisplays(["previewList", "matchedList"]);
		}
	}
	else if ( listItemId[0] == "p") { // Selected Item is a previewList question
		// add Q to matchedQ, remove from selectedQ
		for(var i=0; i<selectedQ.length; i++){
			var thisQ = selectedQ[i];
			if(thisQ["Id"] == id){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, matchedQ)){
					matchedQ.push(thisQ);
				}
				selectedQ = removeItemFromArray(thisQ["Id"], selectedQ);
				break;
			}
		}
		updateDisplays(["previewList", "matchedList"]);
	}
	else {
		console.log("Shouldn't have gotten here");
	}
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
function resetDisplay(displayId) {
	console.log("clearing display: "+displayId);
	var display = document.getElementById(displayId);
	var ul      = document.createElement("UL");
	if( displayId === "previewList" ){
		ul.setAttribute("id", "pList");
		ul.appendChild(document.createTextNode("Selected"));
	} 
	else if( displayId === "matchedList" ) {
		ul.setAttribute("id", "mList");
		ul.appendChild(document.createTextNode("Matches"));
	}
	else if( displayId === "studTestNav" ) {
		ul.setAttribute("id", "tList");
		ul.appendChild(document.createTextNode("Tests"));
	}
	else if( displayId === "||||||||||||||||||||||||||||||||||||||||||||||||||||||" ) {
	}
	else {
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
		resetDisplay(thisId);
		for(var j=0; j<relatedQ.length; j++)
			addItemToDisplay(relatedQ[j], thisId);
	}
} 
function addItemToDisplay(newItem, displayId) {
	console.log("Adding item to display: "+displayId);
	if(displayId === "matchedList" || displayId === "previewList") {
		var item      = document.createElement("LI");
		var descText  = document.createTextNode(newItem["Desc"]);
		var diffText  = document.createTextNode("Difficulty: "+convertDiffFormat(newItem["Diff"]));
		var topicText = document.createTextNode("Topic: "+newItem["Topic"]);
		var strObj    = getIdClassStrObj(newItem, displayId);
		item.setAttribute("id", strObj["idStr"]);
		item.setAttribute("class", strObj["classStr"]);
		item.addEventListener("click", function() { toggleSelected( strObj["idStr"] ) });
		item.appendChild(descText);
		item.appendChild(document.createElement("BR"));
		item.appendChild(diffText);
		item.appendChild(document.createTextNode(" ~ "));
		item.appendChild(topicText);
	}
	else if(displayId === "studTestNav") {
		var item     = document.createElement("LI");
		var descText = document.createTextNode(newItem["TestName"]);
		var numQText = document.createTextNode(""+newItem["QIds"].length+" Questions");
		var strObj   = getIdClassStrObj(newItem, displayId);
		item.setAttribute("id", strObj["idStr"]);
		item.setAttribute("class", strObj["classStr"]);
		item.appendChild(descText);
		item.appendChild(document.createElement("BR"));
		item.appendChild(numQText);
		item.appendChild(document.createElement("BR"));
		item.addEventListener("click", function() { 
			if(confirm("Are you sure you want to take the exam?")){
				studSelectedT = newItem["TestId"];
				displaySelectedTest(document.getElementById(strObj["idStr"]));
			}});
		} 
	else {
	}
	document.getElementById(displayId).appendChild(item);
}


/* Returns an object with two fields: idStr and classStr
 * Used for constructing a new list item to add to displays */
function getIdClassStrObj(newItem, displayId) {
	var strObj = [];
	     if(displayId === "matchedList") {
		strObj["idStr"]    = "m" + newItem["Id"];
		strObj["classStr"] = "matched";
	}
	else if(displayId === "previewList") {
		strObj["idStr"]    = "p" + newItem["Id"];
		strObj["classStr"] = "selected";
	}
	else if(displayId === "studTestNav") {
		strObj["idStr"]    = "t" + newItem["TestId"];
		strObj["classStr"] = "available";
	}
	else {
		strObj["idStr"] = "?" + newItem["Id"];
		strObj["classStr"] = "?" + "unknown";
	}
	return strObj;
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

/* Adds an array of objects to another array */
function addObjsToArray(objs, array){
	for(var i=0; i<objs.length; i++)
		array.push(objs[i]);
}

/* Removes question with qId from the array qArr */
function removeItemFromArray(id, A) {
	for(var i=0; i<A.length; i++){
		if(A[i]["Id"] === id) {
			A.splice(i, 1);
			break;
		}
	}
	return A;
}

/* Determines which array (selectedQ or matchedQ) is associated with a display */
function getRelatedArray(displayId) {
	var relatedQ;
	if(displayId === "matchedList" || displayId[0] === "m"){
		relatedQ = matchedQ;
	} else if(displayId === "previewList" /*|| displayId[0] === "s"*/) {
		relatedQ = selectedQ;
	} else if(displayId === "studTestNav") {
		relatedQ = studLocalT;
	} else {
		relatedQ = [];
		console.log("No relatedQ found for " + displayId);
	}
	console.log("relatedQ for "+displayId+" is:");
	console.log(relatedQ);
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
