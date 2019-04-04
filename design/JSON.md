# JSON Messages:

## QUESTION:
```javascript
let question = { 
    id    : INT,
    desc  : STR,
    topic : STR,
    diff  : INT,
    tests : [STR]
}
```

## TEST:
```javascript
test = { 
    id   : INT,
    desc : STR,
    rel  : INT,
    sub  : INT,
    ques : [{QUESTION}],
    pts  : [INT]
}
```


## ATTEMPT:
```javascript
var = { 
    id       : INT,
    test     : {TEST},
    answers  : [STR],
    grades   : [INT],
    comment  : STR,
    feedback : [STR],
    remarks  : [STR]
}
```


## addQ
### request
```javascript
{
    type  : "addQ",
    desc  : STR,
    topic : STR,
    cons  : [STR],
    diff  : INT,
    tests : [STR]
}
```

### reply
```javascript
{
    type  : "addQ",
    error : STR,
    que   : {QUESTION}
}
```

## getQ 
### request
```javascript
{
    type  : "getQ",
    topic : STR,
    diffs : [INT],
    keys  : [STR]
}
```

### reply
```javascript
{
    type  : "getQ",
    error : STR,
    ques  : [{QUESTION}]
}
```

## addT 
###request
```javascript
{
    type : "addT",
    desc : STR,
    rel  : INT,
    ques : [{QUESTION}],
    pts  : [INT]
}
```

### reply
```javascript
{
    type  : "addT",
    error : STR,
    test  : {TEST}
}
```

## getT
### request
```javascript
{
    type : "getT",
    rels : [INT]
}
```

### reply
```javascript
{
    type  : "getT",
    error : STR,
    tests : [{TEST}]
}
```


## addA
### request
```javascript
{
    type    : "addA",
    id      : INT,
    comment : STR,
    answers : [{ANSWER}]
}
```

### reply
```javascript
{
    type    : "addA",
    error   : INT,
    id      : INT,
    sub     : INT,
    answers : [{ANSWER}]
}
```

## getA
### request
```javascript
{
    type : "getA",
    ids  : [INT]
}
```

###  reply
```javascript
{
    type    : "getA",
    error   : STR,
    answers : [{ANSWER}]
}
```
