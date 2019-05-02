# Element hierarchy for a question
qItem─┬→ qDiv─┬→ qInfo─┬→ qDiff→ thisDiff
      │       │        ├→ qTopic→ thisTopic
      │       │        └→ qPts─┬→ qGrade→ thisGrade+" / "
      │       │                ├→ qMax→ thisMax
      │       │                ├→ qInput
      │       │                └→ "Pts"
      │       ├→ qCons─┬→ qFor→ "For Loop"
      │       │        ├→ qWhile→ "While Loop"
      │       │        └→ qPrint→ "Print Statement"
      │       ├→ qDesc→ qNum→ thisNum+".)"
      │       ├→ qBtn→ thisBtn
      │       └→ qAns→ thisAns
      └→ qList─┬→ qLine──→ qRemark→ thisRemark
               ├→ qLine─┬→ qFeed─┬→ thisMsg
               │        │        └→ qSub→ thisSub
               │        └→ qAlt
               └→ qLine──→ qSum─┬→ qSumMsg→ thisSumMsg
                                └→ qSumPts─┬→ qSumGrade→ thisSumGrade
                                           └→ qSumMax→ thisSumMax

## Types of Questions and what shows for each
|           | Matched | Selected | Active | sReview | iReview |
|----------:|:-------:|:--------:|:------:|:-------:|:-------:|
| qItem     | X       | X        | X      | X       | X       |
| qDiv      | x       | x        | X      | X       | X       |
| qInfo     | x       | x        | x      | X       | X       |
| qDiff     | x       | x        | x      | X       | X       |
| qTopic    | x       | x        | x      | X       | X       |
| qCons     | x       | x        | x      | X       | X       |
| qFor      | x       | x        | x      | X       | X       |
| qWhile    | x       | x        | x      | X       | X       |
| qPrint    | x       | x        | x      | X       | X       |
| qDesc     | x       | x        | x      | X       | X       |
| qPts      |         | x        | x      | X       | X       |
| qPtsStr   |         | x        | x      | X       | X       |
| qNum      |         | x        | x      | X       | X       |
| qMax      |         |          | x      | X       | X       |
| qAns      |         |          | x      | X       | X       |
| qGrade    |         |          |        | X       | X       |
| qList     |         |          |        | X       | X       |
| qLine     |         |          |        | X       | X       |
| qRemark   |         |          |        | X       | X       |
| qFeed     |         |          |        | X       | X       |
| qSub      |         |          |        | X       | X       |
| qAlt      |         |          |        |         | X       |
| qInput    |         | x        |        |         |         |
| qBtn      |         | x        |        |         |         |
| qSum      |         |          |        | x       | x       |
| qSumMsg   |         |          |        | x       | x       |
| qSumPts   |         |          |        | x       | x       |
| qSumGrade |         |          |        | x       | x       |
| qSumMax   |         |          |        | x       | x       |

