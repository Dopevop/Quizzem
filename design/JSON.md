# JSON Messages:

## QUESTION:
```javascript
QUESTION = { 
    id    : INT,
    desc  : STR,
    topic : STR,
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
    id       : INT,
    test     : {TEST},
    answers  : [STR],
    grades   : [INT],
    comment  : STR,
    feedback : [STR],
    remarks  : [STR]
}
```

---------------------
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
    id      : INT,
    comment : STR,
    answers : [{ANSWER}]
}
```

```javascript
reply = {
    type    : "addA",
    error   : INT,
    id      : INT,
    sub     : INT,
    answers : [{ANSWER}]
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
reqply = {
    type    : "getA",
    error   : STR,
    answers : [{ANSWER}]
}
```
