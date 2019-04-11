let p1 = [
    "func()=ans",
    "myMethod( )=myAnswer",
    "add(1,4)=5",
    "sub( 5, 3)=  2",
    "divide( 4, 2, 1)  =  2",
    "  f( a, b ) = ans",
    "print( \"hi\" )   =  \"hi\"",
    "mult( 45 , 3 ) = 135",
    "plus(1,2,3,4,5) = 15",
    "concat( 'boo' , 'yah' )='booyah'",
    "greet( \"Bob\" , \"Hi\" ) = \"Hi, Bob\"",
    "mysteryFunc()='b'",
    "echo('gross')='gross'",
    "ignore(\"print me!\")=\"\"",
    "hijk(5)=\"lmnop\"",
    "hijk(3)=\"lmn\"",
    "abcd(5)=\"efghi\"",
    "zyx(5)=\"wvuts\"",
    "next(\"h\", 5)=\"ijklm\"",
    "next(\"q\", 3)=\"rst\"",
];
let p2 = [];
let p = p1;
let q = p2;

function disableButton(btnId) {
    return new Promise((resolve) => {
        document.getElementById(btnId).disabled = true;
        resolve();
    });
}

function enableButton(btnId) {
    document.getElementById(btnId).disabled = false;
}

const fetch = (type) => new Promise((resolve,reject) => {
    let url     = "https://web.njit.edu/~djo23/CS490/curlObj.php";
    let xhr     = new XMLHttpRequest();
    let source  = (document.getElementById("sHeadNav"))? "student" : "instructor";
    let jsonStr = buildPostBody(type, source);
    console.log("Sent:", jsonStr);
    xhr.onload  = () => resolve(xhr.responseText);
    xhr.onerror = () => reject("Network Error");
    xhr.open('post', url, true);
    xhr.send(jsonStr);
});

function handleReply(replyText, source) {
	var replyObj = JSON.parse(replyText);
	switch(replyObj.type) {
		case 'addQ':
			iLocalQ.push(replyObj.que);  // Add to local Qs
			iMatchedQ.push(replyObj.que); // Add to matched Qs
            updateDisplays(["iMainSection"]);
			break;
		case 'getQ':
			var DBQ = replyObj.ques;       // Extract all Qs
            iLocalQ = DBQ;
            // for(var i=0; i<DBQ.length; i++) {
            //     if(uniqItem(DBQ[i], iLocalQ)) {
            //         iLocalQ.push(DBQ[i]);
            //     }
            // }
            updateDisplays(["iMainSection"]);
			break;
		case 'addT':
			var newTest = replyObj.test;
			iLocalT.push(newTest);
            console.log("iLocalT:", iLocalT);
			break;
		case 'getT':
            var localT = (source == "student")? sLocalT : iLocalT;
            var DBT = replyObj.tests;
            localT.length = 0;
            for(var i=0; i<DBT.length; i++) {
                if(uniqItem(DBT[i], localT)) {
                    localT.push(DBT[i]);
                }
            }
            updateDisplays(["sMainSection"]);
			break;
        case 'addA':
            // Do nothing currently
            break;
        case 'getA':
            let DBA = replyObj.attempts;
            sLocalA = DBA;
            updateDisplays(["sMainSection"]);
            break;
	}
}

/* Creates the JSON obj that will encapsulate the request to the server
 * */
function buildPostBody(type, source) {
	var jsonObj;
	switch(type) {
		case 'addQ':
			jsonObj = {
				'type'  : 'addQ',
				'desc'  : addDesc.value,
				'topic' : addTopic.value,
                'cons'  : getCheckedValues("addCons"),
				'diff'  : addRange.value,
				'tests' : getNonEmptyInputs('addTests'),
			}
			break;
		case 'getQ':
			jsonObj = {
				'type'  : 'getQ',   // Build SearchQ req
				'topic' : '',          // Don't filter by topic
				'diffs' : [1,2,3,4,5], // Don't filter by diff
				'keys'  : [],          // Don't filter by keyword
			}
			break;
		case 'addT':
			jsonObj = {
				'type' : 'addT',
				'desc' : testDesc.value,
				'rel'  : getCheckedValue("testRelease"),
				'ques' : iSelectedQ,
                'pts'  : Array.from(document.getElementsByClassName("qPts")).map(i=>i.value),
			}
			break;
		case 'getT':
			jsonObj = {
				'type' : 'getT',                         // Send a GetTests req
				'rels' : (source == 'student')? [1] : [0,1], // Only released tests for student
			}
			break;
        case 'addA':
            jsonObj = {
                'type'    : 'addA',
                'test'    : sSelectedT[0],
                'comment' : finAttemptCmt.value,
                'answers' : getStudentAnswers(),
            }
            break;
        case 'getA':
            jsonObj = {
                'type' : 'getA',
                'ids'  : [],
            }
            break;
	}
	return JSON.stringify(jsonObj);
}

/* Searches through local questions returning matches
 * Topic   : A topic to search by, "" matches all topics
 * Diffs[] : An array of difficulties to filter by
 * Keys[]  : An array of words to search through descriptions by */
function localSearch(topic, diffs, keys) {
    const sameTopic    = q => q.topic === "" || q.topic.toLowerCase().match(topic);
    const sameDiff     = q => diffs.includes(Number(q.diff));
    const containsKeys = q => 
        keys.map(k=>q.desc.toLowerCase().match(new RegExp(k))).reduce((a,b)=>a&&b, true);
	return iLocalQ.filter(sameTopic).filter(sameDiff).filter(containsKeys);
}

/* Called when searchSubmit button is clicked
 * Updates the iMatchedQ array with Q's matching new search criteria
 * Displays the iMatchedQ in the matches section */
function displaySearchResults() {
	var topic = searchTopic.value.toLowerCase();
	var diffs = getCheckedValues("searchDiffs").map(d=>Number(d));
	var keys  = getNonEmptyInputs("searchKeys").map(k=>k.toLowerCase());
	var matches  = localSearch(topic, diffs, keys);
	iMatchedQ.length = 0;
    iMatchedQ = matches.filter(q=>(!iMatchedQ.includes(q))&&(!iSelectedQ.includes(q)));
	iMatchedQ.sort( (a,b) => a.diff - b.diff );
	updateDisplays(["iMainSection"]);
}

/* Checks that all fields are correct in form being submitted */
function validateForm(type) {
	switch(type) {
		case "addQ":
			if(nonEmpty("addDesc") && nonEmpty("addTopic")) {
				var testsArray = getNonEmptyInputs("addTests");
				if(validateTests(testsArray)){
                    fetch(type)
                        .then( (replyText) => { 
                            console.log("Rcvd:", replyText); 
                            handleReply(replyText);
                        })
                        .then(() => alertUser("success", "New question created!"))
                        .then(() => timeout(1000))
                        .then(() => clearForm("addForm"))
                        .then(() => enableButton("addSub"))
                        .catch(() => { 
                            enableButton("addSub");
                            alertUser("error", "Network error, try again later.");
                        });
				} else {
                    enableButton("addSub");
				}
			} else {
				alertUser("error", "Make sure Description and Topic are filled out!");
                enableButton("addSub");
			}
			break;
		case "addT":
			if(nonEmpty("testDesc")) {
                if(validatePts()) {
                    fetch( type )
                    .then( (x) => {
                        console.log("Rcvd:", x);
                        handleReply(x);
                    })
                    .then(() => alertUser("success", "Test submitted!"))
                    .then(() => timeout(1000))
                    .then(() => enableButton("testSub"))
                    .then(() => clearForm("testForm"))
                    .then(() => { iSelectedQ.length = 0; iMatchedQ.length = 0 })
                    .then(() => updateDisplays(["iMainSection", "iMainAside"]))
                    .catch(() => {
                        alertUser("error", "Something went wrong.. test not submitted!")
                        enableButton("testSub");
                    });
                } else {
                    enableButton("testSub");
                }
			}
			else {
				alertUser("error", "Make sure you've named the exam!");
                enableButton("testSub");
			}
			break;
		case "addA":
			alertUser("error", "Adding Answer!");
			break;
		default:
			console.log("Invalid type to validate");
	}
}

/* Toggles whether the clicked on question is in iSelectedQ 
 * listItemId: The id of the List Item that the question appears in */
function toggleSelected(listItemId) {
	var id = listItemId.substring(1);
	if(listItemId[0] == "t") { // add test with id to sSelectedT 
        sSelectedT.push(sLocalT.filter((t) => t.id == id)[0]);
        console.log(sSelectedT);
		updateDisplays(["sMainSection", "sMainAside", "sHeadSection"]);
	}
	else if ( listItemId[0] == "m") { // add Q to iSelectedQ, remove from iMatchedQ
        let clickedQ = iMatchedQ.filter((q) => q.id == id)[0];
        iSelectedQ.push(clickedQ);
        iMatchedQ = removeItemFromArray(clickedQ.id, iMatchedQ);
        updateDisplays(["iMainSection", "iMainAside"]);
	}
	else if ( listItemId[0] == "s") { // add Q to iMatchedQ, remove from iSelectedQ
        let clickedQ = iSelectedQ.filter((q) => q.id == id)[0];
        iMatchedQ.push(clickedQ);
        iSelectedQ = removeItemFromArray(clickedQ.id, iSelectedQ);
        updateDisplays(["iMainSection", "iMainAside"]);
	}
    else if( listItemId[0] == "a" ) { // add attempt with id to sSelectedA
        let clickedA = sLocalA.filter( (a) => a.test.id == id )[0];
        sSelectedA.push(clickedA);
        updateDisplays(["sMainSection"]);
    }
	else {
		console.log("in toggleSelected, "+listItemId[0]+" was not 't', 'm', or 's'");
	}
}

function validatePts() {
    let pts = Array.from(document.getElementsByClassName("qPts"));
    const emptyPt = p => p.value === ""; 
    const nanPt   = p => isNaN(p.value);
    const anyTrue = (a,b) => a||b;
    if( pts.map(emptyPt).reduce(anyTrue) || pts.map(nanPt).reduce(anyTrue) ) {
        alertUser("error", "All points must be filled out with integers!");
        return false;
    }
    return true;
}

function alertUser(type, msg) {
    hideElement("errorDiv");
    hideElement("successDiv");
    let id = (type === "error") ? "errorDiv" : "successDiv";
    document.getElementById(id).innerHTML = msg;
    timeout(100).then(()  => showElement(id));
    timeout(5000).then(() => hideElement(id));
}

/* Makes sure there are at least two non-empty tests
 * Makes sure all tests are in the form of func([a][,b]...)=answer */
function validateTests(tests) {
	if(tests.length < 2) {
        alertUser("error", "You need at least 2 test cases to create a new question!");
        return false;	
    }
	var pattern = /^ *[a-zA-Z][a-zA-Z0-9]*\(( *| *[^ ]+( *, *[^ ]+)* *)\) *= *[^ ]+$/;
    let malTests = tests.map(t=>!t.match(pattern)).map((b,i)=>b?i+1:"NaN").filter(n=>!isNaN(n));
    if(malTests.length !== 0) {
        if(malTests.length === 1)
            alertUser("error", "Test " + malTests + " is not in the form func([a[,b]*])=ans");
        else
            alertUser("error", "Tests " + malTests + " are not in the form func([a[,b]*])=ans");
        return false;
    }
	return true;
}

/* Resets all of the inputs inside of the specified element.
 * Removes additionally added text boxes like those for test cases*/
function clearForm(formId) {
	var inputs    = document.getElementById(formId).getElementsByTagName("INPUT");
    var textAreas = document.getElementById(formId).getElementsByTagName("TEXTAREA");
	var elems     = document.getElementById(formId).getElementsByClassName("modular");
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
            case "checkbox":
                inputs[i].checked = false;
                break;
			case "radio":
				if(inputs[i].value == 0)
					inputs[i].checked = true;
				break;
			default:
				break;
		}
	}
    // Reset all text areas
    for(var i=0; i<textAreas.length; i++) {
        textAreas[i].value = "";
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
	iMatchedQ.length = 0;
    updateDisplays(["iMainSection"]);
}

function clearInnerHTML(displayId) {
    document.getElementById(displayId).innerHTML = "";
}

/* A display has an id of the form: [i|s][Head|Main][Nav|Section|Aside] */
/* and specifies one of the webpage layout areas                        */
function updateDisplays(displayIdArr) {
	for(var i = 0; i<displayIdArr.length; i++)
        updateDisplay(displayIdArr[i]);
} 


function addItemsToDisplay(thisId) {
    var relArr = getRelArr(thisId);
    for(var j=0; j<relArr.length; j++) {
        addItemToDisplay(relArr[j], thisId, j);
    }
}

function updateDisplay(displayId) {
    switch(displayId) {
        case "iHeadSection":
            break;
        case "iMainSection":
            updateIMainSection();
        case "iMainAside":
            updateIMainAside();
            break;
        case "sHeadSection":
            updateSHeadSection();
            break;
        case "sMainSection":
            updateSMainSection();
            break;
        case "sMainAside":
            updateSMainAside();
            break;
        default:
            break;
    }
}

function updateSHeadSection() { 
    if(sSelectedT.length === 1) {
        document.getElementById("sHeadSummary").innerHTML = sSelectedT[0].desc;
    }
}

function updateSMainAside() {
    if(sSelectedT.length === 0) {
        hideElement("finAttemptForm");
    } else {
        showElement("finAttemptForm");
    }
}

function updateSMainSection() {
    if(typeof sSelectedT !== 'undefined') {
        clearInnerHTML("sTestDisp"); // On student/test.html
        addItemsToDisplay("sTestDisp");
    } else {
        clearInnerHTML("sAttemptDisp"); // On student/grades.html
        addItemsToDisplay("sAttemptDisp");
    }
}

function updateIMainAside() {
    if(iSelectedQ.length === 0) {
        hideElement("testForm");
    } else {
        showElement("testForm");
    }
}

function updateIMainSection() {
    clearInnerHTML("iMatchedList");
    clearInnerHTML("iSelectedList");
    addItemsToDisplay("iMatchedList");
    addItemsToDisplay("iSelectedList");
    if(iMatchedQ.length + iSelectedQ.length === 0) {
        showElement("iBuildInfo");
        hideElement("iSelectedInfo");
        hideElement("iMatchedInfo");
    }
    else if(iSelectedQ.length === 0) {
        hideElement("iBuildInfo");
        showElement("iSelectedInfo");
        hideElement("iMatchedInfo");
    }
    else if(iMatchedQ.length === 0) {
        hideElement("iBuildInfo");
        hideElement("iSelectedInfo");
        showElement("iMatchedInfo");
    }
    else {
        hideElement("iBuildInfo");
        hideElement("iSelectedInfo");
        hideElement("iMatchedInfo");
    }
}

/* Addes a toggle-able item to the display */
function addItemToDisplay(newItem, displayId, num) {
    var item;
    switch(displayId) {
        case "iMatchedList":
            item = buildMatchedQuestionItem(newItem, num, "matched");
            break;
        case "iSelectedList":
            item = buildSelectedQuestionItem(newItem, num, "");
            break;
        case "sTestDisp":
            item = (sSelectedT.length === 0)? buildTestSummaryItem(newItem, num) :
                                            buildQuestionItem(newItem, num);
            break;
        case "sAttemptDisp":
            item = (sSelectedA.length === 0)? buildAttemptSummaryItem(newItem, num) :
                                            buildAttemptItem(newItem, num);
            break;
        default:
            item = document.createTextNode(displayId + " not handled by addItemToDisplay!");
    }
	document.getElementById(displayId).appendChild(item);
}

function buildGeneralQuestion(newItem, num, type) {
    // Gather the information that will go on the Question
    let thisDiff;
    let thisTopic;
    let thisGrd;
    let thisMax;
    let thisCons;
    let thisDesc;
    let thisNum;
    let thisBtn;
    let thisAns;
    let thisRemark;
    let thisFeed;

    // Build the elements that will make up the Question
    let qItem   = createElement("DIV");
    let qDiv    = createElement("DIV");
    let qInfo   = createElement("DIV");
    let qDiff   = createElement("SPAN");
    let qTopic  = createElement("SPAN");
    let qPts    = createElement("DIV");
    let qGrd    = createElement("SPAN");
    let qMax    = createElement("SPAN");     // Has to be created dynamically
    let qCons   = createElement("DIV");
    let qFor    = createElement("SPAN");     // Has to be shown dynamically
    let qWhile  = createElement("SPAN");     // Has to be shown dynamically
    let qPrint  = createElement("SPAN");     // Has to be shown dynamically
    let qDesc   = createElement("DIV");
    let qNum    = createElement("DIV");      // Shown Dynamically
    let qAns    = createElement("TEXTAREA");
    let qList   = createElement("UL");
    let qLine   = createElement("LI");
    let qRemark = createElement("DIV");
    let qFeed   = createElement("DIV");      // Has to be added dynamically (must be var too)
    let qSub    = createElement("DIV");      // Has to be added dynamically (must be var too)
    let qAlt    = createElement("INPUT");    // Has to be added dynamically (must be var too)

    // qItem─┬→ qDiv─┬→ qInfo─┬→ qDiff
    //       │       │        ├→ qTopic
    //       │       │        └→ qPts
    //       │       ├→ qCons─┬→ qFor
    //       │       │        ├→ qWhile
    //       │       │        └→ qPrint
    //       │       ├→ qDesc─→ qNum
    //       │       └→ qAns
    //       └→ qList──→ qItem─┬→ qRemark
    //                         ├→ qFeed*
    //                         ├→ qSub*
    //                         └→ qAlt*
    qItem.appendChild(qDiv);
    qItem.appendChild(qList);
    qDiv.appendChild(qInfo);
    qDiv.appendChild(qCons);
    qDiv.appendChild(qDesc);
    qDiv.appendChild(qAns);
    
    

}

function buildAttemptItem(newItem, num) {
    var thisNum        = num + 1;
    var thisAns        = newItem.answer;
    var thisDesc       = newItem.desc;
    var thisFeed       = newItem.feedback; // an array of auto-generated feedback strings
    var thisGrade      = newItem.grade;
    var thisPts        = newItem.max;
    var thisRemark     = newItem.remark;
    var gradeSpanClass = (thisGrade <= (thisPts/2))   ? "lowGradeSpan" :
                         (thisGrade <= (3*thisPts/4)) ? "midGradeSpan" : "highGradeSpan";
                     

    var item      = document.createElement("LI");  // Build the elements
    var aDiv      = document.createElement("DIV");
    var qDiv      = document.createElement("DIV"); // that will go into
    var qTop      = document.createElement("DIV"); // this question
    var qTopLeft  = document.createElement("DIV");
    var qTopMid   = document.createElement("DIV");
    var qTopRight = document.createElement("DIV");
    var qBot      = document.createElement("DIV");
    var aAns      = document.createElement("DIV");
    var aUnder    = document.createElement("DIV");
    var aRemark   = document.createElement("DIV");
    var qNum      = document.createTextNode(thisNum + ".)");
    var qDesc     = document.createTextNode(thisDesc);
    var qPtsSpan  = document.createElement("SPAN");
    var qGrdSpan  = document.createElement("SPAN");
    var qPoints   = document.createTextNode(" / " + thisPts + " Pts");

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
    qPtsSpan.appendChild(qGrdSpan);
    qPtsSpan.appendChild(qPoints);
    qPtsSpan.setAttribute("class", "ptsSpan");
    qGrdSpan.setAttribute("class", gradeSpanClass);
    qGrdSpan.appendChild(document.createTextNode(thisGrade));
    qTopRight.setAttribute("class", "qTopRight");
    qTopRight.appendChild(qPtsSpan);
         qBot.setAttribute("class", "qBot");
         qBot.appendChild(aAns);

         aAns.appendChild(document.createTextNode(thisAns));
         aAns.setAttribute("class", "aAns");
         aAns.setAttribute("contenteditable", "false");
         aDiv.appendChild(qDiv);
         aDiv.appendChild(aUnder);
    if(thisRemark !== "") {
      aRemark.appendChild(document.createTextNode(thisRemark));
      aRemark.setAttribute("class", "remark");
       aUnder.appendChild(aRemark);
    }
    for(let i=0; i<thisFeed.length; i++) {
        let thisType = thisFeed[i][0];
        let thisMsg  = thisFeed[i].substring(1);
        let thisClass = (thisType === "g")? "feedback feedback-good" : 
                        (thisType === "b")? "feedback feedback-bad" :
                                            "feedback";
        let newFeedDiv = document.createElement("DIV");
        newFeedDiv.setAttribute("class", thisClass);
        newFeedDiv.appendChild(document.createTextNode(thisMsg));
        aUnder.appendChild(newFeedDiv);
    }

         item.appendChild(aDiv);

    return item;
}

function buildAttemptSummaryItem(newItem, num) {
    // Gather the information from newItem that will be displayed to user
    console.log(newItem);
    let testName   = newItem.test.desc;
    let maxPts     = newItem.test.pts.map(a => Number(a)).reduce((a,b) => a + b, 0);
    let graded     = typeof newItem.grades !== 'undefined';
    if(graded)
        var grade  = newItem.grades.map(a => Number(a)).reduce((a,b) => a + b, 0);
    else
        var grade  = '?';
    let reviewed   = newItem.remarks.filter((str) => str !== "").length !== 0;
    let statusText = (!graded)? "Not Graded" : (reviewed)? "Reviewed by Instructor" : "Auto-Graded";
    let itemId     = "a"+newItem.test.id;
    let itemClass  = "attempt";
    
    // Construct the elements that the information will be displayed in
    let item  = document.createElement("LI");
    let aDiv  = document.createElement("DIV");
    let aTop  = document.createElement("DIV");
    let aBot  = document.createElement("DIV");
    let aDesc = document.createTextNode(testName);
    let aPts  = document.createTextNode("Grade: " + grade + " / " + maxPts);
    let aStat = document.createTextNode("Status: " + statusText);

    // Define the attributes, eventListeners, children of the elements
    aDiv.setAttribute ("class", "aDiv" );
    aTop.setAttribute ("class", "aTop" );
    aBot.setAttribute ("class", "aBot" );
    aDiv.appendChild(aTop);
    aDiv.appendChild(aBot);
    aTop.appendChild(aDesc);
    aBot.appendChild(aPts);
    aBot.appendChild(document.createElement("BR"));
    aBot.appendChild(aStat);
    
    // Return the item
    item.setAttribute ("id", itemId);
    item.setAttribute ("class", "available");
    item.appendChild(aDiv);
    item.addEventListener("click", () => toggleSelected(itemId));
    return item;
}

function buildMatchedQuestionItem(newItem, num) {
    var thisDesc  = newItem.desc;
    var thisDiff  = convertDiffFormat(newItem.diff);
    var thisTopic = newItem.topic;
    var thisId    = "m" + newItem.id;
    var thisClass = "matched";

    var item   = document.createElement("LI");
    var mTop   = document.createElement("DIV");
    var mBot   = document.createElement("DIV");
    var mDesc  = document.createTextNode(thisDesc);
    var mDiff  = document.createTextNode("Difficulty: " + thisDiff);
    var mTopic = document.createTextNode("Topic: " + thisTopic);

    item.setAttribute("id", thisId);
    item.setAttribute("class", thisClass);
    item.addEventListener("click", function() { toggleSelected( thisId ) });
    item.appendChild(mTop);
    item.appendChild(mBot);
    mTop.setAttribute("class", "mTop");
    mTop.appendChild(mDesc);
    mBot.setAttribute("class", "mBot");
    mBot.appendChild(mDiff);
    mBot.appendChild(document.createElement("BR"));
    mBot.appendChild(mTopic);
    return item;
}

function buildSelectedQuestionItem(newItem, num) {
    var thisDesc  = newItem.desc;                   // Variables specific
    var thisNum   = newItem.num;                    // to this quetion
    // var thisNum   = num + 1;                     // to this quetion
    var thisId    = "s" + newItem.id;
    var thisDiff  = convertDiffFormat(newItem.diff);
    var thisTopic = newItem.topic;

    var item      = document.createElement("LI");  // Build the elements
    var qDiv      = document.createElement("DIV"); // that will go into
    var qTop      = document.createElement("DIV"); // this question
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
    var qDiff     = document.createTextNode("Difficulty: " + thisDiff);
    var qTopic    = document.createTextNode("Topic: " + thisTopic);

         qDiv.setAttribute("class", "qDiv active"); // Set attributes of
         qDiv.setAttribute("id", thisId);           // and append children to
         qDiv.appendChild(qTop);                    // the elements
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
         qBtn.addEventListener("click", () => { toggleSelected(thisId); });
         qBtn.appendChild(qBtnText);
    qPtsInput.setAttribute("class", "qPts");
    qPtsInput.setAttribute("maxlength", "3");
    qPtsInput.setAttribute("size", "1");
    qPtsInput.setAttribute("tabindex", thisNum);
         qBot.setAttribute("class", "mBot");
         qBot.appendChild(qDiff);
         qBot.appendChild(document.createElement("BR"));
         qBot.appendChild(qTopic);
         item.appendChild(qDiv);

    return item;
}

function buildTestSummaryItem(newItem, num) {
    var thisDesc  = newItem.desc;        // Get the variables
    var thisQues  = newItem.ques;        // specific to this test
    var thisNum   = newItem.ques.length; // Figure out the number of questions
    var itemId = "t"+newItem.id;
    var itemClass = "available";
    var uniqTops  = [];                     // Figure out the topics of these questions
    var uniqDiffs = [];                     // Figure out the difficulties of these questions
    var lowerCaseTops = [];
    for(var i=0; i<thisNum; i++) {
        var thisQ    = thisQues[i];
        var thisTop  = thisQ.topic;
        var thisDiff = thisQ.diff;
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
    item.setAttribute("id",    itemId);
    item.setAttribute("class", itemClass);
    item.setAttribute("tabindex", num+1);
    item.addEventListener("click", () => { toggleSelected(itemId)  });
    item.addEventListener("keyup", (e) => { if(e.keyCode==13) toggleSelected(itemId)});
    item.appendChild(tTop);
    item.appendChild(tBot);
    return item;
}

function buildQuestionItem(newItem, num) {
    thisDesc = newItem.desc;      // Variables specific
    thisNum  = num + 1;              // to this quetion
    thisMax  = newItem.max; //
    // thisMax  = sSelectedT[0].pts[num]; //

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
    var qPoints   = document.createTextNode(thisMax + " Pts");
    
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

/* Add another input text box to the top of the specified element.
 * Works for elements that contain a label, a button, and then a list of inputs 
 * elemId: The id of the element you want to add the input box to */
function addInput(elemId) {
	var elem      = document.getElementById(elemId);
	var textInput = document.createElement("INPUT");
	var breakElem = document.createElement("BR");
    textInput.setAttribute("type", "text");
	elem.insertBefore(breakElem, elem.childNodes[3]);
	elem.insertBefore(textInput, elem.childNodes[3]);
    if(elemId === "addTests") {
        textInput.placeholder = getRandomTestPattern();
        textInput.setAttribute("class", "testcases");
    }
}

function getRandomTestPattern() {
    if(p.length === 0) {
        q = p;
        p = (p === p1) ? p2 : p1;
    }
    let randIndex = Math.floor(Math.random() * p.length);
    let newPat = p.splice(randIndex, 1);
    q.push(newPat);
    return newPat;
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
	btnElem.appendChild(btnText);           // Put "+" on button
	btnElem.setAttribute("type", "button"); // Make it a button (soas to not reload page)
	btnElem.setAttribute("onclick", func);  // Make button add new inputs
	modalElem.innerHTML = "";               // Clear all inputs
	modalElem.appendChild(textLabel);       // Add label
	modalElem.appendChild(btnElem);         // Add button
	modalElem.appendChild(brkElem);
	addInput(elemId);
	if(elemId === "addTests")
		addInput(elemId);
}

function insertTab(e) {
    if (e.keyCode === 9) {
        document.execCommand('insertHTML', false, '    ');
        e.preventDefault();
    }
}

// Just for testing promises
function timeout(delay) {
    return new Promise((resolve,reject) => {
        setTimeout(resolve, delay);
    });
}

/* Returns all non-empty input values in an array 
 * Takes the Id of a div element */
function getNonEmptyInputs(divId) {
	var elems = Array.from(document.getElementById(divId).children);
    return elems.filter(i=>i.tagName==="INPUT"&&i.value!=="").map(i=>i.value);
}

/* Returns the value of the first checked input element contained by the given element 
 * This assumes radio input types inside a div of their own */
function getCheckedValue(divId) {
	var elems = document.getElementById(divId).getElementsByTagName("INPUT");
    for(var i=0; i<elems.length; i++) {
        if(elems[i].checked)
            return elems[i].value;
    }
}

/* Returns an array of the checked input values inside of given element 
 * This assumes checkbox input types inside a div of their own */
function getCheckedValues(divId) {
	let elems   = Array.from(document.getElementById(divId).getElementsByTagName("INPUT"));
    let checked = elems.filter(e=>e.checked).map(e=>e.value);
	if(checked.length === 0)
		checked = [1,2,3,4,5];
	return checked;
}

/* Removes question with qId from the array qArr */
function removeItemFromArray(id, A) {
	for(var i=0; i<A.length; i++){
		if(A[i].id === id) {
			A.splice(i, 1);
			break;
		}
	}
	return A;
}

/* Determines which array (iSelectedQ or iMatchedQ) is associated with a display */
function getRelArr(displayId) {
	var relArr;
    switch(displayId) {
        case "iMatchedList":
            // relArr = iMatchedQ;
            relArr = buildQuestionList(iMatchedQ, "matched");
            console.log(relArr);
            break;
        case "iSelectedList":
            // relArr = iSelectedQ;
            relArr = buildQuestionList(iSelectedQ, "selected");
            console.log(relArr);
            break;
        case "sTestDisp":
            // relArr = (sSelectedT.length === 1)? sSelectedT[0].ques :
            //          sLocalT.filter(t=>Number(t.rel)===1&&Number(t.sub)===0);
            relArr = (sSelectedT.length === 1)? buildQuestionList(sSelectedT[0].ques, "active") :
                     sLocalT.filter(t=>Number(t.rel)===1&&Number(t.sub)===0);
            console.log(relArr);
            break;
        case "sAttemptDisp":
            relArr = (sSelectedA.length === 1)? buildQuestionList(sSelectedA[0], "attempt") :
                                                sLocalA;
            console.log(relArr);
            break;
        default:
            relArr = [{'desc':"No",'topic':"relArr",'id':"for",'diff':"this",'tests':["display"] }];
            break;
	}
	return relArr;
}

// this returns an array of objects that can be turned into display items
function buildQuestionList(obj, type) {
    let list = [];
    let limit = (type == "attempt")? obj.answers.length : obj.length;
    for(let i=0; i<limit; i++) {
        let thisObj    = {
            'num'      : i+1,
            'id'       : (type == "attempt") ? obj.test.id            : obj[i].id,
            'diff'     : (type == "attempt") ? obj.test.ques[i].diff  : obj[i].diff,
            'topic'    : (type == "attempt") ? obj.test.ques[i].topic : obj[i].topic,
            'desc'     : (type == "attempt") ? obj.test.ques[i].desc  : obj[i].desc,
            'cons'     : (type == "attempt") ? obj.test.ques[i].cons  : obj[i].cons,
            'max'      : (type == "attempt") ? obj.test.pts[i]        :
                         (type == "active")  ? sSelectedT[0].pts[i]   : null,
            'grade'    : (type == "attempt") ? obj.grades[i]          : null,
            'answer'   : (type == "attempt") ? obj.answers[i]         : null,
            'remark'   : (type == "attempt") ? obj.remarks[i]         : null,
            'feedback' : (type == "attempt") ? obj.feedback[i]        : null,
        }
        list.push(thisObj);
    }
    return list;
}

function getStudentAnswers() {
    let inputs = Array.from(document.getElementsByClassName("qAns"));
    return inputs.map( i=>i.value );
}

/* Checks the given item's Id against all Ids in localQ
 * Returns true if given item's Id is not found */
function uniqItem(item, itemArr){
	var uniq = true;
	var thisId = item.id;
	for(var i=0; i<itemArr.length; i++){
		if( itemArr[i].id === thisId ) {
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

function hideElement(elemId) {
    document.getElementById(elemId).style.display = "none";
}

function showElement(elemId) {
    document.getElementById(elemId).style.display = "block";
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
