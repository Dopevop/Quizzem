/* A pool of testcase example placeholder to pull from */
let p1 = [
    "func()=ans",
    "myMethod( )=myAnswer",
    "add(1,4)=5",
    "sub( 5, 3)=2",
    "divide( 4, 2, 1)=2",
    "  f( a, b ) = ans",
    "print( \"hi\" )=hi",
    "mult( 45 , 3 )=135",
    "plus(1,2,3,4,5)=15",
    "concat( 'boo' , 'yah' )=booyah",
    "greet( \"Bob\" , \"Hi\" )=Hi,Bob",
    "mysteryFunc()=b",
    "echo('gross')=gross",
    "hijk(5)=lmnop",
    "hijk(3)=lmn",
    "abcd(5)=efghi",
    "zyx(5)=wvuts",
    "next(\"h\", 5)=ijklm",
    "next(\"q\", 3)=rst",
];
let p2 = [];
let p  = p1;
let q  = p2;
/* Disables a button */
function disableButton(btnId) {
    return new Promise((resolve) => {
        document.getElementById(btnId).disabled = true;
        resolve();
    });
}
/* Enables a button */
function enableButton(btnId) {
    document.getElementById(btnId).disabled = false;
}
/* Sends the requests to the server */
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
/* Handles the reply from the server */
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
            updateDisplays(["iMainSection"]);
			break;
		case 'addT':
			var newTest = replyObj.test;
			iLocalT.push(newTest);
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
            if(typeof sLocalA !== 'undefined') {
                sLocalA = DBA;
                updateDisplays(["sMainSection"]);
            }
            else {
                iLocalA = DBA;
                updateDisplays(["iMainSection"]);
            }
            break;
	}
}
/* Creates the JSON obj that will encapsulate the request to the server */
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
				'type'  : 'getQ',      // Build SearchQ req
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
                'pts'  : Array.from(document.getElementsByClassName("qInput")).map(i=>i.value),
			}
			break;
		case 'getT':
			jsonObj = {
				'type' : 'getT',                             // Send a GetTests req
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
        case 'modA':
            jsonObj = extractModifications();
            break;
	}
	return JSON.stringify(jsonObj);
}
/* Builds an object that contains any changes made to an array */
function extractModifications() {
    let remarkInputs = Array.from(document.getElementsByClassName("qTextBox"));
    let subInputs    = Array.from(document.getElementsByClassName("qSub"));
    let altInputs    = Array.from(document.getElementsByClassName("qAlt"));
    let feedElems    = Array.from(document.getElementsByClassName("qFeed"));
    let thisA        = iSelectedA[0];
    let thisT        = thisA.test;
    let thisTId      = thisT.id;
    let thisRel      = thisA.rel;
    let theseQ       = thisT.ques;
    let theseR       = thisA.remarks;
    let theseF       = thisA.feedback;
    let theseG       = thisA.grades;
    let newRelease   = getCheckedValue("modARel");      
    let newRemarks   = []; 
    let newFeedback  = [];
    let newGrades    = [];
    let feedSeen = 0;
    for(let i=0; i<theseQ.length; i++) {
        let changedFeed = false;
        let thisQId = theseQ[i].id;
        let newR = {
            "tId"  : thisTId,
            "qId"  : thisQId,
            "newR" : remarkInputs[i].value,
        }
        if(newR.newR !== "") newRemarks.push(newR);
        let curGrade = Number(thisA.grades[i]);
        for(let j=0; j<thisA.feedback[i].length; j++) {
            if(isHidden(altInputs[feedSeen])) {
                feedSeen += 1;
                continue;
            }
            else if(altInputs[feedSeen].value === "") {
                feedSeen += 1;
                continue;
            }
            else {
                changedFeed = true;
                let type = (feedElems[feedSeen].classList.contains("qFeed-bad"))? "b" : "g";
                let msg  = feedElems[feedSeen].childNodes[0].nodeValue;
                let newSub = Number(altInputs[feedSeen].value);
                let newFeed = type+newSub+"p"+msg;
                let oldSub = Number(subInputs[feedSeen].innerHTML);
                curGrade = curGrade - (oldSub - newSub);
                console.log("curGrade", curGrade);
                let newF = {
                    "tId"    : thisTId,
                    "qId"    : thisQId,
                    "newF"   : newFeed,
                    "index"  : j,
                    "qIndex" : i,
                };
                newFeedback.push(newF);
                feedSeen += 1;
            }
        }
        if(changedFeed) {
            let newG = {
                "tId"    : thisTId,
                "qId"    : thisQId,
                "newG"   : curGrade,
                "qIndex" : i,
            }
            newGrades.push(newG);
        }
    }
    return {
        "type"     : "modA",
        "rel"      : newRelease,
        "tId"      : thisTId,
        "remarks"  : newRemarks,
        "feedback" : newFeedback,
        "grades"   : newGrades,
    }
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
	if(diffs.length === 0)
		diffs = [1,2,3,4,5];
	var keys  = getNonEmptyInputs("searchKeys").map(k=>k.toLowerCase());
	var matches  = localSearch(topic, diffs, keys);
	iMatchedQ.length = 0;
    iMatchedQ = matches.filter(q=>(!iMatchedQ.includes(q))&&(!iSelectedQ.includes(q)));
	iMatchedQ.sort( (a,b) => a.diff - b.diff );
	updateDisplays(["iMainSection"]);
}
/* Checks that all fields are correct in form being submitted */
function validateForm(type, alerts) {
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
                if(validatePts(true)) {
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
        case "modA":
            let remarkInputs = Array.from(document.getElementsByClassName("qTextBox"));
            let subInputs    = Array.from(document.getElementsByClassName("qSub"));
            let altInputs    = Array.from(document.getElementsByClassName("qAlt"));
            let feedElems    = Array.from(document.getElementsByClassName("qFeed"));
            let changedR = remarkInputs.map(r=>(r.value!=="")?true:false).reduce((a,b)=>a||b,false);
            let changedF = altInputs.map(f=>(f.value!=="")?true:false).reduce((a,b)=>a||b,false);
            if(changedF) {
                // Make sure any new alt values are integers
                let nonEmptyF = altInputs.filter(f=>f.value!=="");
                let nonEmptyV = nonEmptyF.map(f=>f.value);
                let areVNums  = nonEmptyV.map(v=>Number.isInteger(Number(v)));
                let allInts   = areVNums.reduce((a,b)=>a&&b);
                if(allInts) {
                    return true;
                } else {
                    if(alerts)
                        alertUser("error", "All new feedback points must be integers!");
                    return false;
                }
            }
            let changedRel = (Number(getCheckedValue("modARel")) !== iSelectedA[0].rel)? true :
                                                                                         false;
            if(changedR || changedF || changedRel) {
                return true;
            } else {
                if(alerts)
                    alertUser("error", "No changes to submit!");
                return false;
            }
            break;
		default:
			console.log("Invalid type to validate");
	}
}
/* Determines if an element is hidden */
function isHidden(el) {
    return (el.offsetParent === null)
}
/* Toggles whether the clicked on question is in iSelectedQ 
 * listItemId: The id of the List Item that the question appears in */
function toggleSelected(listItemId) {
	var id = listItemId.substring(1);
	if(listItemId[0] == "t") { // add test with id to sSelectedT 
        sSelectedT.push(sLocalT.filter(t => t.id == id)[0]);
		updateDisplays(["sMainSection", "sMainAside", "sHeadSection"]);
	}
	else if ( listItemId[0] == "m") { // add Q to iSelectedQ, remove from iMatchedQ
        let clickedQ = iMatchedQ.filter(q => q.id == id)[0];
        iSelectedQ.push(clickedQ);
        iMatchedQ = removeItemFromArray(clickedQ.id, iMatchedQ);
        updateDisplays(["iMainSection", "iMainAside"]);
	}
	else if ( listItemId[0] == "s") { // add Q to iMatchedQ, remove from iSelectedQ
        let clickedQ = iSelectedQ.filter(q => q.id == id)[0];
        iMatchedQ.push(clickedQ);
        iSelectedQ = removeItemFromArray(clickedQ.id, iSelectedQ);
        updateDisplays(["iMainSection", "iMainAside"]);
	}
    else if( listItemId[0] == "a" ) { // add attempt with id to sSelectedA
        if(typeof sLocalA !== 'undefined') {
            let clickedA = sLocalA.filter(a => a.test.id == id)[0];
            sSelectedA.push(clickedA);
            updateDisplays(["sMainSection", "sMainAside", "sHeadSection"]);
        }
        else {
            let clickedA = iLocalA.filter(a => a.test.id == id)[0];
            iSelectedA.push(clickedA);
            updateDisplays(["iMainSection", "iHeadSection", "iMainAside"]);
        }
    }
	else {
		console.log("in toggleSelected, "+listItemId[0]+" was not 't', 'm', or 's'");
	}
}
/* Takes a boolean, alerts. If true, alertUser() will be called */
function validatePts(alerts) {
    let pts = Array.from(document.getElementsByClassName("qInput"));
    const emptyPt = p => p.value === ""; 
    const nanPt   = p => isNaN(p.value);
    const anyTrue = (a,b) => a||b;
    if( pts.map(emptyPt).reduce(anyTrue) ) {
        if(alerts)
            alertUser("error", "All points must be filled out!");
        return false;
    } 
    else if( pts.map(nanPt).reduce(anyTrue) ) {
        if(alerts)
            alertUser("error", "All points must be integers!");
        return false;
    }
    return true;
}
/* Displays a non-intrusive message to the user */
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
/* Empties the matched question array */
function clearMatches() {
	iMatchedQ.length = 0;
    updateDisplays(["iMainSection"]);
}
/* Deletes the innerHTML of the given element */
function clearInnerHTML(displayId) {
    document.getElementById(displayId).innerHTML = "";
}
/* A display has an id of the form: [i|s][Head|Main][Nav|Section|Aside] */
/* and specifies one of the webpage layout areas                        */
function updateDisplays(displayIdArr) {
	for(var i = 0; i<displayIdArr.length; i++)
        updateDisplay(displayIdArr[i]);
} 
/* Adds an array of items to a display */
function addItemsToDisplay(thisId) {
    var relArr = getRelArr(thisId);
    for(var j=0; j<relArr.length; j++) {
        addItemToDisplay(relArr[j], thisId, j);
    }
}
/* Determines which array of elements should be used to populate a display area*/
function getRelArr(displayId) {
	var relArr;
    switch(displayId) {
        case "iMatchedList":
            relArr = buildQuestionList(iMatchedQ, "matched");
            break;
        case "iSelectedList":
            relArr = buildQuestionList(iSelectedQ, "selected");
            break;
        case "sTestList":
            relArr = (sSelectedT.length === 1)?
                buildQuestionList(sSelectedT[0].ques, "active") :
                sLocalT.filter(t=>Number(t.rel)===1&&Number(t.sub)===0);
            break;
        case "sAttemptList":
            relArr = (sSelectedA.length === 1)? 
                buildQuestionList(sSelectedA[0], "review") :
                sLocalA.filter(a=>Number(a.rel)===1);
            break;
        case "iAttemptList":
            relArr = (iSelectedA.length === 1)? buildQuestionList(iSelectedA[0], "review") :
                                                iLocalA;
            break;
        default:
            relArr = [{'desc':"No",'topic':"relArr",'id':"for",'diff':"this",'tests':["display"] }];
            break;
	}
	return relArr;
}
/* Returns an array of objects that can be turned into display items */
function buildQuestionList(obj, type) {
    let list = [];
    let limit = (type == "review")? obj.answers.length : obj.length;
    for(let i=0; i<limit; i++) {
        let thisObj    = {
            'num'      : i+1,
            'id'       : (type == "review") ? obj.test.id            : obj[i].id,
            'diff'     : (type == "review") ? obj.test.ques[i].diff  : obj[i].diff,
            'topic'    : (type == "review") ? obj.test.ques[i].topic : obj[i].topic,
            'desc'     : (type == "review") ? obj.test.ques[i].desc  : obj[i].desc,
            'cons'     : (type == "review") ? obj.test.ques[i].cons  : obj[i].cons,
            'max'      : (type == "review") ? obj.test.pts[i]        :
                         (type == "active") ? sSelectedT[0].pts[i]   : "",
            'grade'    : (type == "review") ? obj.grades[i]          : "",
            'answer'   : (type == "review") ? obj.answers[i]         : "",
            'remark'   : (type == "review") ? obj.remarks[i]         : "",
            'feedback' : (type == "review") ? obj.feedback[i]        : [],
        }
        if(thisObj.cons == null) thisObj.cons = [];
        list.push(thisObj);
    }
    return list;
}
/* Update's the given area */
function updateDisplay(displayId) {
    switch(displayId) {
        case "iHeadSection":
            updateIHeadSection();
            break;
        case "iMainSection":
            updateIMainSection();
            break;
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
/* Updates instructor's <header><section></section></header> */
function updateIHeadSection() {
    if(iSelectedA.length === 1) {
        document.getElementById("iHeadSummary").innerHTML = iSelectedA[0].test.desc;
    }
}
/* Updates student's <header><section></section></header> */
function updateSHeadSection() { 
    if(typeof sSelectedT !== 'undefined') {
        if(sSelectedT.length === 1) 
            document.getElementById("sHeadSummary").innerHTML = sSelectedT[0].desc;
    }
    else {
        if(sSelectedA.length === 1)
            document.getElementById("sHeadSummary").innerHTML = sSelectedA[0].test.desc;
    }
}
/* Updates student's <main><aside></aside></main> */
function updateSMainAside() {
    if(typeof sSelectedT !== 'undefined') {
        // sSelctedT exists, user is on student/tests.html
        if(sSelectedT.length === 1)
            showElement("finAttemptForm");
    } else {
        // sSelctedT doesn't exists, user is on student/grades.html
        if(sSelectedA.length === 0) {
            hideElement("testSummary");
        }
        else {
            updateTestSummary();
            showElement("testSummary");
        }
    }
}
/* Updates student's <main><section></section></main> */
function updateSMainSection() {
    if(typeof sSelectedT !== 'undefined') {
        // sSelectedT exists, user is on student/tests.html
        clearInnerHTML("sTestList"); 
        addItemsToDisplay("sTestList");
        if(sLocalT.length === 0) {
            document.getElementById("sNoTestsInfo").style.display = "block";
        } else {
            document.getElementById("sNoTestsInfo").style.display = "none";
        }
    } else {
        // sSelectedT does not exist, user is on student/grades.html
        if(sLocalA.length === 0) {
            document.getElementById("sNoGradesInfo").style.display = "block";
        } else {
            document.getElementById("sNoGradesInfo").style.display = "none";
        }
        clearInnerHTML("sAttemptList"); 
        addItemsToDisplay("sAttemptList");
    }
}
/* Updates instructor's <main><aside></aside></main> */
function updateIMainAside() {
    if(typeof iLocalQ !== 'undefined') {
        // iLocalQ exists, user is on instructor/build.html
        if(iSelectedQ.length === 0) hideElement("testForm");
        else                        showElement("testForm");
    }
    else {
        // iLocalQ doesn't exist, user is on instructor/review.html
        if(iSelectedA.length === 0) { 
            hideElement("modAForm"); 
        }
        else {
            updateModADisplay();
            updateModPreview();
            showElement("modAForm"); 
        }
    }
}
/* Updates instructor's <main><section></section></main> */
function updateIMainSection() {
    if(typeof iLocalA !== 'undefined') {
        // iLocalA exists, user is on instructor/review.html
        clearInnerHTML("iAttemptList"); 
        addItemsToDisplay("iAttemptList");
        if(iLocalA.length === 0) {
           document.getElementById("iNoTestsInfo").style.display = "block";
        } else {
           document.getElementById("iNoTestsInfo").style.display = "none";
        }
    }
    else {
        // iLocalA doesn't exist, user is on instructor/build.html
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
}
/* Adds a toggle-able item to the display, or just a regular question item */
function addItemToDisplay(newItem, displayId, num) {
    var item;
    switch(displayId) {
        case "iMatchedList":
            item = buildGeneralQuestionItem(newItem, "matched");
            break;
        case "iSelectedList":
            item = buildGeneralQuestionItem(newItem, "selected");
            break;
        case "sTestList":
            item = (sSelectedT.length === 0)? buildTestSummaryItem(newItem, num) :
                                              buildGeneralQuestionItem(newItem, "active");
            break;
        case "sAttemptList":
            item = (sSelectedA.length === 0)? buildAttemptSummaryItem(newItem, num) :
                                              buildGeneralQuestionItem(newItem, "sReview");
            break;
        case "iAttemptList":
            item = (iSelectedA.length === 0)? buildAttemptSummaryItem(newItem, num) :
                                              buildGeneralQuestionItem(newItem, "iReview");
            break;
        default:
            item = document.createTextNode(displayId + " not handled by addItemToDisplay!");
    }
	document.getElementById(displayId).appendChild(item);
}
/* Constructs all instances of a question appropriately for where it appears */
function buildGeneralQuestionItem(newItem, type) {
    let thisId;
    let thisBtnClass;
    let thisDivClass = "qDiv";
    if(type=="matched") {
        thisId       = "m"+newItem.id;
        thisBtn      = document.createTextNode("+");
        thisBtnClass = "qBtn qBtn-add";
        thisDivClass = "qDiv qDiv-match";
    } else if(type=="selected") {
        thisId       = "s"+newItem.id;
        thisBtn      = document.createTextNode("X");
        thisBtnClass = "qBtn qBtn-remove";
    } else {
        thisId       = "?"+newItem.id;
        thisBtn      = document.createTextNode("?");
        thisBtnClass = "qBtn";
    }
    let thisRemark = (type === "iReview")? document.createElement("TEXTAREA") :
                                           document.createTextNode(newItem.remark);
    let thisDiff     = document.createTextNode(convertDiffFormat(newItem.diff));
    let thisTopic    = document.createTextNode(newItem.topic);
    let thisGrade    = document.createTextNode(newItem.grade+" /");
    let thisMax      = document.createTextNode(newItem.max);
    let thisPtsStr   = document.createTextNode("Pts");
    let thisFor      = document.createTextNode("For Loop");
    let thisWhile    = document.createTextNode("While Loop");
    let thisPrint    = document.createTextNode("Print Statement");
    let thisDesc     = document.createTextNode(newItem.desc);
    let thisNum      = document.createTextNode(newItem.num+".)");
    let thisAns      = document.createTextNode(newItem.answer);
    let thisConStr   = document.createTextNode("Must use: ");
    let thisCons     = newItem.cons;
    let thisFeed     = newItem.feedback;
    let thisSumMsg   = document.createTextNode("Total Points: ");
    let thisSumGrade = document.createTextNode(newItem.grade+" /");
    let thisSumMax   = document.createTextNode(newItem.max);
    let thisSumPts   = document.createTextNode("Pts");
    let qItem        = document.createElement("DIV");
    let qDiv         = document.createElement("DIV");
    let qInfo        = document.createElement("DIV");
    let qDiff        = document.createElement("DIV");
    let qTopic       = document.createElement("DIV");
    let qPts         = document.createElement("DIV");
    let qGrade       = document.createElement("SPAN");
    let qMax         = document.createElement("SPAN");
    let qPtsStr      = document.createElement("SPAN");
    let qInput       = document.createElement("INPUT");
    let qCons        = document.createElement("DIV");
    let qFor         = document.createElement("DIV");
    let qWhile       = document.createElement("DIV");
    let qPrint       = document.createElement("DIV");
    let qDesc        = document.createElement("DIV");
    let qNum         = document.createElement("DIV");
    let qAns         = (type=="iReview"||type=="sReview")? document.createElement("DIV"):
                                                         document.createElement("TEXTAREA");
    let qList        = document.createElement("DIV");
    let qLine        = document.createElement("DIV");
    let qRight       = document.createElement("DIV");
    let qRemark      = document.createElement("DIV");
    let qBtn         = document.createElement("BUTTON");
      qItem.appendChild(qDiv);
      qItem.appendChild(qList);
      qItem.setAttribute("class", "qItem");
       qDiv.appendChild(qInfo);
       qDiv.appendChild(qCons);
       qDiv.appendChild(qDesc);
       qDiv.appendChild(qBtn);
       qDiv.appendChild(qAns);
       qDiv.setAttribute("class", thisDivClass);
      qInfo.appendChild(qDiff);
      qInfo.appendChild(qTopic);
      qInfo.appendChild(qPts);
      qInfo.setAttribute("class", "qInfo");
      qDiff.appendChild(thisDiff);
      qDiff.setAttribute("class", "qDiff");
     qTopic.appendChild(thisTopic);
     qTopic.setAttribute("class", "qTopic");
       qPts.appendChild(qGrade);
       qPts.appendChild(qMax);
      if(type=="selected") qPts.appendChild(qInput);
       qPts.appendChild(thisPtsStr);
       qPts.setAttribute("class", "qPts");
     qGrade.appendChild(thisGrade);
     qGrade.setAttribute("class", "qGrade");
       qMax.appendChild(thisMax);
       qMax.setAttribute("class", "qMax");
     qInput.setAttribute("class", "qInput");
     qInput.setAttribute("maxlength", 3);
      qCons.appendChild(thisConStr);
      qCons.appendChild(qFor);
      qCons.appendChild(qWhile);
      qCons.appendChild(qPrint);
      qCons.setAttribute("class", "qCons");
       qFor.appendChild(thisFor);
       qFor.setAttribute("class", "qFor");
     qWhile.appendChild(thisWhile);
     qWhile.setAttribute("class", "qWhile");
     qPrint.appendChild(thisPrint);
     qPrint.setAttribute("class", "qPrint");
      qDesc.appendChild(qNum);
      qDesc.appendChild(thisDesc);
      qDesc.setAttribute("class", "qDesc");
       qNum.appendChild(thisNum);
       qNum.setAttribute("class", "qNum");
       qBtn.appendChild(thisBtn);
       qBtn.setAttribute("class", thisBtnClass);
       qAns.appendChild(thisAns);
       qAns.setAttribute("class", "qAns");
       qAns.readOnly = (type==="active")? false : true;
    if(thisRemark.nodeValue !== "" || type == "iReview") {
        qList.appendChild(qLine);
        qList.setAttribute("class", "qList");
        qLine.appendChild(qRight);
        qLine.setAttribute("class", "qLine");
       qRight.appendChild(qRemark);
       qRight.setAttribute("class", "qRight");
      qRemark.appendChild(thisRemark);
      qRemark.setAttribute("class", "qRemark");
        if(type == "iReview") {
            thisRemark.setAttribute("class", "qTextBox");
            thisRemark.placeholder = "Current Comment: \""+newItem.remark+"\"";
        }
    }
    if(type === "sReview" || type === "iReview") {
        for(let i=0; i<thisFeed.length; i++) {
            let thisType  = thisFeed[i][0];                  
            let pos       = thisFeed[i].indexOf("p");         
            let thisSub   = document.createTextNode(thisFeed[i].substring(1,pos));
            let thisMsg   = document.createTextNode(thisFeed[i].substring(pos+1));
            let thisClass = (thisType === "g")? "qFeed qFeed-good" : 
                            (thisType === "b")? "qFeed qFeed-bad"  :
                                                "qFeed";
            let qLine  = document.createElement("DIV");     // Create the elements
            let qRight = document.createElement("DIV");
            let qFeed  = document.createElement("DIV");     // that the information
            let qSub   = document.createElement("DIV");     // will go on
            let qAlt   = document.createElement("INPUT");
            qLine.appendChild(qRight);
            qLine.setAttribute("class", "qLine");
            qRight.appendChild(qFeed);
            qRight.appendChild(qAlt);
            if(type=="iReview" && thisType !== "n") {
                qRight.setAttribute("class", "qRightAlt");
                qAlt.addEventListener("keyup", () => updateModPreview());
            } else {
                qRight.setAttribute("class", "qRight");
            }
            qFeed.appendChild(thisMsg);
            qFeed.appendChild(qSub);
            qFeed.setAttribute("class", thisClass);
            qSub.appendChild(thisSub);
            qSub.setAttribute("class", "qSub");
            qAlt.setAttribute("class", "qAlt");
            qAlt.setAttribute("maxlength", 4);
            if(thisType==="n") qAlt.style.display = "none";
            qList.appendChild(qLine);
            // Hide elements of this Feedback line based on type
            if(type === "sReview") qAlt.style.display = "none"; // Type of question
            if(thisType === "n")   qSub.style.display = "none"; // Type of feedback
        }
        let qLine     = document.createElement("DIV");
        let qRight    = document.createElement("DIV");
        let qSum      = document.createElement("DIV");
        let qSumMsg   = document.createElement("DIV");
        let qSumPts   = document.createElement("DIV");
        let qSumGrade = document.createElement("SPAN");
        let qSumMax   = document.createElement("SPAN");
        qLine.appendChild(qRight);
        qLine.setAttribute("class", "qLine");
        qRight.appendChild(qSum);
        qRight.setAttribute("class", "qRight");
        qSum.appendChild(qSumMsg);
        qSum.appendChild(qSumPts);
        qSum.setAttribute("class", "qSum");
        qSumMsg.appendChild(thisSumMsg);
        qSumMsg.setAttribute("class", "qSumMsg");
        qSumPts.appendChild(qSumGrade);
        qSumPts.appendChild(qSumMax);
        qSumPts.setAttribute("class", "qSumPts");
        qSumGrade.appendChild(thisSumGrade);
        qSumGrade.setAttribute("class", "qSumGrade");
        qSumMax.appendChild(thisSumMax);
        qSumMax.setAttribute("class", "qSumMax");
        qList.appendChild(qLine);
    }
    switch(type) {
        case "matched":
            qNum.style.display    = "none";
            qPts.style.display    = "none";
        case "selected":
            qAns.style.display    = "none";
            qMax.style.display    = "none";
        case "active":
            qRemark.style.display = "none";
            qLine.style.display   = "none";
            qList.style.display   = "none";
            qGrade.style.display  = "none";
        case "sReview":
        case "iReview":
            qInput.style.display  = "none";
            qBtn.style.display    = "none";
            break;
        default:
            console.log("Type of Question unknown in buildGeneralQuestion()");
            break;
    }
    switch(type) {
        case "selected":
            qInput.style.display = "block";
        case "matched":
            qBtn.style.display = "block";
    }
    if(thisCons.length === 0)       qCons.style.display  = "none";
    if(!thisCons.includes("for"))   qFor.style.display   = "none";
    if(!thisCons.includes("while")) qWhile.style.display = "none";
    if(!thisCons.includes("print")) qPrint.style.display = "none";
    if(thisRemark.nodeValue === "") qRemark.style.display = "none";
    if(type === "active") {
        qAns.contentEditable = "true";
        qAns.style.resize = "vertical";
    } else {
        qAns.contentEditable = "false";
        qAns.style.resize = "none";
    }
    if(type === "matched") qItem.addEventListener("click",  () => toggleSelected(thisId));
    if(type === "active")   qAns.addEventListener("keydown", e => insertTab(e));
    if(type === "selected") {
        qInput.addEventListener("keyup", () => updatePoints());
        qBtn.addEventListener("click",   () => toggleSelected(thisId)); 
    }
    return qItem;
}
/* Displays the changes to an attempt as they're made by instructor */
function updateModPreview() {
    let sums      = document.getElementsByClassName("qSum");
    let sumGrades = document.getElementsByClassName("qSumGrade");
    let msgs      = document.getElementsByClassName("qSumMsg");
    let grades    = iSelectedA[0].grades;
    let pts       = iSelectedA[0].test.pts;
    let testGrd   = 0;
    let testMax   = 0;
    let relStatus = iSelectedA[0].rel;
    for(let i=0; i<sums.length; i++) {
        sumGrades[i].innerHTML = grades[i] + " /";
        msgs[i].innerHTML = "Total Points: ";
        sums[i].style.backgroundColor = "#E7EFFF";
        testGrd += Number(grades[i]);
        testMax += Number(pts[i]);
    }
    testGradeHint.style.display = "none";
    modARelHint.style.display   = "none";
    if(validateForm('modA', false)) {
        let obj = extractModifications();
        for(let i=0; i<obj.grades.length; i++) {
            let thisQIndex = obj.grades[i].qIndex;
            let thisNewG   = obj.grades[i].newG;
            let thisOldG   = grades[thisQIndex];
            sumGrades[thisQIndex].innerHTML        = thisNewG + " /";
            msgs[thisQIndex].innerHTML             = "New Total Points: ";
            sums[thisQIndex].style.backgroundColor = "#badcee";
            testGradeHint.style.display = "inline";
            testGrd += (thisNewG - thisOldG);
        }
    }
    testGrade.innerHTML = testGrd + " / " + testMax;
    console.log("relStatus", relStatus, "checkedVal", getCheckedValue("modARel"));
    if(Number(relStatus) !== Number(getCheckedValue("modARel"))) {
        modARelHint.style.display = "inline";
    }
}
/* Initializes release status of an attempt to the actual release status */
function updateModADisplay() {
    let modAStatus = Number(iSelectedA[0].rel);
    if(modAStatus === 1) {
        modARelYes.checked = true;
        modARelNo.checked  = false;
    } else {
        modARelYes.checked = false;
        modARelNo.checked  = true;
    }
}
/* Shows the total test score for the student */
function updateTestSummary() {
    let grades  = sSelectedA[0].grades;
    let pts     = sSelectedA[0].test.pts;
    let testGrd = 0;
    let testMax = 0;
    for(let i=0; i<grades.length; i++) {
        testGrd += Number(grades[i]);
        testMax += Number(pts[i]);
    }
    testGrade.innerHTML = testGrd + " / " + testMax;
}
/* Will dynamically display the total test points as instructor is giving them points */
function updatePoints() {
    let inputs = Array.from(document.getElementsByClassName("qInput"));
    let pts    = inputs.map(i=>Number(i.value)).filter(v=>Number.isFinite(v)).reduce((a,b)=>a+b,0);
    testPoints.innerHTML = pts;
    console.log("points updated");
}
/* Builds the HTML element that displays an attempt summary */
function buildAttemptSummaryItem(newItem, num) {
    let testName   = newItem.test.desc;
    let maxPts     = newItem.test.pts.map(a => Number(a)).reduce((a,b) => a + b, 0);
    let graded     = typeof newItem.grades !== 'undefined';
    let grade      = (graded) ? newItem.grades.map(a => Number(a)).reduce((a,b) => a + b, 0) : '?';
    let reviewed   = newItem.remarks.filter((str) => str !== "").length !== 0;
    let statusText = (!graded)? "Not Graded" : (reviewed)? "Reviewed by Instructor" : "Auto-Graded";
    let itemId     = "a"+newItem.test.id;
    let itemClass  = "attempt";
    let item  = document.createElement("LI");
    let aDiv  = document.createElement("DIV");
    let aTop  = document.createElement("DIV");
    let aBot  = document.createElement("DIV");
    let aDesc = document.createTextNode(testName);
    let aPts  = document.createTextNode("Grade: " + grade + " / " + maxPts);
    let aStat = document.createTextNode("Status: " + statusText);
    aDiv.setAttribute ("class", "aDiv" );
    aTop.setAttribute ("class", "aTop" );
    aBot.setAttribute ("class", "aBot" );
    aDiv.appendChild(aTop);
    aDiv.appendChild(aBot);
    aTop.appendChild(aDesc);
    aBot.appendChild(aPts);
    aBot.appendChild(document.createElement("BR"));
    aBot.appendChild(aStat);
    item.setAttribute ("id", itemId);
    item.setAttribute ("class", "available");
    item.appendChild(aDiv);
    item.addEventListener("click", () => toggleSelected(itemId));
    return item;
}
/* Builds the HTML element that displays a test summary */
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
/* Will randomly pick a new test pattern to be a placeholder for testcase inputs
 * Always returns a new one unless the pool of tests runs out  */
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
/* Allows student to tab in their answer */
function insertTab(e) {
    if (e.keyCode === 9) {
        document.execCommand('insertHTML', false, '    ');
        e.preventDefault();
    }
}
/* Creates a delay for aesthetic purposes, and testing purposes */
function timeout(delay) {
    return new Promise((resolve,reject) => {
        setTimeout(resolve, delay);
    });
}
/* Returns the student answers for a test */
function getStudentAnswers() {
    let inputs = Array.from(document.getElementsByClassName("qAns"));
    return inputs.map( i=>i.value );
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
	addSpan.innerHTML = convertDiffFormat(addRange.value);
}
/* Makes the element hidden */
function hideElement(elemId) {
    document.getElementById(elemId).style.display = "none";
}
/* Makes the element visible */
function showElement(elemId) {
    document.getElementById(elemId).style.display = "block";
}
/* Checks that the given element has a non-empty value */
function nonEmpty(elemId) {
	return ( document.getElementById(elemId).value !== "" );
}
