# JSON Messages:

## QUESTION:
```javascript
QUESTION = { 
    id    : INT,
    desc  : STR,
    topic : STR,
    cons  : [STR],
    diff  : INT,
    tests : [STR]
}
```

## TEST:
```javascript
TEST = { 
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
ATTEMPT = { 
    test     : {TEST},
    answers  : [STR],
    grades   : [INT],
    comment  : STR,
    feedback : [STR],
    remarks  : [STR],
    rel      : INT
}
```

## REMARK:
```javascript
REMARK = {
    tId  : INT
    qId  : INT
    newR : STR
}
```

## FEED:
```javascript
FEED = {
    tId  : INT
    qId  : INT
    newF : STR
}
```

## GRADE:
```javascript
GRADE = {
    tId  : INT
    qId  : INT
    newG : INT
}
```

---------------------
## modA
```javascript
request = {
    type     : "modA",
    release  : INT,
    remarks  : [{REMARK}],
    feedback : [{FEED}],
    grades   : [{GRADE}]
}
```
```javascript
reply = {
    type     : "modA",
    error    : INT,
    attempt  : {ATTEMPT}
}
```


## addQ
```javascript
request = {
    type  : "addQ",
    desc  : STR,
    topic : STR,
    cons  : [STR],
    diff  : INT,
    tests : [STR]
}
```
```javascript
reply = {
    type  : "addQ",
    error : STR,
    que   : {QUESTION}
}
```

## getQ 
```javascript
request = {
    type  : "getQ",
    topic : STR,
    diffs : [INT],
    keys  : [STR]
}
```
```javascript
reply = {
    type  : "getQ",
    error : STR,
    ques  : [{QUESTION}]
}
```

## addT 
```javascript
request = {
    type : "addT",
    desc : STR,
    rel  : INT,
    ques : [{QUESTION}],
    pts  : [INT]
}
```

```javascript
reply = {
    type  : "addT",
    error : STR,
    test  : {TEST}
}
```

## getT
```javascript
request = {
    type : "getT",
    rels : [INT]
}
```

```javascript
reply = {
    type  : "getT",
    error : STR,
    tests : [{TEST}]
}
```


## addA
```javascript
request = {
    type    : "addA",
    test    : {TEST},
    comment : STR,
    answers : [{ANSWER}]
}
```

```javascript
reply = {
    type    : "addA",
    error   : INT,
    attempt : {ATTEMPT}
}
```

## getA
```javascript
request = {
    type : "getA",
    ids  : [INT]
}
```

```javascript
reply = {
    type     : "getA",
    error    : INT,
    attempts : [{ATTEMPT}]
}
```
