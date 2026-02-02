# Database Schema Design (ERD)

Here is the visual representation of the proposed database schema for the IELTS Mock Test System.

```mermaid
classDiagram
    direction LR

    %% User Domain
    class User {
        +UUID id
        +String email
        +String fullName
        +Role role
    }

    %% Exam Domain
    class Exam {
        +UUID id
        +String title
        +String type
        +Status status
    }

    class ExamSkill {
        +UUID id
        +SkillType skill
        +Int duration
        +Int orderIndex
    }

    class ExamSection {
        +UUID id
        +String title
        +String textContent
        +String audioUrl
        +String imageUrl
        +String transcript
    }

    class QuestionGroup {
        +UUID id
        +String title
        +String instruction
        +QuestionType type
    }

    class Question {
        +UUID id
        +Int orderIndex
        +String content
        +JSON options
        +JSON correctAnswer
    }

    %% Results Domain
    class TestAttempt {
        +UUID id
        +DateTime startedAt
        +DateTime completedAt
        +Float overallScore
    }

    class UserAnswer {
        +UUID id
        +String textContent
        +JSON selectedOptions
        +Boolean isCorrect
    }

    %% Relationships
    User "1" -- "0..*" TestAttempt : takes
    Exam "1" -- "1..*" ExamSkill : has
    ExamSkill "1" -- "0..*" ExamSection : contains
    ExamSection "1" -- "0..*" QuestionGroup : has groups
    QuestionGroup "1" -- "0..*" Question : has questions
    
    Exam "1" -- "0..*" TestAttempt : instance of
    TestAttempt "1" -- "0..*" UserAnswer : contains
    Question "1" -- "0..*" UserAnswer : answered in
```

## Key Design Decisions

1.  **QuestionContainer**: Handles shared resources. For a Reading test, this holds the "Passage". For Listening, it holds the "Audio" for a specific part. Questions are child nodes of this container.
2.  **JSON for Complexity**: `options` and `correctAnswer` in the `Question` table use `JSON`. This allows storing simple strings for Fill-in-the-blanks or structured objects for Multiple Choice without creating 5-6 extra tables.
3.  **Flexible Scoring**: `UserAnswer` stores the raw input and the system (or admin) calculates `scoreEarned`.
4.  **Skill Separation**: `ExamSection` explicitly separates Listening/Reading/Writing/Speaking, allowing detailed analytics per skill.
