var q0 = {
	'id'    : 1000,
	'desc'  : 'Write a function named inRange() that tests whether a given number falls within a specified range. The function inRange() takes three parameters: testNum, floor, ceiling. The function inRange() should return True if testNum is greater than or equal to floor and less than or equal to ceiling.',
	'topic' : 'Conditionals',
	'diff'  : 2,
	'tests' : [ 'inRange(4,1,7)=True', 'inRange(4,6,7)=false' ],
    'cons'  : [],
};
var q1 = {
	'id'    : 1001,
	'desc'  : 'Write a function named greet() that takes two parameters: greeting and name. The functino should then print out a message greeting the user by name with a comma between the greeting and the name.',
	'topic' : 'Strings',
	'diff'  : 1,
	'tests' : [ 'greet("Cheerio", "Gabriel")="Cheerio, Gabriel"', 'greet("a", "b")="a, b"' ],
    'cons'  : ["print"]
};
var q2 = {
	'id'    : 1002,
	'desc'  : 'Write a function named containsLetter() that identifies all of the strings in a list that contain a specified letter and returns a list of those strings. The function takes two parameters: a string of length 1, aLetter; a list of strings, strList.',
	'topic' : 'Output',
	'diff'  : 5,
	'tests' : [ 'containsLetter("i", ["you","like"])=["like"]', 'containsLetter("z", ["bag"])=[]' ],
    'cons'  : ['for', 'print', 'while'],
};
var q3 = {
	'id'    : 1003,
	'desc'  : 'Write a function called getSign() that takes an integer and returns whether it is positive, negative or zero.',
	'topic' : 'A',
	'diff'  : 1,
	'tests' : [ 'getSign(-4)="negative"', 'getSign(0)="zero"', 'getSign(300)="positive"' ],
    'cons'  : ['for', 'while'],
};
var q4 = {
	'id'    : 1004,
	'desc'  : 'We define the letters "a", "e", "i", "o" and "u" as vowels. We do not consider any other letter as a vowel. Write a function named mostlyVowels() that returns a list of words in a body of text in which more than half of the letters are vowels. Count both capitalized and lower case instances of the vowels. A word should appear in the return list at most once, no matter how many times it occurs in the input string. A capitalized instance of a word is the same work as a lower cased instance. For example, "Is" and "is" are the same word. The function takes a string that consists of words, separated by spaces, and returns a list of all words in the input string in which more than half of the letters are vowels.',
	'topic' : 'Strings',
	'diff'  : 4,
	'tests' : [ 'print(mostlyVowels("Our lives begin to end the day we become silent about things that matter"))=["our", "about"]', 'print(mostlyVowels("Youth lives begin to end the day we become silent about things that matter"))=["about"]' ],
    'cons'  : ["while"],
};
var q5 = {
	'id'    : 1005,
	'desc'  : 'Write a function named compare() that tests the realtive size of two objects and returns the result. The function compare() takes two objects as parameters. The function should return the one-character string "<" if thingOne is less than thingTwo, the one-character string ">" if thing One is greater than thingTwo, and the two-character string "==" in all other cases.',
	'topic' : 'Conditionals',
	'diff'  : 2,
	'tests' : [ 'compare(0, 1)="<"', 'compare("abc", "a")=">"', 'compare([],[])="=="' ],
    'cons'  : [],
};
var q6 = {
	'id'    : 1006,
	'desc'  : 'Write a function called neat() that takes two parameters: a string, consisting of white-space separated words; and a number, specifying the maximum line width. Arrange those words on lines of the given width such that the remaining whitespace is minimized. The cost of the remaining whitespace is calculated as the cube of the number of spaces at the end of the line. Return the cost for the optimal line arrangements that minimizes this whitespace. Whitespace on the last line does not count towards the cost.',
	'topic' : 'Algorithms',
	'diff'  : 5,
	'tests' : [ 'neat("The edge of knowledge.", 10)=370', 'neat("The edge of all the edges.", 10)=8', 'compare([],[])="=="' ],
    'cons'  : ["for", "while", "print"],
};
var t0 = {
	'id'    : 1000,
	'desc'  : "Quiz One",
	'rel'   : 1,
	'sub'   : 0,
	'ques'  : [q0],
    'pts': ["15"]
};
var t1 = {
	'id'    : 1001,
	'desc'  : "Midterm One",
	'rel'   : 1,
	'sub'   : 0,
	'ques'  : [q0, q1],
    'pts': ["120", "30"]
};
var t2 = {
	'id'    : 1002,
	'desc'  : "Midterm Two",
	'rel'   : 1,
	'sub'   : 0,
	'ques'  : [q0, q1, q2],
    'pts': ["15", "20", "25"]
};
var t3 = {
	'id'    : 1003,
	'desc'  : "Practice Exam",
	'rel'   : 1,
	'sub'   : 0,
	'ques'  : [q0, q1, q2, q3],
    'pts': ["15", "15", "10", "10"]
};
var t4 = {
	'id'    : 1004,
	'desc'  : "Extra Credit Quiz",
	'rel'   : 1,
	'sub'   : 0,
	'ques'  : [q6, q5, q2, q3, q4],
    'pts': ["10", "15", "15", "30", "30"]
};
var t5 = {
	'id'    : 1005,
	'desc'  : "Final Exam",
	'rel'   : 1,
	'sub'   : 1,
	'ques'  : [q0, q1, q2, q3, q4, q5, q6],
    'pts': ["5", "10", "10", "15", "15", "20", "25"]
};
var t6 = {
	'id'    : 1006,
	'desc'  : "Final Exam Makeup",
	'rel'   : 0,
	'sub'   : 1,
	'ques'  : [q2, q3, q4],
    'pts': ["15", "20", "25"]
};
var t7 = {
	'id'    : 1007,
	'desc'  : "Bogus Test",
	'rel'   : 0,
	'sub'   : 0,
	'ques'  : [q3, q4],
    'pts': ["15", "15"]
};

var a0 = {
    'test'     : t0,
    'answers'  : ["def inRange() Here's my answer for q0, it's not a very good one. Lets make it a bit longer with some more giberish writing about nothing. Alright that should be good. Alright i'm going to make this a bit longer so that I can see if the div will expand to show longer text in the text area because I saw that it was cut off on the page because textareas don't expand with content so lets see if this is going to work I wonder if this is going to be long enough Idk, but lets see. Hmm seems like its justtt long enough but I want to make it a bit longer to make sure that its actually expanding and not just coincidentally just short enough to fit into the div so lets seee if this is goingt to be goood"],
    'grades'   : [2],
    'comment'  : "I wasn't prepared for this test, go easy on me",
    'feedback' : [
        ["b1pNo colon after first line", "g2pCorrect function name",
         "b6pDidn't pass testcase #1", "b6pDidn't pass testcase #2"]
    ],
    'remarks'  : ["This answer was just awful, see me after class."],
    'rel'      : 0,

}
var a1 = {
    'test'     : t1,
    'answers'  : ["Here's my answer for q0, it's not a very good one. Lets make it a bit longer with some more giberish writing about nothing. Alright that should be good.",
                  "def greet(greeting, name): print( greeting + \", \" + name )"],
    'grades'   : [21, 18],
    'comment'  : "I wasn't prepared for this test, go easy on me",
    'feedback' : [
        [
            "g12pcolon [:] in user answer", 
            "b12p expecting function: operation, it was not found!",
            "b87puser program failed to execute."
        ],
        [
            "b6pconstraint [for] was not found.",
            "b6pconstraint [print] was not found.",
            "g6pcolon [:] in user answer",
            "g6pexpecting function: strMult, function found!",
            "g24ppython called strMult(\"hello\",1), expected: hello, got user answer [hello]",
            "g24ppython called strMult(\"up\", 4), expected: upupupup, got user answer [upupupup]",
            "g24ppython called strMult(\"hey\", 3), expected: heyheyhey, got user answer [heyheyhey]",
            "g24ppython called strMult(\"aba\", 2), expected: abaaba, got user answer [abaaba]",
            "n0puser program succesfully executed.",
        ]
    ],
    'remarks'  : ["This answer was just awful, see me after class.", 
                  "Good work on this one! See me after class ;)"],
    'rel'      : 1,
}
var a2 = {
    'test'     : t6,
    'answers'  : ["return true", "print false", "while(false)"],
    'grades'   : [2, 3, 7],
    'comment'  : "I wasn't prepared for this test, go easy on me",
    'feedback' : [
        ["b1pNo colon after first line", "n2pCorrect function name",
         "b6pDidn't pass testcase #1", "g6pPassed testcase #2"],
        [],
        ["g15pTest case 1 passed", "b15pTest case 2 failed"]
    ],
    'remarks'  : ["", "Try harder", "This is excellent work, truly visionary. You might just win a nobel peace prize if you keep this up."],
    'rel'      : 1,

}
