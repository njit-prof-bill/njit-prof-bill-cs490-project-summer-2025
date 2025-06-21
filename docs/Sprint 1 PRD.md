# Project Requirements Document: AI Resume Generator Project

## Legend: Requirement ID Convention

| Prefix  | Meaning                                   |
|---------|-------------------------------------------|
| `FT`    | File & Text Submission                    |
| `SH`    | Structured History (Contact, Skills, etc.)|
| `ST`    | Stretch Goal                              |

Each ID is followed by a three-digit number, incrementing within each category.

---

## Functional Requirements

### File & Text Submission

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| FT001          | Upload a PDF file                   | As a user, I want to upload my resume as a PDF so the system can parse its content. | The system should accept PDF file uploads and begin parsing upon submission. |
| FT002          | Upload a DOCX file                  | As a user, I want to upload my resume in DOCX format so it can be processed. | The system should accept DOCX file uploads and parse the content automatically. |
| FT003          | Upload an alternative format        | As a user, I want to upload resumes in alternative text formats like `.txt` or `.md` so I’m not restricted to PDF or DOCX. | The system should accept `.txt` and `.md` files and parse them as resume documents. |
| FT004          | Submit freeform biography text      | As a user, I want to write or paste a biography directly so I don’t need a resume file. | The system should provide a text area for users to enter freeform text and parse it after submission. |
| FT005          | Show visual feedback (spinner)      | As a user, I want to see that the system is working while processing my file or text. | A loading spinner or progress indicator should be shown during processing. |
| FT006          | Show confirmation or error message  | As a user, I want to know if my submission succeeded or failed. | The system should display a success message on completion or an error message if something goes wrong. |

---

### Structured History Sections

#### Contact Information

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| SH001          | Display primary email address       | As a user, I want to see the primary email parsed from my resume so I can verify its accuracy. | The system should display the extracted email address in a structured field. |
| SH002          | Edit and save primary email address | As a user, I want to correct or update my email address. | The system should allow editing and saving of the primary email field. |
| SH003          | Display primary phone number        | As a user, I want to see my phone number displayed so I can confirm it. | The phone number parsed should be displayed in a structured field. |
| SH004          | Edit and save primary phone number  | As a user, I want to update my phone number if it was parsed incorrectly. | The system should allow editing and saving of the phone number field. |

#### Career Objectives

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| SH005          | Display parsed career objective     | As a user, I want to see the career objective parsed from my resume. | The system should show the extracted career objective in its own section. |
| SH006          | Edit and save career objective      | As a user, I want to revise my career objective to better match my goals. | The system should allow inline editing and saving of this section. |

#### Skills

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| SH007          | Display parsed skills list          | As a user, I want to view the list of skills extracted from my resume. | Skills should be listed clearly, grouped if needed. |
| SH008          | Edit and save skills list           | As a user, I want to add or remove skills. | The system should allow editing of the skill list and save changes. |
| SH009          | Prevent duplicate skill entries     | As a user, I don’t want to accidentally enter the same skill more than once. | The system should prevent or warn about duplicate skill entries. |

#### Job History

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| SH010          | Display job history list            | As a user, I want to see my previous jobs listed. | The system should display job history items in chronological or parsed order. |
| SH011          | Display company name                | As a user, I want to see which companies I’ve worked for. | Each job entry should show the associated company name. |
| SH012          | Display job title                   | As a user, I want to verify that my job titles are correct. | Each job should show the parsed title. |
| SH013          | Display job description/summary     | As a user, I want to review how my job responsibilities are described. | The parsed job description should appear under each job. |
| SH014          | Display job start/end dates         | As a user, I want to verify when I held each position. | Start and end dates should be shown for each job. |
| SH015          | Display accomplishments             | As a user, I want to see the key results or responsibilities listed per job. | Bullet points or a summary section should show accomplishments. |
| SH016          | Edit and save all job fields        | As a user, I want to revise any aspect of my job history. | All job fields (title, dates, company, description) should be editable and savable. |

#### Education

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| SH017          | Display education list              | As a user, I want to see my educational background. | The system should show a list of education entries. |
| SH018          | Display school name                 | As a user, I want to confirm which schools are listed. | Each entry should display the school name. |
| SH019          | Display degree or certificate       | As a user, I want to verify my degree or program name. | Degree, diploma, or certificate type should be shown. |
| SH020          | Display education dates             | As a user, I want to see when I attended each institution. | Dates of attendance should appear for each education entry. |
| SH021          | Display GPA (if present)            | As a user, I want to check if my GPA was captured. | GPA should be displayed if it was included in the resume. |
| SH022          | Edit and save all education fields  | As a user, I want to update my education details. | All fields in the education section should be editable and changes saved. |

---

### Stretch Goals

| Requirement ID | Description                         | User Story | Expected Behavior/Outcome |
|----------------|-------------------------------------|------------|----------------------------|
| ST001          | Support multiple email addresses    | As a user, I want to add more than one email address. | The system should allow managing multiple email addresses. |
| ST002          | Support multiple phone numbers      | As a user, I want to provide several phone numbers. | Users should be able to enter and label more than one phone number. |
| ST003          | Display a “Re-parse history” button | As a user, I want to re-process the uploaded resume if I make changes to the file or text. | A button should trigger a full re-parse of the source resume data. |
| ST004          | Tabbed or section-based navigation  | As a user, I want to easily switch between sections like Skills and Education. | The UI should implement tabs or section-based navigation for ease of use. |
| ST005          | Visual indicator for unsaved changes| As a user, I want to know if I’ve made changes that haven’t been saved. | Unsaved changes should trigger a visual cue (e.g., icon, color highlight). |
| ST006          | Reorder skills                      | As a user, I want to arrange my skills in a specific order. | Skills should be draggable or otherwise re-orderable. |
| ST007          | Reorder job history items           | As a user, I want to adjust the order of my work experiences. | The job history list should support reordering via drag and drop or arrows. |
| ST008          | Reorder education items             | As a user, I want to change the order of my education entries. | The education list should be reorderable. |
