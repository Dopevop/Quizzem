let iMatchQ  = []; // holds selected questionsn from preview list
let iActiveQ = []; // holds all locally known questions
let iLocalQ  = [q0,q1,q2,q3,q4]; // Holds all questions
let iLocalT  = [];

/* Get all questions in database */
sendGetQ();

/* Adding event listeners to submit and clear buttons  */
	 addSub.addEventListener("click"    , function() { validateForm("AddQ", sendAddQ)    } );
	addForm.addEventListener("mousemove", function() { updateDiff()                      } );
   addRange.addEventListener("mouseup"  , function() { updateDiff()                      } );
  searchSub.addEventListener("click"    , function() { displaySearchResults()            } );
searchReset.addEventListener("click"    , function() { clearForm("searchForm")           } );
searchReset.addEventListener("click"    , function() { resetDisplay("matchedList")       } );
	testSub.addEventListener("click"    , function() { validateForm("AddTest", sendAddT) } );
	testSub.addEventListener("click"    , function() { clearArray(iActiveQ)              } );
	testSub.addEventListener("click"    , function() { updateDisplays(["previewList"])   } );

/* Initializes the modular elements */
resetModal("Test Cases", "addTests"  , 'addInput("addTests")');
resetModal("Keywords"  , "searchKeys", 'addInput("searchKeys")');
