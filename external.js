/* Sends a request for all questions stored in database */
/* These will be stored locally in the instructor's iLocalQ */
/* instructor.html is only page that will be requesting Q's */
function sendGetQ() {
	var xhttp   = new XMLHttpRequest();
	var jsonObj = {
		"Type"  : "SearchQ",   // Build SearchQ req
		"Topic" : "",          // Don't filter by topic
		"Diff"  : [1,2,3,4,5], // Don't filter by diff
		"Keys"  : [],          // Don't filter by keyword
	}
	var jsonStr = JSON.stringify(jsonObj);
	console.log("Sent:"+jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log("Rcvd:"+xhttp.responseText);
			var replyObj = JSON.parse(xhttp.responseText);
			if( replyObj["Error"] != 0 ) {
				console.log("Error: " + replyObj["Error"]);
			}
			else {
				var DBQ = replyObj["Questions"];       // Extract all Qs
				for(var i=0; i<DBQ.length; i++){       // Put all uniq Qs in
					if(uniqQuestion(DBQ[i], iLocalQ)){ //   instructor's local
						iLocalQ.push(DBQ[i]);          //   Q array
					}
				}
			}
	}
	xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(jsonStr);
	}
}

/* Sends a request for all appropriate tests        */
/* Both student and instructor will use this method */
/* source: either 'student' or 'instructor'         */
/* if student: only released exams will be sent     */
/* -- tests stored in sLocalT                       */
/* if instructor: all tests in DB will be sent      */
/* -- tests stored in iLocalT                       */
function sendGetTests(source) {
	var xhttp   = new XMLHttpRequest();
	var jsonObj = {
		"Type"     : "GetTests",                     // Send a GetTests req
		"Rels" : (source == "student")? [1] : [0,1], // Only released tests for student
	}
	var jsonStr = JSON.stringify(jsonObj);
	console.log("Sent:"+jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log("Rcvd:"+xhttp.responseText);
			var replyObj = JSON.parse(xhttp.responseText);
			if( replyObj["Error"] != 0 ) {
				console.log("Error: " + replyObj["Error"]);
			}
			else {
				var localT = (source == "student")? sLocalT : iLocalT;
				var DBT = replyObj["Tests"];
				for(var i=0; i<DBT.length; i++){
					if(uniqQuestion(DBT[i], localT)){
						localT.push(DBT[i]);
					}
				}
				// clearArray(studLocalT);
				// clearArray(studAvailT);
				// addObjsToArray(replyObj["Tests"], studLocalT);
				// addObjsToArray(replyObj["Tests"], studAvailT);
				// updateDisplays( ["studTestNav", "studTestDisplay"] );
			}
	}
	xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(jsonStr);
	}
}

function sendAddQ() {
	var xhttp   = new XMLHttpRequest();
	var jsonObj = {
		"Type"  : "AddQ",
		"Desc"  : addDesc.value,
		"Topic" : addTopic.value,
		"Diff"  : addRange.value,
		"Tests" : getNonEmptyInputs("addTests"),
	}
	var jsonStr = JSON.stringify(jsonObj);
	console.log("Sent:"+jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log("Rcvd:"+xhttp.responseText);
			var replyObj = JSON.parse(xhttp.responseText);
			if( replyObj["Error"] != 0 ) {
				console.log("Error: " + replyObj["Error"]);
			}
			else {
				iLocalQ.push(replyObj["Question"]);
				matchedQ.push(replyObj["Question"]);
				updateDisplays(["matchedList"]);
			}
	}
	xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(jsonStr);
	}
}

function sendAddTest() {
	var xhttp   = new XMLHttpRequest();
	var jsonObj = {
		"Type"     : "AddTest",
		"TestName" : testDesc.value,
		"Rel"      : getCheckedValue("testRelease"),
		"QIds"     : getSelectedIds(),
	}
	var jsonStr = JSON.stringify(jsonObj);
	console.log("Sent:"+jsonStr);
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log("Rcvd:"+xhttp.responseText);
			var replyObj = JSON.parse(xhttp.responseText);
			if( replyObj["Error"] != 0 ) {
				console.log("Error: " + replyObj["Error"]);
			}
			else {
				var DBT = replyObj["Tests"];
				for(var i=0; i<DBT.length; i++){
					if(uniqQuestion(DBT[i], iLocalT)){
						iLocalT.push(DBT[i]);
					}
				}
			}
	}
	xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(jsonStr);
	}
}

// /* Takes a list of tests and displays them to be selected for student */
// function displayAvailableTests(tests){
// 	//console.log("displayAvailableTests");
// 	studTestNav.innerHTML = "";
// 	var numTests = tests.length
// 	var sumStr = getSumStr(numTests);
// 	addSummaryItem("studTestNav", sumStr)
// 	for(var i=0; i<numTests; i++){
// 		var test = tests[i];
// 		addItemToDisplay(test, "studTestNav");
// 	}
// }

// /* Creates a textnode with given string, adds it to given element */
// function addSummaryItem(parentId, sumStr) {
// 	//console.log("addSummaryItem");
// 	var child  = document.createTextNode("sumStr");
// 	var parent = document.getElementById(parentId);
// 	parent.appendChild(child);
// }

// /* Displays summary of test questions in nav
//  * Displays test questions in main block of student page*/
// function displaySelectedTest(){
// 	//console.log("displaySelectedTest");
// 	if(studSelectedT !== "none")
// 		displayTestQuestions(studSelectedT);
// 	else
// 		//console.log("studSelectedT was undefined");
// }

// /* Creates a test summary item and appends it to the given element */
// function addTestToDisplay(displayId, test) {
// 	//console.log("addTestToDisplay");
// 	var tDiv  = document.createElement("DIV");
// 	var tName = document.createTextNode(test["TestName"]);
// 	var qSum  = document.createTextNode(""+test["QIds"].length+" Questions");
// 	tDiv.setAttribute("class", "available");
// 	tDiv.appendChild(tName);
// 	tDiv.appendChild(qSum);
// 	document.getElementById(displayId).appendChild(tDiv);
// }

// /* Returns a text summary of the number of available tests */
// function getSumStr(numTests){
// 	//console.log("getSumStr");
// 	var sumStr;
// 	if(numTests < 1){
// 		sumStr = "No Tests Available";
// 	}
// 	else if(numTests == 1) {
// 		sumStr = "1 Test Available";
// 	}
// 	else {
// 		sumStr = "Tests Available";
// 	}
// 	return sumStr;
// }

// /* Takes a test, displays all of its questions on student page */
// function displayTestQuestions(test) {
// 	//console.log("displayTestQuestions");
// 	var testQuestions = [];
// 	for(var i=0; i<test["QIds"].length; i++){
// 		var thisId = test["QIds"][i];
// 		for(var j=0; j<studentLocalQ.length; j++){
// 			var thisQ = studentLocalQ[j];
// 			if(thisQ["Id"] == thisId){
// 				testQuestions.push(thisQ);
// 				break;
// 			}
// 		}
// 	}
// 	for(var i=0; i<testQuestions.length; i++){
// 		addQuestionToDisplay(testQuestions[i], i);
// 	}
// 	addSubmitToDisplay();
// }

/* Appends one question to the end of the question display */
function addQuestionToDisplay(Q, num) {
	//console.log("addQuestionToDisplay");
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
	//console.log("addSubmitToDisplay");
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
	//console.log("localSearch");
	var matches = [];
	for(var i=0; i<iLocalQ.length; i++){
		var thisQ = iLocal[i];
		var thisTopic = thisQ["Topic"].toLowerCase();
		if(topic === "" || thisTopic.match(topic.toLowerCase())){
			// Topic matches, now check Diffs
			var thisDiff = thisQ["Diff"];
			if( inArr(thisDiff, diffs) ){
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
	//console.log("displaySearchResults");
	var topic = searchTopic.value;
	var diffs = getCheckedValues("searchDiff");
	var keys  = getNonEmptyInputs("searchKeys");
	matchedQ  = localSearch(topic, diffs, keys);
	updateDisplays(["matchedList"]);
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(studSelectedT);
}

/* Checks that all fields are correct in form being submitted */
function validateForm(type) {
	//console.log("validateForm");
	switch(type) {
		case "AddQ":
			if(nonEmpty("addDesc") && nonEmpty("addTopic")) {
				var testsArray = getNonEmptyInputs("addTests");
				if(validateTests(testsArray)){
					sendAddQ();
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
			//console.log("Invalid type to validate");
	}
}

/* Makes sure there are at least two non-empty tests
 * Makes sure all tests are in the form of func([a][,b]...)=answer */
function validateTests(tests) {
	//console.log("validateTests");
	if(tests.length < 2){
		//console.log("Too few tests");
		return false;
	}
	var pattern = /[a-zA-Z][a-zA-Z0-9]*\( *([^, (]+ *(, *[^,( ]+)*)|\) *\) *= *.*/;
	for(var i=0; i<tests.length; i++){
		if(!tests[i].match(pattern)){
			//console.log("test " + i + " {"+ tests[i] +"} didn't match pattern");
			return false;
		}
	}
	return true;
}

/* Toggles whether the clicked on question is in selectedQ 
 * listItemId: The id of the List Item that the question appears in */
function toggleSelected(listItemId) {
	//console.log("toggleSelected");
	var id = listItemId.substring(1);
	if(listItemId[0] == "t") {
		// add test with id to studSelectedT; remove from studAvailT
		for(var i=0; i<studAvailT.length; i++) {
			var thisT = studAvailT[i];
			if(thisT["Id"] === id) { // Found the test that was clicked on
				studSelectedT = thisT;
				studAvailT    = removeItemFromArray(thisT["Id"], studAvailT);
				break;
			}
		}
		updateDisplays(["studTestNav", "studTestDisplay"]);
		studSelectedT = "none";
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
		}
		updateDisplays(["previewList", "matchedList"]);
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
		//console.log("Shouldn't have gotten here");
	}
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(studSelectedT);
}

/* Resets all of the inputs inside of the specified element.
 * Removes additionally added text boxes like those for test cases*/
function clearForm(formId) {
	//console.log("clearForm");
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
				break;
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
	//console.log("resetDisplay");
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
	else if( displayId === "studTestDisplay" ) {
		if(studSelectedT !== "none") {
			// A test has been selected
			ul.setAttribute("id", "qList");
			ul.appendChild(document.createTextNode(studSelectedT["TestName"]));
		} 
		else {
			ul.setAttribute("id", "info");
			var li = document.createElement("LI");
			var p  = document.createElement("P");
			var t  = document.createTextNode("Please select a test");
			 p.appendChild(t);
			li.appendChild(p);
			ul.appendChild(li);
		}
	}
	else {
		ul.setAttribute("id", "?List");
		ul.appendChild(document.createTextNode("??? Questions"));
	}
	display.innerHTML = "";
	display.appendChild(ul);
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(studSelectedT);
}

/* Called whenever matchedQ might change */
function updateDisplays(displayIdArr) {
	//console.log("updateDisplays");
	//console.log(displayIdArr);
	for(var i = 0; i<displayIdArr.length; i++){
		var thisId     = displayIdArr[i];
		var relArr = getRelArr(thisId);
		//console.log(thisId + JSON.stringify(relArr));
		resetDisplay(thisId);
		for(var j=0; j<relArr.length; j++) {
			addItemToDisplay(relArr[j], thisId, j);
		}
	}
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(studSelectedT);
} 

function addItemToDisplay(newItem, displayId, num) {
	//console.log("addItemToDisplay");
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
		item.appendChild(document.createElement("BR"));
		item.appendChild(topicText);
	}
	else if(displayId === "studTestNav") {
		var item     = document.createElement("LI");
		var descText = document.createTextNode(newItem["TestName"]);
		var numQText = document.createTextNode(""+newItem["Questions"].length+" Questions");
		var strObj   = getIdClassStrObj(newItem, displayId);
		item.setAttribute("id", strObj["idStr"]);
		item.setAttribute("class", strObj["classStr"]);
		item.appendChild(descText);
		item.appendChild(document.createElement("BR"));
		item.appendChild(numQText);
		item.appendChild(document.createElement("BR"));
		item.addEventListener("click", function() { toggleSelected(strObj["idStr"])	});
	} 
	else if(displayId === "studTestDisplay") {
		var item      = document.createElement("LI");
		var qDiv      = document.createElement("DIV");
		var leftMarg  = document.createElement("DIV");
		var numText   = document.createTextNode("" + (num+1) + ".)");
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
			 desc.innerHTML = newItem["Desc"];
		   answer.setAttribute("class", "qAns");
		     qDiv.appendChild(leftMarg);
		     qDiv.appendChild(desc);
		     qDiv.appendChild(answer);
		     qDiv.appendChild(rightMarg);
			 item.appendChild(qDiv);
	}
	else {
	}
	document.getElementById(displayId).appendChild(item);
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(studSelectedT);
}


/* Returns an object with two fields: idStr and classStr
 * Used for constructing a new list item to add to displays */
function getIdClassStrObj(newItem, displayId) {
	//console.log("getIdClassStrObj");
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
		strObj["idStr"]    = "t" + newItem["Id"];
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
	//console.log("addInput");
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
	//console.log("resetModal");
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
	//console.log("getNonEmptyInputs");
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
	//console.log("getSelectedIds");
	var ids = [];
	for(var i=0; i<selectedQ.length; i++){
		ids.push(selectedQ[i]["Id"]);
	}
	return ids;
}

/* Returns the value of the first checked input element contained by the given element 
 * This assumes radio input types inside a div of their own */
function getCheckedValue(divId) {
	//console.log("getCheckedValue");
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
	//console.log("getCheckedValues");
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
	//console.log("addObjsToArray");
	for(var i=0; i<objs.length; i++)
		array.push(objs[i]);
}

/* Removes question with qId from the array qArr */
function removeItemFromArray(id, A) {
	//console.log("removeItemFromArray");
	idStr = (A["Id"])? "Id":"Id";
	for(var i=0; i<A.length; i++){
		if(A[i][idStr] === id) {
			A.splice(i, 1);
			break;
		}
	}
	return A;
}

/* Determines which array (selectedQ or matchedQ) is associated with a display */
function getRelArr(displayId) {
	//console.log("getRelArr");
	var relArr;
	if(displayId === "matchedList" || displayId[0] === "m"){
		relArr = matchedQ;
	} else if(displayId === "previewList" /*|| displayId[0] === "s"*/) {
		relArr = selectedQ;
	} else if(displayId === "studTestNav") {
		relArr = studAvailT;
	} else if(displayId === "studTestDisplay") {
		relArr = [];
		if(!studSelectedT){
			for(var i=0; i<studLocalQ.length; i++){
				var thisQ = studLocalQ;
				if( inArr(thisQ["Id"], studSelectedT["QIds"])) {
					//console.log("Found thisQ in selected test Qs");
					relArr.push(thisQ);
				}
			}
		}
	} else {
		relArr = [];
	}
	return relArr;
}

/* Checks the given question's Id against all Ids in localQ
 * Returns true if given question's Id is not found */
function uniqQuestion(question, qArr){
	//console.log("uniqQuestion");
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
function inArr(key, arr){
	//console.log("inArr");
	for(var i=0; i<arr.length; i++)
		if(arr[i] == key) 
			return true;
	return false;
}

/* Given a number 1-5, it will return string version of that difficulty
 * Given a string Very Easy, Easy, Medium, Hard, Very Hard return corresponding 1-5
 * Given anything else, returns -1 */
function convertDiffFormat(diff) {
	//console.log("convertDiffFormat");
	var swapper = {"1":"Very Easy", "2":"Easy", "3":"Medium", "4":"Hard", "5":"Very Hard",
				   1:"Very Easy"  , 2:"Easy"  , 3:"Medium"  , 4:"Hard"  , 5:"Very Hard"  ,
				   "Very Easy":"1", "Easy":"2", "Medium":"3", "Hard":"4", "Very Hard":"5", };
	return swapper[diff];
}

/* Checks value of addRange and updates display */
function updateDiff() {
	//console.log("updateDiff");
	addSpan.innerHTML = convertDiffFormat(addRange.value);
}

/* Checks that the given element has a non-empty value */
function nonEmpty(elemId) {
	//console.log("nonEmpty");
	return ( document.getElementById(elemId).value !== "" );
}

/* Empties an array by setting its length to 0 */
function clearArray(arr) {
	//console.log("clearArray");
	arr.length = 0;
}
