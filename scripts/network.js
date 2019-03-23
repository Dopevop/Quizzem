// Promise-chainable async request to server
function sendRequest(reqType, option) {
	return new Promise( (resolve, reject) => {
		var xhr     = new XMLHttpRequest();
		var jsonStr = buildPostBody(reqType);
		xhr.onerror = () => { reject(Error('Network error.')); };
		xhr.onload  = () => {
			if (xhr.status === 200) {
				console.log("Rcvd:"+xhr.responseText);
				resolve(responseText);
			} else {
				reject(Error('Status != 200, '));
			}
		};
		xhr.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(jsonStr);
		console.log("Sent:" + jsonStr);
	});
}

// Will handle reply from server upon Promise resolve
function handleReply(replyText) {
	var replyObj = JSON.parse(replyText);
	switch(replyObj['type']) {
		case 'AddQ':
			if(replyObj['que']['qId']){ // Make an Id field if absent
				replyObj['que']['id'] = replyObj['que']['qId'];
			}
			iLocalQ.push(replyObj['que']);  // Add to local Qs
			iMatchQ.push(replyObj['que']); // Add to matched Qs
			updateDisplays(["matchedList"]);     // Update matchedList
			break;
		case 'SearchQ':
			var DBQ = replyObj['ques'];       // Extract all Qs
			for(var i=0; i<DBQ.length; i++){       // Put all uniq Qs in
				if(uniqQuestion(DBQ[i], iLocalQ)){ //   instructor's local
					iLocalQ.push(DBQ[i]);          //   Q array
				}
			}
			break;
		case 'GetTests':
			var localT = (source == "student")? sLocalT : iLocalT; 
			var DBT = replyObj['tests'];          // Update the
			for(var i=0; i<DBT.length; i++){      // relevant array
				if(uniqQuestion(DBT[i], localT)){ // Only add
					localT.push(DBT[i]);          // Uniq Qs
				}
			}
			break;
		case 'AddTest':
			var newTest = replyObj['test'];
			iLocalT.push(newTest);
			break;
	}
}

/* Creates the JSON obj that will encapsulate the request to the server
 * */
function buildPostBody(type) {
	var jsonObj;
	switch(type) {
		case 'AddQ':
			jsonObj = {
				'type'  : 'AddQ',
				'desc'  : addDesc.value,
				'topic' : addTopic.value,
				'diff'  : addRange.value,
				'tests' : getNonEmptyInputs('addTests'),
			}
			break;
		case 'SearchQ':
			jsonObj = {
				'type'  : 'SearchQ',   // Build SearchQ req
				'topic' : '',          // Don't filter by topic
				'diffs' : [1,2,3,4,5], // Don't filter by diff
				'keys'  : [],          // Don't filter by keyword
			}
			break;
		case 'GetTests':
			jsonObj = {
				'type' : 'GetTests',                         // Send a GetTests req
				'rels' : (source == 'student')? [1] : [0,1], // Only released tests for student
			}
			break;
		case 'AddTest':
			jsonObj = {
				'type'      : 'AddTest',
				'desc'      : testDesc.value,
				'rel'       : getCheckedValue("testRelease"),
				'ques' : getSelectedQs(),
			}
			break;
	}
	return JSON.stringify(jsonObj);
}

