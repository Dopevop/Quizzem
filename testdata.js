var q0 = { 
	'id'    : 1000,
	'desc'  : 'Make a function "abc" that takes any number of parameters and returns the number 1',
	'topic' : 'Return Statement',
	'diff'  : 1,
	'tests' : [ 'abc()=1', 'abc(1,2,3)=1' ],
};
var q1 = {
	'id'    : 1001,
	'desc'  : 'Make a functino called "ghi" that takes one parameter and returns the number 2',
	'topic' : 'Return Statement',
	'diff'  : 2,
	'tests' : [ 'ghi(3)=2', 'ghi(1)=2' ],
};
var q2 = {
	'id'    : 1002,
	'desc'  : 'Make a function "klm" that takes no parameters and returns the number 3',
	'topic' : 'Return Statement',
	'diff'  : 3,
	'tests' : [ 'klm()=3', 'klm()=3' ],
};
var q3 = {
	'id'    : 1003,
	'desc'  : 'Make a function "pqr" that takes any number of parameters and returns the number 4',
	'topic' : 'Return Statement',
	'diff'  : 4,
	'tests' : [ 'pqr()=4', 'pqr(1,2,3)=4' ],
};
var q4 = {
	'id'    : 1004,
	'desc'  : 'Make a function "fgh" that takes any number of parameters and returns the number 8',
	'topic' : 'Return Statement',
	'diff'  : 5,
	'tests' : [ 'fgh()=8', 'fgh(1,2,3)=8' ],
};
var t0 = {
	'id'        : 1000,
	'desc'      : "Test One",
	'rel'       : 1,
	'sub'       : 0,
	'questions' : [q0],
};
var t1 = {
	'id'        : 1001,
	'desc'      : "Test Two",
	'rel'       : 1,
	'sub'       : 0,
	'questions' : [q0, q1],
};
var t2 = {
	'id'        : 1002,
	'desc'      : "Test Three",
	'rel'       : 1,
	'sub'       : 0,
	'questions' : [q0, q1, q2],
};
var t3 = {
	'id'        : 1003,
	'desc'      : "Test Four",
	'rel'       : 1,
	'sub'       : 0,
	'questions' : [q0, q1, q2, q3],
};
var t4 = {
	'id'        : 1004,
	'desc'      : "Test Five",
	'rel'       : 1,
	'sub'       : 0,
	'questions' : [q0, q1, q2, q3, q4],
};
var t5 = {
	'id'        : 1005,
	'desc'      : "Test Six",
	'rel'       : 1,
	'sub'       : 1,
	'questions' : [q1, q2, q3, q4],
};
var t6 = {
	'id'        : 1006,
	'desc'      : "Test Seven",
	'rel'       : 0,
	'sub'       : 1,
	'questions' : [q2, q3, q4],
};
var t7 = {
	'id'        : 1007,
	'desc'      : "Test Eight",
	'rel'       : 0,
	'sub'       : 0,
	'questions' : [q3, q4],
};
