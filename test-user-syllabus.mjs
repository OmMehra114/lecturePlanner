import fs from 'fs';

async function testUserSyllabus() {
  const syllabusText = `UNIT 1 Software Development Methodology: Fundamentals of Software Engineering Concepts 
and Process; Software Development Life Cycle: Important Steps and Effort Distribution; 
Overview of Software Development Models like Prototype Model, Incremental Model, 
Spiral Model, RAD. 
 
UNIT 2 Fundamentals of Agile Development Methodology: The Genesis of Agile, Introduction 
and background, Agile Manifesto and principles, Agile development Lifecycle, Agile 
Development Methods: Adaptive Software Development (ASD), Dynamic Systems 
Development Methods (DSDM), Scrum, Extreme Programming (XP): XP lifecycle, 
Feature Driven development, Lean Software Development, Kanban, Agile project 
management,  Test Driven Development, Key Principles, Examples, and Tools & 
Techniques for each Agile development methods. 
 
UNIT 3 Agile Requirements, Design and Development: Impact of Agile Processes in 
Requirement Engineering Requirements Elicitation and Management, Agility in Design, 
Agile Architecture, Agile Design Practices, Role of Design Principles, Agile Product 
Development, and Automated build tools, Continuous Integration, Continuous 
Academic Year: 2023-24                                           
Department of Computer Engineering 
Deployment, Refactoring, Team Dynamics and Collaboration. 
UNIT 4 Agile Framework:Scrum: Introduction to Scrum, Agile Principles - Sprints Introduction, 
User Stories and Product Backlog, Estimation, Velocity, Burndown chart, Sprint Zero, 
Roles - Team Management and Structures, Product Owner, ScrumMaster / Team Lead, 
Implementation Team Members, Planning in Scrum - Planning, Planning Stakeholders, 
Planning Types (Portfolio, Product and Sprint), Sprint phases/meeting - Sprint Planning, 
Sprint Review, Sprint Retrospective, Product Demo, Daily Scrum calls. 
UNIT 5 Agile Testing and Review: Agile Testing Principles, Practice and Processes, Difference 
between Testing in Traditional and Agile Approaches, Agile testing methods, techniques 
and tools, Estimating Test Efforts, Agile Metrics and Measurements, Agile Control: the 7 
control parameters; Product Quality, Agile approach to Risk, Agile Approach to 
Configuration Management, Agility and Quality Assurance. Case study using any one of 
the framework`;

  const formData = new FormData();
  formData.append('syllabusText', syllabusText);
  formData.append('subjectName', 'Agile Software Engineering');
  formData.append('subjectCode', 'ASE-101');
  formData.append('totalHours', '40');
  formData.append('startDate', '2024-01-10');
  formData.append('endDate', '2024-05-15');
  formData.append('includeFridays', 'true');
  formData.append('includeDefaultHolidays', 'false');
  // Formdata doesn't easily support arrays, but route.js likely defaults to all teaching days if not provided properly.

  try {
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data.topics, null, 2));
    
    fs.writeFileSync('test_output.json', JSON.stringify(data, null, 2));
    console.log("Successfully wrote to test_output.json");
  } catch (err) {
    console.error("Error during test:", err);
  }
}

testUserSyllabus();
