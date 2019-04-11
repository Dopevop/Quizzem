qItem─┬→ qDiv─┬→ qInfo─┬→ qDiff→ thisDiff
      │       │        ├→ qTopic→ thisTopic
      │       │        └→ qPts─┬→ qGrade→ thisGrade+" / "
      │       │                ├→ qMax→ thisMax
      │       │                ├→ qInput
      │       │                └→ "Pts"
      │       ├→ qCons─┬→ qFor→ "For Loop"
      │       │        ├→ qWhile→ "While Loop"
      │       │        └→ qPrint→ "Print Statement"
      │       ├→ qDesc─┬→ qNum→ thisNum+".)"
      │       │        └→ qBtn→ thisBtn
      │       └→ qAns→ thisAns
      └→ qList─┬→ qLine──→ qRemark→ thisRemark
               └→ qLine─┬→ qFeed→ qSub→ thisSub
                        └→ qAlt
