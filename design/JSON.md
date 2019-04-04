#JSON Messages:

###QUESTION:
{ 
    id    : INT,
    desc  : STR,
    topic : STR,
    diff  : INT,
    tests : [STR]
}


###TEST:
{ 
    id   : INT,
    desc : STR,
    rel  : INT,
    sub  : INT,
    ques : [{QUESTION}],
    pts  : [INT]
}


###ATTEMPT:
{ 
    id       : INT,
    test     : {TEST},
    answers  : [STR],
    grades   : [INT],
    comment  : STR,
    feedback : [STR],
    remarks  : [STR]
}


###addQ request
{
    type  : addQ,
    desc  : STR,
    topic : STR,
    cons  : [STR],
    diff  : INT,
    tests : [STR]
}

###addQ reply
{
    type  : addQ,
    error : STR,
    que   : {QUESTION}
}


###getQ request
{
    type:getQ,
    topic:STR,
    diffs:[INT],
    keys:[STR]
}
###getQ reply
{
    type:getQ,
    error:STR,
    ques:[{QUESTION}]
}



###addT request
{
    type:addT,
    desc:STR,
    rel:INT,
    ques:[{QUESTION}],
    pts:[INT]
}
###addT reply
{
    type:addT,
    error:STR,
    test:{TEST}
}


###getT request
{
    type:getT,
    rels:[INT]
}
###getT reply
{
    type:getT,
    error:STR,
    tests:[{TEST}]
}


###addA request
{
    type:addA,
    id:INT,
    comment:STR,
    answers:[{ANSWER}]
}
###addA reply
{
    type:addA,
    error:INT,
    id:INT,
    sub:INT,
    answers:[{ANSWER}]
}


###getA request
{
    type:getA,
    ids:[INT]
}
###getA reply
{
    type:getA,
    error:STR,
    answers:[{ANSWER}]
}
