// Devon O'Connor
// May 7th, 2019
// scripts/login.js
document.getElementById("btn").addEventListener("click", postForm);
document.getElementById("clr").addEventListener("click", clearResult);
document.getElementById("usrInput").addEventListener("keyup", function(e) { 
    if(e.keyCode === 13) 
        postForm();
} );
document.getElementById("pwdInput").addEventListener("keyup", function(e) { 
    if(e.keyCode === 13) 
        postForm();
} );
function clearResult() {
    document.getElementById("result").innerHTML = "";
}
function postForm() {
    var response = document.getElementById("result");
    response.innerHTML = "Checking...";
    var xhttp  = new XMLHttpRequest();
    var jsonObj = {
        "Type"     : "Login",
        "username" : document.getElementById("usrInput").value.toLowerCase(),
        "password" : document.getElementById("pwdInput").value,
    }
    var jsonStr = JSON.stringify(jsonObj);
    console.log(jsonStr);
xhttp.onload = () => {
  console.log( "Rcvd: [" + xhttp.responseText + "]" );
  if(jsonObj["username"] === "teacher" && jsonObj["password"] === "teach"){
    result.innerHTML = "Welcome, Teacher!";
    timeout(600)
      .then( () => result.insertAdjacentHTML('beforeend', "</br>Redirecting") )
      .then( () => timeout(400) )
      .then( () => result.insertAdjacentHTML('beforeend', ".") ) // Just some animation
      .then( () => timeout(400) )                                // to show user
      .then( () => result.insertAdjacentHTML('beforeend', ".") ) // that they are
      .then( () => timeout(400) )                                // being redirected
      .then( () => result.insertAdjacentHTML('beforeend', "!") )
      .then( () => timeout(400) )
      .then( () => {
        window.location.href = "https://web.njit.edu/~djo23/CS490/instructor/welcome.html";
    });
  } else if(jsonObj["username"] === "student" && jsonObj["password"] === "stu") {
    result.innerHTML = "Welcome, Student!";
    timeout(600)
      .then( () => result.insertAdjacentHTML('beforeend', "</br>Redirecting") )
      .then( () => timeout(400) )                                // Just some animation
      .then( () => result.insertAdjacentHTML('beforeend', ".") ) // to show user
      .then( () => timeout(400) )                                // that they are
      .then( () => result.insertAdjacentHTML('beforeend', ".") ) // being redirected
      .then( () => timeout(400) )
      .then( () => result.insertAdjacentHTML('beforeend', "!") )
      .then( () => timeout(400) )
      .then( () => {
        window.location.href = "https://web.njit.edu/~djo23/CS490/student/welcome.html";
    });
  } else {
    // result.innerHTML = "Unknown Login!"; 
    result.insertAdjacentHTML('beforeend', "</br>Unknown Login!")
    timeout(800)
      .then( () => result.insertAdjacentHTML('beforeend', "</br>Try again..") )
      .then( () => timeout(1000) )
      .then( () => {
        window.location.href = "https://web.njit.edu/~djo23/CS490/login.html";
    });
  }
    };
    xhttp.open("POST", "https://web.njit.edu/~djo23/CS490/curlObj.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(jsonStr);
}

