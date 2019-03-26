function insertTab(e) {
    if (e.keyCode === 9) {
        document.execCommand('insertHTML', false, '    ');
        e.preventDefault();
    }
}

/* Adds a button to the end of the student's question display */
function addSubmitToDisplay() {
	var theBtn = document.createElement("BUTTON");
	theBtn.setAttribute("type","button");
	theBtn.setAttribute("id", "testSub"); // <-- might have to change this
	theBtn.addEventListener("click", function() { validateForm("SubmitTest") } );
	theBtn.innerHTML = "Submit Exam";
	sTestDisp.appendChild(theBtn);
}


/* Searches through local questions returning matches
 * Topic   : A topic to search by, "" matches all topics
 * Diffs[] : An array of difficulties to filter by
 * Keys[]  : An array of words to search through descriptions by */
function localSearch(topic, diffs, keys) {
	//console.log("localSearch");
	var matches = [];
	for(var i=0; i<iLocalQ.length; i++){
		var thisQ = iLocalQ[i];
		var thisTopic = thisQ['topic'].toLowerCase();
		if(topic === "" || thisTopic.match(topic.toLowerCase())){
			// Topic matches, now check Diffs
			var thisDiff = thisQ['diff'];
			if( inArr(thisDiff, diffs) ){
				// Topic and Diff matches, check Keys
				var thisDesc = thisQ['desc'].toLowerCase();
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
 * Updates the iMatchQ array with Q's matching new search criteria
 * Displays the iMatchQ in the matches section */
function displaySearchResults() {
	var topic = searchTopic.value;
	var diffs = getCheckedValues("searchDiff");
	var keys  = getNonEmptyInputs("searchKeys");
	var M  = localSearch(topic, diffs, keys);
	iMatchQ.length = 0;
	for(var i=0; i<M.length; i++) {
		if( uniqQuestion(M[i], iMatchQ) && uniqQuestion(M[i], iActiveQ) ){
			iMatchQ.push(M[i]);
		}
	}
	iMatchQ.sort( (a,b) => { a['id'] < b['id'] } );
	updateDisplays(["matchedList"]);
}

/* Checks that all fields are correct in form being submitted */
function validateForm(type, callback) {
	switch(type) {
		case "AddQ":
			if(nonEmpty("addDesc") && nonEmpty("addTopic")) {
				var testsArray = getNonEmptyInputs("addTests");
				if(validateTests(testsArray)){
					callback();
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
				callback();
				clearForm("testForm");
			}
			else {
				alert("Make sure you've named the exam!");
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
	if(tests.length < 2) return false;	
	var pattern = /[a-zA-Z][a-zA-Z0-9]*\( *([^, (]+ *(, *[^,( ]+)*)|\) *\) *= *.*/;
	for(var i=0; i<tests.length; i++){
		if(!tests[i].match(pattern)){
			return false;
		}
	}
	return true;
}

/* Toggles whether the clicked on question is in iActiveQ 
 * listItemId: The id of the List Item that the question appears in */
function toggleSelected(listItemId) {
	var id = listItemId.substring(1);
	if(listItemId[0] == "t") {
		// add test with id to sActiveT 
		sActiveT.length = 0;
		for(var i=0; i<sLocalT.length; i++) {
			var thisT = sLocalT[i];
			if(thisT['id'] == id) {
				sActiveT.push(thisT);
				break;
			}
		}
        console.log("Just toggled ");
        console.log( JSON.stringify(sActiveT) );
		updateDisplays(["sTestDisp"]);
	}
	else if ( listItemId[0] == "m") { // Selected Item is a matchList question
		// add Q to iActiveQ, remove from iMatchQ
		for(var i=0; i<iMatchQ.length; i++){
			var thisQ = iMatchQ[i];
			if(thisQ['id'] == id){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, iActiveQ)){
					iActiveQ.push(thisQ);
				}
				iMatchQ = removeItemFromArray(thisQ['id'], iMatchQ);
				break;
			}
		}
		updateDisplays(["activeList", "matchedList"]);
	}
	else if ( listItemId[0] == "a") { // Selected Item is a activeList question
		// add Q to iMatchQ, remove from iActiveQ
		for(var i=0; i<iActiveQ.length; i++){
			var thisQ = iActiveQ[i];
			if(thisQ['id'] == id){ // Check if found the clicked on Q
				if(uniqQuestion(thisQ, iMatchQ)){
					iMatchQ.push(thisQ);
				}
				iActiveQ = removeItemFromArray(thisQ['id'], iActiveQ);
				break;
			}
		}
		updateDisplays(["activeList", "matchedList"]);
	}
	else {
		//console.log("Shouldn't have gotten here");
	}
	//console.log(studLocalT);
	//console.log(studAvailT);
	//console.log(sActiveT);
}

/* Resets all of the inputs inside of the specified element.
 * Removes additionally added text boxes like those for test cases*/
function clearForm(formId) {
	//console.log("clearForm");
	var inputs = document.getElementById(formId).getElementsByTagName("INPUT");
	var elems  = document.getElementById(formId).getElementsByClassName("modular");
	// Reset all inputs
	for(var i=0; i<inputs.length; i++) {
		switch(inputs[i].type) {
			case "text":
				inputs[i].value = "";
				break;
			case "range":
				inputs[i].value = 3;
				updateDiff();
				break;
			case "radio":
				if(inputs[i].value == 0)
					inputs[i].checked = true;
				break;
			default:
				break;
		}
	}
	// Reset all modular elements
	for(var i=0; i<elems.length; i++) {
		var classes = elems[i].classList;
		if(classes.contains('tests')) {
			resetModal("Test Cases", elems[i].id, 'addInput("'+elems[i].id+'")');
		} else {
			resetModal("Keywords"  , elems[i].id, 'addInput("'+elems[i].id+'")');
		}
	}
}

function clearMatches() {
	iMatchQ.length = 0;
	updateDisplays(["matchedList"]);
}

function resetDisplay(displayId) {
	document.getElementById(displayId).innerHTML = "";
}

/* Called whenever iMatchQ might change */
function updateDisplays(displayIdArr) {
	for(var i = 0; i<displayIdArr.length; i++){
		var thisId = displayIdArr[i];
        console.log("thisId", thisId);
		var relArr = getRelArr(thisId);
        console.log(relArr);
		resetDisplay(thisId);
		for(var j=0; j<relArr.length; j++) {
			addItemToDisplay(relArr[j], thisId, j);
		}
	}
} 

/* Addes a toggle-able item to the display */
function addItemToDisplay(newItem, displayId, num) {
    var item;
    switch(displayId) {
        case "matchedList":
            item = buildMatchedQuestionItem(newItem, displayId, num);
            break;
        case "activeList":
            item = buildActiveQuestionItem(newItem, displayId, num);
            break;
        case "sTestDisp":
            if(sActiveT.length === 0)
                item = buildTestSummaryItem(newItem, displayId, num);
            else if(sActiveT.length === 1) 
                item = buildQuestionItem(newItem, displayId, num);
            else
                item = document.createTextNode("sActiveT has "+sActiveT.length+" tests in it!");
            break;
        default:
            item = document.createTextNode(displayId + " not handled by addItemToDisplay!");
    }
	document.getElementById(displayId).appendChild(item);
}

function buildMatchedQuestionItem(newItem, displayId, num) {
    var item      = document.createElement("LI");
    var descText  = document.createTextNode(newItem['desc']);
    var diffText  = document.createTextNode("Difficulty: "+convertDiffFormat(newItem['diff']));
    var topicText = document.createTextNode("Topic: "+newItem['topic']);
    var strObj    = getIdClassStrObj(newItem, displayId);
    item.setAttribute("id", strObj['idStr']);
    item.setAttribute("class", strObj['classStr']);
    item.addEventListener("click", function() { toggleSelected( strObj['idStr'] ) });
    item.appendChild(descText);
    item.appendChild(document.createElement("BR"));
    item.appendChild(diffText);
    item.appendChild(topicText);
    return item;
}

function buildActiveQuestionItem(newItem, displayId, num) {
    var thisDesc = newItem['desc'];                          // Variables specific
    var thisNum  = num + 1;                                  // to this quetion
    var thisPts  = 5;
    var strObj   = getIdClassStrObj(newItem, displayId);
    var idStr    = strObj['idStr'];

    var item      = document.createElement("LI");            // Build the elements
    var qDiv      = document.createElement("DIV");           // that will go into
    var qTop      = document.createElement("DIV");           // this question
    var qTopLeft  = document.createElement("DIV");
    var qTopMid   = document.createElement("DIV");
    var qTopRight = document.createElement("DIV");
    var qBot      = document.createElement("DIV");
    var qBtn      = document.createElement("BUTTON");
    var qBtnText  = document.createTextNode("X");
    var qNum      = document.createTextNode(thisNum + ".)");
    var qDesc     = document.createTextNode(thisDesc);
    var qPtsInput = document.createElement("INPUT");
    var qPtsText  = document.createTextNode(" Pts");
         qDiv.setAttribute("class", "qDiv active");          // Set attributes of
         qDiv.setAttribute("id", idStr);                     // and append children to
         qDiv.appendChild(qTop);                             // the elements
         qDiv.appendChild(qBot);             
         qDiv.appendChild(qBtn);             
         qTop.setAttribute("class", "qTop"); 
         qTop.appendChild(qTopLeft);
         qTop.appendChild(qTopMid);
         qTop.appendChild(qTopRight);
     qTopLeft.setAttribute("class", "qTopLeft");
     qTopLeft.appendChild(qNum);
      qTopMid.setAttribute("class", "qTopMid");
      qTopMid.appendChild(qDesc);
    qTopRight.setAttribute("class", "qTopRight");
    qTopRight.appendChild(qPtsInput);
    qTopRight.appendChild(qPtsText);
         qBtn.setAttribute("class", "qBtn");
         qBtn.addEventListener("click", () => { toggleSelected(idStr); });
         qBtn.appendChild(qBtnText);
    qPtsInput.setAttribute("class", "qPts");
    qPtsInput.setAttribute("maxlength", "3");
    qPtsInput.setAttribute("size", "1");
    qPtsInput.setAttribute("tabindex", thisNum);
         qBot.setAttribute("class", "qBot"); 
         item.appendChild(qDiv); 
    return item;
}

function buildTestSummaryItem(newItem, displayId, num) {
    var thisDesc  = newItem['desc'];        // Get the variables
    var thisQues  = newItem['ques'];        // specific to this test
    var thisNum   = newItem['ques'].length; // Figure out the number of questions
    var strObj    = getIdClassStrObj(newItem, displayId);
    var uniqTops  = [];                     // Figure out the topics of these questions
    var uniqDiffs = [];                     // Figure out the difficulties of these questions
    var lowerCaseTops = [];
    for(var i=0; i<thisNum; i++) {
        var thisQ    = thisQues[i];
        var thisTop  = thisQ['topic'];
        var thisDiff = thisQ['diff'];
        if( !inArr(thisTop.toLowerCase(), lowerCaseTops) ) {
            uniqTops.push( thisTop );
            lowerCaseTops.push( thisTop.toLowerCase() );
        }
        if( !inArr(thisDiff, uniqDiffs) ) {
            uniqDiffs.push( thisDiff );
        }
    }
    uniqDiffs.sort();                       // Sort the difficulties
    var uniqDiffsText = [];                 // and turn them into strings
    for(var i=0; i<uniqDiffs.length; i++) { //
        uniqDiffsText.push( convertDiffFormat(uniqDiffs[i]) );
    }
    var topicStr = "";
    var diffStr = "";
    for(var i=0; i<uniqTops.length; i++) {
        var leadStr = (i===0)? "" : (i===uniqTops.length-1)? " & " : ", ";
        topicStr += leadStr + uniqTops[i];
    }
    for(var i=0; i<uniqDiffsText.length; i++) {
        var leadStr = (i===0)? "" : (i===(uniqDiffsText.length-1))? " & " : ", ";
        diffStr += leadStr + uniqDiffsText[i];
    }
    var queStr  = (thisNum === 1)? " Question" : " Questions";
    var item    = document.createElement("LI");  // Create the elements that
    var tTop    = document.createElement("DIV"); // will go into the new item
    var tBot    = document.createElement("DIV");
    var tDesc   = document.createTextNode(thisDesc);
    var tNumQ   = document.createTextNode(thisNum + queStr);
    var tTopics = document.createTextNode("Topics: " + topicStr);
    var tDiffs  = document.createTextNode("Difficulties: " + diffStr);

    tTop.setAttribute("class", "tTop");
    tTop.appendChild(tDesc);
    tBot.setAttribute("class", "tBot");
    tBot.appendChild(tNumQ);
    tBot.appendChild(document.createElement("BR"));
    tBot.appendChild(tTopics);
    tBot.appendChild(document.createElement("BR"));
    tBot.appendChild(tDiffs);
    item.setAttribute("id",    strObj['idStr']);
    item.setAttribute("class", strObj['classStr']);
    item.setAttribute("tabindex", num+1);
    item.addEventListener("click", () => { toggleSelected(strObj['idStr'])  });
    item.addEventListener("keyup", (e) => { if(e.keyCode==13) toggleSelected(strObj['idStr'])});
    item.appendChild(tTop);
    item.appendChild(tBot);
    return item;
}

function buildQuestionItem(newItem, displayId, num) {
    thisDesc = newItem['desc']; // Variables specific
    thisNum  = num + 1;         // to this quetion
    thisPts  = 5;               //

    var item      = document.createElement("LI");  // Build the elements
    var qDiv      = document.createElement("DIV"); // that will go into
    var qTop      = document.createElement("DIV"); // this question
    var qTopLeft  = document.createElement("DIV");
    var qTopMid   = document.createElement("DIV");
    var qTopRight = document.createElement("DIV");
    var qBot      = document.createElement("DIV");
    var qAns      = document.createElement("TEXTAREA");
    var qNum      = document.createTextNode(thisNum + ".)");
    var qDesc     = document.createTextNode(thisDesc);
    var qPoints   = document.createTextNode(thisPts + " Pts");
    
         qDiv.setAttribute("class", "qDiv"); // Set attributes of
         qDiv.appendChild(qTop);             // and append children to
         qDiv.appendChild(qBot);             // the elements
         qTop.setAttribute("class", "qTop"); 
         qTop.appendChild(qTopLeft);
         qTop.appendChild(qTopMid);
         qTop.appendChild(qTopRight);
     qTopLeft.setAttribute("class", "qTopLeft");
     qTopLeft.appendChild(qNum);
      qTopMid.setAttribute("class", "qTopMid");
      qTopMid.appendChild(qDesc);
    qTopRight.setAttribute("class", "qTopRight");
    qTopRight.appendChild(qPoints);
         qBot.setAttribute("class", "qBot");
         qBot.appendChild(qAns);
         qAns.setAttribute("class", "qAns");
         qAns.addEventListener("keydown", (e) => { insertTab(e) });
         qAns.setAttribute("contenteditable", "true");
         item.appendChild(qDiv);

    return item;
}


/* Returns an object with two fields: idStr and classStr
 * Used for constructing a new list item to add to displays */
function getIdClassStrObj(newItem, displayId) {
	//console.log("getIdClassStrObj");
	var strObj = {};
	     if(displayId === "matchedList") {
		strObj['idStr']    = "m" + newItem['id'];
		strObj['classStr'] = "matched";
	}
	else if(displayId === "activeList") {
		strObj['idStr']    = "a" + newItem['id'];
		strObj['classStr'] = "selected";
	}
	else if(displayId === "sTestDisp" && sActiveT.length === 0) {
		strObj['idStr']    = "t" + newItem['id'];
		strObj['classStr'] = "available";
	}
	else if(displayId === "sTestDisp" && sActiveT.length === 1) {
		strObj['idStr']    = "q" + newItem['id'];
		strObj['classStr'] = "question";
	}
	else {
		strObj['idStr'] = "?" + newItem['id'];
		strObj['classStr'] = "?" + "unknown";
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

function getSelectedQs() {
	var Qs = [];
	for(var i=0; i<iActiveQ.length; i++){
		Qs.push(iActiveQ[i]);
	}
	return Qs;
}

/* Returns an array of ids for the selected questions */
function getSelectedIds(){
	var ids = [];
	for(var i=0; i<iActiveQ.length; i++){
		ids.push(iActiveQ[i]['id']);
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
	// idStr = (A['id'])? 'id':'id';
	for(var i=0; i<A.length; i++){
		if(A[i]['id'] === id) {
			A.splice(i, 1);
			break;
		}
	}
	return A;
}

/* Determines which array (iActiveQ or iMatchQ) is associated with a display */
function getRelArr(displayId) {
	var relArr;
	if(displayId === "matchedList"){
		relArr = iMatchQ;
	} else if(displayId === "activeList") {
		relArr = iActiveQ;
	} else if(displayId === "sTestDisp") {
		if(sActiveT.length == 1){
            console.log("getRelArr", JSON.stringify(sActiveT[0]['ques']));
			relArr = sActiveT[0]['ques'];
		} 
		else {
			relArr = sLocalT;
		}
	} else {
		relArr = [{ 'desc':"Invalid Display Id", 'topic':"Fail", 'id':"Fail", 'diff':"Fail",
					'tests':["a()=b", "a()=c"] }];
	}
	return relArr;
}

/* Checks the given question's Id against all Ids in localQ
 * Returns true if given question's Id is not found */
function uniqQuestion(question, qArr){
	//console.log("uniqQuestion");
	var uniq = true;
	var thisId = question['id'];
	for(var i=0; i<qArr.length; i++){
		if( qArr[i]['id'] === thisId ) {
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
